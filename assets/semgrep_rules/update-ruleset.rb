require 'open-uri'
require 'json'
require 'set'
require 'fileutils'
require 'yaml'
require 'pp'

SEMGREP_VERSION = `semgrep --version`.strip
RULESETS = [
	'r/c.lang.security.insecure-use-memset.insecure-use-memset',
	'r/c.lang.security.info-leak-on-non-formatted-string.info-leak-on-non-formated-string',
	'r/c.lang.security.function-use-after-free.function-use-after-free',

	'p/default',
	'p/xss',
	'p/security-audit',
	'p/nginx',
	'p/ci',
	'p/nginx',
	'p/docker',
	'p/terraform',
	'p/secrets',
	'p/owasp-top-ten',
	'p/cwe-top-25',
	'p/command-injection',
	'p/insecure-transport',
	'p/jwt',
	'p/sql-injection',
	'p/java',
	'p/flask',
	'p/javascript',
	'p/python',
	'p/react',
	'p/ruby',
	'p/nextjs',
	'p/nodejs',
	'p/kotlin',
	'p/supply-chain',
	'p/react-team-tier',
	'p/php-laravel',
	'p/insecure-transport-jsnode',
	'p/headless-browser',
	'p/terraform',
	'p/docker-compose',
	'p/dockerfile',
	'p/kubernetes',
	'p/eslint',
	'p/findsecbugs',
	'p/brakeman',
	'p/bandit',
	'p/flawfinder',
	'p/gitleaks',
	'p/gosec',
	'p/phpcs-security-audit',
	'p/security-code-scan',
	'p/mobsfscan',
	'p/wordpress',
	'p/react-best-practices',
	'p/trailofbits',
	'p/rust',
	'p/c',
	'p/swift',
]

HOST = 'https://semgrep.dev'
GENERATED_DIR = "#{__dir__}/generated/"

FileUtils.mkdir_p GENERATED_DIR

BLOCKLIST = Set.new File.readlines("#{__dir__}/blocklist.txt").map(&:strip)

class Hash
	def recurse_add(*keys)
		if keys.length > 2
			k = keys.shift
			self[k] = {} unless self[k]
			self[k].recurse_add(*keys)
		elsif keys.length == 2
			self[keys[0]] = keys[1] 
		else
			raise NotImplementedError
		end
	end
end

class Categoriser
	attr_reader :categories

	NONFREE_LICENSES = Set.new ['CC-BY-NC-SA-4.0', 'Commons Clause License Condition v1.0[LGPL-2.1-only]']

	CATEGORIZER = {
		:security_noaudit_novuln => {
			rule: lambda { |rule| rule['metadata']['category'] == 'security' && rule['metadata']['subcategory'] != ['vuln'] && rule['metadata']['subcategory'] != ['audit'] && rule['metadata']['subcategory'] != 'vuln' && rule['metadata']['subcategory'] != 'audit' }
		},
		:vulns => {
			rule: lambda { |rule| rule['metadata']['category'] == 'security' && (rule['metadata']['subcategory'] == ['vuln'] || rule['metadata']['subcategory'] == 'vuln') }
		},
		:audit => {
			rule: lambda { |rule| rule['metadata']['category'] == 'security' && (rule['metadata']['subcategory'] == ['audit'] || rule['metadata']['subcategory'] == 'audit')}
		},
		:others => {
			rule: lambda { |_| true },
		} 
	}
	
	LICENSE_CATEGORIZER = {
		:nonfree => {
			rule: lambda { |rule| Categoriser::NONFREE_LICENSES.include? rule['metadata']['license'] },
			inner: Categoriser::CATEGORIZER
		},
		:oss => {
			rule: lambda { |_| true },
			inner: Categoriser::CATEGORIZER
		}
	}

	def initialize
		@categories = {}
	end

	def <<(other)
		recurse_add(other, LICENSE_CATEGORIZER, @categories)
	end

	def Categoriser.from_files(directory, filenames)
		c = Categoriser.new
		Dir.chdir(directory) do
			Dir[filenames].each do |fname|
				keys = fname[0..-6].split('/').map { |token| token.to_sym }	
				keys << YAML.load(File.read(fname))['rules']
				c.categories.recurse_add(*keys)
			end
		end
		c
	end

	def write_files(directory, c=nil)
		Dir.chdir(directory) do
			c = @categories if c == nil

			c.each do |key, value|
				if value.is_a? Set
					File.write("#{key}.yaml", YAML.dump({"rules" => value.to_a.sort {|a,b| a['id'] <=> b['id']}}))
				elsif value.is_a? Hash
					FileUtils.mkdir_p(key.to_s)
					self.write_files(key.to_s, c[key])
				end
			end
		end
	end

	# diff string
	def diff(other, base=nil, d=nil)
		other = other.categories if other.is_a? Categoriser
		base = @categories unless base
		d = {} unless d

		other.each do |key, value|
			d[key] = {} unless d[key]

			if value.is_a?(Set) or value.is_a?(Array)
				d[key]['+'] = Set.new(base[key]).map { |o| o['id'] } - Set.new(value).map { |o| o['id'] }
				d[key]['-'] = Set.new(value).map { |o| o['id'] } - Set.new(base[key]).map { |o| o['id'] }
			elsif value.is_a? Hash
				d[key].merge self.diff(value, base[key], d[key])
			end
		end
		
		d
	end

	private
	def recurse_add(other, categorizer, c)

		categorizer.each do |key, value|
			if value[:rule][other]
				if value[:inner]
					c[key] = {} unless c[key]

					recurse_add(other, value[:inner], c[key])
				else
					c[key] = Set.new unless c[key]

					c[key] << other
				end

				break
			end
		end
	end
end

def flatten_diff(hash)
	hash.each_with_object({}) do |(k, v), h|
		if v.is_a? Hash and not v.keys.include?('+')
			flatten_diff(v).map do |h_k, h_v|
				h["#{k}.#{h_k}".to_sym] = h_v
			end
		else 
			h[k] = v
		end
	end
end

def fmt_diff(diff)
	flat = flatten_diff(diff)
	s = ""

	flat.each do |key, value|
		s += "@ #{key} (+#{value['+'].length}, -#{value['-'].length})\n"
		['+', '-'].each do |sign|
			value[sign].each do |change|
				s += "#{sign} #{change}\n"
			end
		end
	end

	s
end

# 0xdea C++ ruleset
CPP_GITHUB_REPO = "0xdea/semgrep-rules"
CPP_GITHUB_REPO_API = "https://api.github.com/repos/#{CPP_GITHUB_REPO}/git/trees/main?recursive=0"
CPP_YAML_FILES = JSON.parse(URI.open(CPP_GITHUB_REPO_API).read)['tree'].map { |e| e['path'] }.select { |c| c =~ /^c\/.*\.yaml$/ }

categoriser = Categoriser.new

CPP_YAML_FILES.each do |cpp_yaml_file|
	puts "Downloading ruleset for 0xdea/#{cpp_yaml_file}"
	ret = YAML.load(URI.open("https://raw.githubusercontent.com/#{CPP_GITHUB_REPO}/main/#{cpp_yaml_file}").read)['rules']

	ret.each do |rule|
		next if BLOCKLIST.include?(rule['metadata']['source'])

		rule['metadata']['license'] = 'MIT' unless rule['metadata']['license']
		rule['metadata']['category'] = 'security'
		rule['metadata']['subcategory'] = ['audit'] unless rule['metadata']['subcategory']
		rule['metadata']['source'] = "https://github.com/0xdea/semgrep-rules/blob/main/#{cpp_yaml_file}"

		categoriser << rule
	end
end

RULESETS.each do |ruleset|
	print "Downloading ruleset for /#{ruleset}: "
	ret = JSON.parse(URI.open("#{HOST}/c/#{ruleset}",
		"User-Agent" => "Semgrep/#{SEMGREP_VERSION} (command/unset)",
		"Accept" => "application/json",
		"Connection" => "keep-alive").read)['rules']
	puts ret.length

	ret.each do |rule|
		next if BLOCKLIST.include?(rule['metadata']['source'])
		next if rule['patterns'] && rule['patterns'][0]['pattern'] == 'a()' && rule['patterns'][1]['pattern'] == 'b()'
		next if rule['patterns'] && rule['patterns'][0]['pattern'] == 'a' && rule['patterns'][1]['pattern'] == 'b'

		# Fix improper metadata
		if rule['id'] == 'python.lang.security.audit.subprocess-shell-true.subprocess-shell-true'
			rule['metadata']['category'] = 'security'
			rule['metadata']['subcategory'] = ['audit']
		end

		categoriser << rule
	end
end

old_categories = Categoriser.from_files(GENERATED_DIR, "**/*.yaml")

puts fmt_diff(categoriser.diff(old_categories))

categoriser.write_files(GENERATED_DIR)

# require 'pry'
# binding.pry

