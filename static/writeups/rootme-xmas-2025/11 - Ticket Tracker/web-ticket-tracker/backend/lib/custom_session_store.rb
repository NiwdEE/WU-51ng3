require 'securerandom'
require 'json'

class CustomSessionStore
  SESSION_DIR = '/tmp'

  class << self
    def create_session(user_id)
      session_id = SecureRandom.hex(16)
      session_data = {
        user_id: user_id,
        created_at: Time.now.to_i
      }

      session_file = File.join(SESSION_DIR, "sess_#{session_id}")

      File.open(session_file, 'wb') do |file|
        file.write(Marshal.dump(session_data))
      end

      session_id
    end

    def load_session(session_id)
      return nil unless session_id

      session_file = File.join(SESSION_DIR, "sess_#{session_id}")
      return nil unless File.exist?(session_file)

      begin
        File.open(session_file, 'rb') do |file|
          Marshal.load(file.read)
        end
      rescue => e
        Rails.logger.error "Session load error: #{e.message}"
        nil
      end
    end

    def destroy_session(session_id)
      return unless session_id

      session_file = File.join(SESSION_DIR, "sess_#{session_id}")
      File.delete(session_file) if File.exist?(session_file)
    end

    def get_user_from_session(session_id)
      session_data = load_session(session_id)
      return nil unless session_data

      User.find_by(id: session_data[:user_id])
    end
  end
end
