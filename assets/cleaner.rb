#!/usr/bin/env ruby
require 'optparse'

class Matcher
  def initialize(*blocklist_files)
    @blocklist = []
    blocklist_files.each do |blf|
      next unless File.exist?(blf)

      blocklist = File.read(blf).split("\n").map(&:strip).reject(&:empty?)
      # remove empty lines and comments
      blocklist.reject! { |r| r.empty? || r.start_with?('#') }

      # remove all matching lines and report
      blocklist.reject! do |r|
        ret = r =~ /^[*@]+$/
        STDERR.puts "Warning: #{blf} contains a line with only asterisks/at, which will match everything" if ret
        ret
      end        

      @blocklist += blocklist
    end
  end

  def match?(line)
    @blocklist.each do |r|
      return true if File.fnmatch?("*#{r}*", line)
    end
    false
  end
end

options = {
  matcher: Matcher.new()
}
OptionParser.new do |opts|
  opts.banner = "Usage: reviewdog-adapter.rb [options]"

  opts.on("--svgo", "Add SVGO String") do |v|
    options[:svgo] = true
    options[:matcher] = Matcher.new("#{ENV["SCRIPTPATH"]}/dtd/blocklist.txt")
  end

  opts.on("--assignees", "Add Assignees String") do |v|
    options[:assignees] = true
  end

  opts.on("--sveltegrep", "Remove Extracted Script Extension, and use semgrep blocklist") do |v|
    options[:sveltegrep] = true
    options[:matcher] = Matcher.new("#{ENV["SCRIPTPATH"]}/semgrep_rules/blocklist.txt")
  end

  opts.on("--semgrep", "Use semgrep blocklist") do |v|
    options[:semgrep] = true
    options[:matcher] = Matcher.new("#{ENV["SCRIPTPATH"]}/semgrep_rules/blocklist.txt")
  end
end.parse!

STDIN.each_line(chomp: true).sort.uniq.to_a.each do |l|
  l.gsub!(/#{ENV['PWD']}/, '')

  l.gsub!(/\.extractedscript\.[hjlmst]*:/, ':') if options[:sveltegrep]

  l.gsub!('Source: null', 'Source: https://github.com/brave/security-action')

  if options[:svgo]
    l.gsub!(/$/, '<br><br>Run SVGO on your assets<br><br>')
  end

  if options[:assignees]
    if l =~ /,null$/
      l.gsub!(/,null$/, "<br>Cc #{ENV['ASSIGNEES']}")
    else
      l.gsub!(/,([^,]+)$/) { |_| "<br>Cc #{$1.split.map { |s| "@"+s }.join(' ')}" }
    end
  else
    l.gsub!(/$/, "<br>Cc #{ENV['ASSIGNEES']}")
  end

  puts l unless options[:matcher].match?(l)
end