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
=begin
	'bandit',
	'brakeman',
	'eslint',
	'findsecbugs',
	'flawfinder',
	'gitleaks',
	'gosec',
	'phpcs-security-audit',
	'security-code-scan',

	'docker-compose',
	'dockerfile',
	'kubernetes',
	'nginx',
	'terraform',

	'nextjs',
	'nodejs',
	'kotlin',
	'mobsfscan',
	'wordpress',
	'php-laravel',
	'trailofbits',
	'supply-chain',
	'react-team-tier',
	'headless-browser',
	'insecure-transport-jsnode',
	'react-best-practices'
=end
]

HOST = 'https://semgrep.dev'
GENERATED_DIR = "#{__dir__}/generated/"

FileUtils.mkdir_p GENERATED_DIR

rules = {}
vuln_rules = Set.new
audit_rules = Set.new
security_noaudit_novuln_rules = Set.new
others_rules = Set.new

BLOCKLIST = Set.new File.readlines("#{__dir__}/blocklist.txt").map(&:strip)

RULESETS.each do |ruleset|
	puts "Downloading ruleset for /p/#{ruleset}"
	ret = JSON.parse(URI.open("#{HOST}/c/p/#{ruleset}",
		"User-Agent" => "Semgrep/#{SEMGREP_VERSION} (command/unset)",
		"Accept" => "application/json",
		"Connection" => "keep-alive").read)['rules']

	ret.each do |rule|
		rules[rule['id']] = rule unless BLOCKLIST.include? rule['metadata']['source']
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

puts "vulns.yaml containing #{vuln_rules.length} rules"
puts "audit.yaml containing #{audit_rules.length} rules"
puts "others.yaml containing #{others_rules.length} rules"
puts "security_noaudit_novuln.yaml containing #{security_noaudit_novuln_rules.length} rules"

File.write("#{GENERATED_DIR}/vulns.yaml", YAML.dump({"rules" => vuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/security_noaudit_novuln.yaml", YAML.dump({"rules" => security_noaudit_novuln_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/audit.yaml", YAML.dump({"rules" => audit_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))
File.write("#{GENERATED_DIR}/others.yaml", YAML.dump({"rules" => others_rules.to_a.sort {|a,b| a['id'] <=> b['id']}}))

# require 'pry'
# binding.pry

