require 'yaml'

SEMGREP_VERSION = `semgrep --version`.strip

HOST = 'https://semgrep.dev'

files = Dir['client/*.yaml', 'services/*.yaml', 'generated/*/vulns.yaml', 'generated/*/audit.yaml']

def process_rule(rule)
	return nil if rule['metadata'] && 
					rule['metadata']['repository_allowlist'] && 
					rule['metadata']['repository_allowlist'].include?(ENV['SEMGREP_REPO_NAME']) ||
					rule['metadata']['repository_blocklist'] && 
					!rule['metadata']['repository_blocklist'].include?(ENV['SEMGREP_REPO_NAME'])
	rule
end

rules = {'rules' => []}

files.each do |fname|
	begin
		irules = YAML.load(File.read(fname))['rules']
		puts "#{fname}: #{irules.length}"

		processed_rules = irules.map { |r| process_rule(r) }.compact
		rules['rules'].concat processed_rules
	rescue
		puts "Error in #{fname}"
	end
end

puts "#rules: #{rules['rules'].length}"

File.write("compound.yaml", YAML.dump(rules))

# require 'pry'
# binding.pry

