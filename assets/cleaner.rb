#!/usr/bin/env ruby
require 'optparse'

options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: reviewdog-adapter.rb [options]"

  opts.on("--svgo", "Add SVGO String") do |v|
    options[:svgo] = true
  end

  opts.on("--assignees", "Add SVGO String") do |v|
    options[:assignees] = true
  end

  opts.on("--sveltegrep", "Remove Extracted Script Extension") do |v|
    options[:sveltegrep] = true
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
      l.gsub!(/,null$/, "Cc @brave\/sec-team #{ENV['ASSIGNEES']}")
    else
      l.gsub!(/,([^,]+)$/) { |_| "Cc #{$1.split.map { |s| "@"+s }.join(' ')}" }
    end
  else
    l.gsub!(/$/, "Cc @brave\/sec-team #{ENV['ASSIGNEES']}")
  end

  puts l
end