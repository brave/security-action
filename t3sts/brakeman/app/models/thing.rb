# frozen_string_literal: true

require "active_record"

class Thing < ActiveRecord::Base
    def inject(params)
        Thing.first.where((((("username = '" + params[:user][:name]) + "' AND password = '") + params[:user][:password]) + "'"))
    end
end