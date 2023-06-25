# frozen_string_literal: true

require "active_record"

class Thing < ActiveRecord::Base
    def inject(params)
        Thing.first.where((((("potato = '" + params[:user][:name]) + "' AND password = '") + params[:user][:password]) + "'"))
    end
end