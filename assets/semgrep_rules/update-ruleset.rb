require 'open-uri'
require 'json'
require 'set'
require 'fileutils'
require 'yaml'

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
]

HOST = 'https://semgrep.dev'
GENERATED_DIR = "#{__dir__}/generated/"
NONFREE_LICENSES = Set.new ['CC-BY-NC-SA-4.0', 'Commons Clause License Condition v1.0[LGPL-2.1-only]']

FileUtils.mkdir_p GENERATED_DIR

rules = {}
nonfree_rules = {}
vuln_rules = Set.new
nonfree_vuln_rules = Set.new
audit_rules = Set.new
nonfree_audit_rules = Set.new
security_noaudit_novuln_rules = Set.new
nonfree_security_noaudit_novuln_rules = Set.new
others_rules = Set.new
nonfree_others_rules = Set.new

BLOCKLIST = Set.new File.readlines("#{__dir__}/blocklist.txt").map(&:strip)

# 0xdea C++ ruleset
CPP_GITHUB_REPO = "0xdea/semgrep-rules"
CPP_GITHUB_REPO_API = "https://api.github.com/repos/#{CPP_GITHUB_REPO}/git/trees/main?recursive=0"
CPP_YAML_FILES = JSON.parse(URI.open(CPP_GITHUB_REPO_API).read)['tree'].map { |e| e['path'] }.select { |c| c =~ /^c\/.*\.yaml$/ }

CPP_YAML_FILES.each do |cpp_yaml_file|
	puts "Downloading ruleset for 0xdea/#{cpp_yaml_file}"
	ret = YAML.load(URI.open("https://raw.githubusercontent.com/#{CPP_GITHUB_REPO}/main/#{cpp_yaml_file}").read)['rules']

	ret.each do |rule|
		rule['metadata']['license'] = 'MIT' unless rule['metadata']['license']
		rule['metadata']['category'] = 'security'
		rule['metadata']['subcategory'] = ['audit'] unless rule['metadata']['subcategory']
		if NONFREE_LICENSES.include? rule['metadata']['license']
			nonfree_rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		else 
			rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		end
	end
end

RULESETS.each do |ruleset|
	puts "Downloading ruleset for /p/#{ruleset}"
	ret = JSON.parse(URI.open("#{HOST}/c/p/#{ruleset}",
		"User-Agent" => "Semgrep/#{SEMGREP_VERSION} (command/unset)",
		"Accept" => "application/json",
		"Connection" => "keep-alive").read)['rules']

	ret.each do |rule|
		if NONFREE_LICENSES.include? rule['metadata']['license']
			nonfree_rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		else 
			rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		end
	end
end

rules.each do |k, v|
	if v['metadata']['category'] == 'security' && v['metadata']['subcategory'] != ['vuln'] && v['metadata']['subcategory'] != ['audit']
		security_noaudit_novuln_rules << v
	elsif v['metadata']['category'] == 'security' && v['metadata']['subcategory'] == ['vuln']
		vuln_rules << v
	elsif v['metadata']['category'] == 'security' && v['metadata']['subcategory'] == ['audit']
		audit_rules << v
	else
		others_rules << v
	end
end

nonfree_rules.each do |k, v|
	if v['metadata']['category'] == 'security' && v['metadata']['subcategory'] != ['vuln'] && v['metadata']['subcategory'] != ['audit']
		nonfree_security_noaudit_novuln_rules << v
	elsif v['metadata']['category'] == 'security' && v['metadata']['subcategory'] == ['vuln']
		nonfree_vuln_rules << v
	elsif v['metadata']['category'] == 'security' && v['metadata']['subcategory'] == ['audit']
		nonfree_audit_rules << v
	else
		nonfree_others_rules << v
	end
end

puts "oss/vulns.yaml containing #{vuln_rules.length} rules"
puts "oss/audit.yaml containing #{audit_rules.length} rules"
puts "oss/others.yaml containing #{others_rules.length} rules"
puts "oss/security_noaudit_novuln.yaml containing #{security_noaudit_novuln_rules.length} rules"

FileUtils.mkdir_p("#{GENERATED_DIR}/oss")

File.write("#{GENERATED_DIR}/oss/vulns.yaml", YAML.dump({"rules" => vuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/oss/security_noaudit_novuln.yaml", YAML.dump({"rules" => security_noaudit_novuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/oss/audit.yaml", YAML.dump({"rules" => audit_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/oss/others.yaml", YAML.dump({"rules" => others_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))

puts "nonfree/vulns.yaml containing #{nonfree_vuln_rules.length} rules"
puts "nonfree/audit.yaml containing #{nonfree_audit_rules.length} rules"
puts "nonfree/others.yaml containing #{nonfree_others_rules.length} rules"
puts "nonfree/security_noaudit_novuln.yaml containing #{nonfree_security_noaudit_novuln_rules.length} rules"

FileUtils.mkdir_p("#{GENERATED_DIR}/nonfree")

File.write("#{GENERATED_DIR}/nonfree/vulns.yaml", YAML.dump({"rules" => nonfree_vuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/nonfree/security_noaudit_novuln.yaml", YAML.dump({"rules" => nonfree_security_noaudit_novuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/nonfree/audit.yaml", YAML.dump({"rules" => nonfree_audit_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/nonfree/others.yaml", YAML.dump({"rules" => nonfree_others_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))

# require 'pry'
# binding.pry

