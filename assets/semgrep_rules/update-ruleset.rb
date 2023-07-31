require 'open-uri'
require 'json'
require 'set'
require 'fileutils'
require 'yaml'
require 'pp'

SEMGREP_VERSION = `semgrep --version`.strip
RULESETS = [
	'default',
	'xss',
	'security-audit',
	'nginx',
	'ci',
	'nginx',
	'docker',
	'terraform',
	'secrets',
	'owasp-top-ten',
	'cwe-top-25',
	'command-injection',
	'insecure-transport',
	'jwt',
	'sql-injection',
	'java',
	'flask',
	'javascript',
	'python',
	'react',
	'ruby',
	'nextjs',
	'nodejs',
	'kotlin',
	'supply-chain',
	'react-team-tier',
	'php-laravel',
	'insecure-transport-jsnode',
	'headless-browser',
	'terraform',
	'docker-compose',
	'dockerfile',
	'kubernetes',
	'eslint',
	'findsecbugs',
	'brakeman',
	'bandit',
	'flawfinder',
	'gitleaks',
	'gosec',
	'phpcs-security-audit',
	'security-code-scan',
	'mobsfscan',
	'wordpress',
	'react-best-practices',
	'trailofbits',
    'rust'
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
				pp keys			
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
	print "Downloading ruleset for /p/#{ruleset}: "
	ret = JSON.parse(URI.open("#{HOST}/c/p/#{ruleset}",
		"User-Agent" => "Semgrep/#{SEMGREP_VERSION} (command/unset)",
		"Accept" => "application/json",
		"Connection" => "keep-alive").read)['rules']
	puts ret.length

	ret.each do |rule|
		next if BLOCKLIST.include?(rule['metadata']['source'])

		categoriser << rule
	end
end

old_categories = Categoriser.from_files(GENERATED_DIR, "**/*.yaml")

puts fmt_diff(categoriser.diff(old_categories))

categoriser.write_files(GENERATED_DIR)

# require 'pry'
# binding.pry

