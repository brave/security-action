require 'yaml'

SEMGREP_VERSION = `semgrep --version`.strip

HOST = 'https://semgrep.dev'

files = Dir['client/*.yaml', 'services/*.yaml', 'frozen/*/vuln.yaml', 'frozen/*/audit.yml', 'generated/*/vulns.yaml', 'generated/*/audit.yaml']

rules = {'rules' => []}

files.each do |fname|
	begin
		irules = YAML.load(File.read(fname))['rules']
		puts "#{fname}: #{irules.length}"

		rules['rules'].concat irules
	rescue
		puts "Error in #{fname}"
	end
end

puts "#rules: #{rules['rules'].length}"

File.write("compound.yaml", YAML.dump(rules))

# require 'pry'
# binding.pry

