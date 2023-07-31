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
     'rust'
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
		rule['metadata']['source'] = "https://github.com/0xdea/semgrep-rules/blob/main/#{cpp_yaml_file}"
		if NONFREE_LICENSES.include? rule['metadata']['license']
			nonfree_rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		else 
			rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		end
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
		if NONFREE_LICENSES.include? rule['metadata']['license']
			nonfree_rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		else 
			rules[rule['id']] = rule unless BLOCKLIST.include?(rule['metadata']['source'])
		end
	end
end

rules.each do |k, v|
	if v['metadata']['category'] == 'security' && v['metadata']['subcategory'] != ['vuln'] && v['metadata']['subcategory'] != ['audit'] && v['metadata']['subcategory'] != 'vuln' && v['metadata']['subcategory'] != 'audit'
		security_noaudit_novuln_rules << v
	elsif v['metadata']['category'] == 'security' && (v['metadata']['subcategory'] == ['vuln'] || v['metadata']['subcategory'] == 'vuln')
		vuln_rules << v
	elsif v['metadata']['category'] == 'security' && (v['metadata']['subcategory'] == ['audit'] || v['metadata']['subcategory'] == 'audit')
		audit_rules << v
	else
		others_rules << v
	end
end

nonfree_rules.each do |k, v|
	if v['metadata']['category'] == 'security' && v['metadata']['subcategory'] != ['vuln'] && v['metadata']['subcategory'] != ['audit'] && v['metadata']['subcategory'] != 'vuln' && v['metadata']['subcategory'] != 'audit'
		nonfree_security_noaudit_novuln_rules << v
	elsif v['metadata']['category'] == 'security' && (v['metadata']['subcategory'] == ['vuln'] || v['metadata']['subcategory'] == 'vuln')
		nonfree_vuln_rules << v
	elsif v['metadata']['category'] == 'security' && (v['metadata']['subcategory'] == ['audit'] || v['metadata']['subcategory'] == 'audit')
		audit_rules << v
		nonfree_audit_rules << v
	else
		nonfree_others_rules << v
	end
end

OSS = "oss"
NONFREE = "nonfree"

VULNS_FILE = "vulns.yaml"
SECURITY_NOAUDIT_NOVULN_FILE = "security_noaudit_novuln.yaml"
AUDIT_FILE = "audit.yaml"
OTHERS_FILE = "others.yaml"

vuln_rules_id = Set.new vuln_rules.map { |o| o['id'] }
security_noaudit_novuln_rules_id = Set.new security_noaudit_novuln_rules.map { |o| o['id'] }
audit_rules_id = Set.new audit_rules.map { |o| o['id'] }
others_rules_id = Set.new others_rules.map { |o| o['id'] }

old_vuln_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{OSS}/#{VULNS_FILE}"))['rules'].map { |o| o['id'] }
old_security_noaudit_novuln_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{OSS}/#{SECURITY_NOAUDIT_NOVULN_FILE}"))['rules'].map { |o| o['id'] }
old_audit_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{OSS}/#{AUDIT_FILE}"))['rules'].map { |o| o['id'] }
old_others_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{OSS}/#{OTHERS_FILE}"))['rules'].map { |o| o['id'] }

nonfree_vuln_rules_id = Set.new nonfree_vuln_rules.map { |o| o['id'] }
nonfree_security_noaudit_novuln_rules_id = Set.new nonfree_security_noaudit_novuln_rules.map { |o| o['id'] }
nonfree_audit_rules_id = Set.new nonfree_audit_rules.map { |o| o['id'] }
nonfree_others_rules_id = Set.new nonfree_others_rules.map { |o| o['id'] }

old_nonfree_vuln_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{NONFREE}/#{VULNS_FILE}"))['rules'].map { |o| o['id'] }
old_nonfree_security_noaudit_novuln_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{NONFREE}/#{SECURITY_NOAUDIT_NOVULN_FILE}"))['rules'].map { |o| o['id'] }
old_nonfree_audit_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{NONFREE}/#{AUDIT_FILE}"))['rules'].map { |o| o['id'] }
old_nonfree_others_rules_id = Set.new YAML.load(File.read("#{GENERATED_DIR}/#{NONFREE}/#{OTHERS_FILE}"))['rules'].map { |o| o['id'] }

def format_diff(math_sym, diff)
	output = ""
	if diff.length > 0
		output += "\n#{diff.length} #{math_sym}\n"
	end
	output += diff.map { |elem| "#{math_sym} #{elem}" }.join("\n")
	output
end

puts """
# OSS Rules

vulns:
#{format_diff('-', old_vuln_rules_id - vuln_rules_id)}
#{format_diff('+', vuln_rules_id - old_vuln_rules_id)}

security noaudit novulns:
#{format_diff('-', old_security_noaudit_novuln_rules_id - security_noaudit_novuln_rules_id)}
#{format_diff('+', security_noaudit_novuln_rules_id - old_security_noaudit_novuln_rules_id)}

audit:
#{format_diff('-', old_audit_rules_id - audit_rules_id)}
#{format_diff('+', audit_rules_id - old_audit_rules_id)}

others:
#{format_diff('-', old_others_rules_id - others_rules_id)}
#{format_diff('+', others_rules_id - old_others_rules_id)}
"""

puts """
# Nonfree Rules

vulns:
#{format_diff('-', old_nonfree_vuln_rules_id - nonfree_vuln_rules_id)}
#{format_diff('+', nonfree_vuln_rules_id - old_nonfree_vuln_rules_id)}

security noaudit novulns:
#{format_diff('-', old_nonfree_security_noaudit_novuln_rules_id - nonfree_security_noaudit_novuln_rules_id)}
#{format_diff('+', nonfree_security_noaudit_novuln_rules_id - old_nonfree_security_noaudit_novuln_rules_id)}

audit:
#{format_diff('-', old_nonfree_audit_rules_id - nonfree_audit_rules_id)}
#{format_diff('+', nonfree_audit_rules_id - old_nonfree_audit_rules_id)}

others:
#{format_diff('-', old_nonfree_others_rules_id - nonfree_others_rules_id)}
#{format_diff('+', nonfree_others_rules_id - old_nonfree_others_rules_id)}

"""

FileUtils.mkdir_p("#{GENERATED_DIR}/#{OSS}")

File.write("#{GENERATED_DIR}/#{OSS}/#{VULNS_FILE}", YAML.dump({"rules" => vuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/#{OSS}/#{SECURITY_NOAUDIT_NOVULN_FILE}", YAML.dump({"rules" => security_noaudit_novuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/#{OSS}/#{AUDIT_FILE}", YAML.dump({"rules" => audit_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/#{OSS}/#{OTHERS_FILE}", YAML.dump({"rules" => others_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))

FileUtils.mkdir_p("#{GENERATED_DIR}/#{NONFREE}")

File.write("#{GENERATED_DIR}/#{NONFREE}/#{VULNS_FILE}", YAML.dump({"rules" => nonfree_vuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/#{NONFREE}/#{SECURITY_NOAUDIT_NOVULN_FILE}", YAML.dump({"rules" => nonfree_security_noaudit_novuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/#{NONFREE}/#{AUDIT_FILE}", YAML.dump({"rules" => nonfree_audit_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/#{NONFREE}/#{OTHERS_FILE}", YAML.dump({"rules" => nonfree_others_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))

# require 'pry'
# binding.pry

