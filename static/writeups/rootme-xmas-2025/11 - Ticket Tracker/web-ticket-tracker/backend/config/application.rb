require_relative 'boot'
require 'rails'
require 'active_model/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'

Bundler.require(*Rails.groups)

module TicketTracker
  class Application < Rails::Application
    config.load_defaults 7.0
    config.api_only = true

    # Autoload lib directory
    config.eager_load_paths << Rails.root.join('lib')

    # Custom session store using file-based sessions
    config.session_store :disabled

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Flash

    # CORS for React frontend
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'http://localhost:3001', 'http://localhost:5173'
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: true
      end
    end
  end
end
