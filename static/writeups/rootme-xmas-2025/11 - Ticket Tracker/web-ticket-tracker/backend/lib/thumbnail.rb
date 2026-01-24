# frozen_string_literal: true

require 'fileutils'
require 'timeout'
require 'shellwords'

module Thumbnail
  CONVERT_BIN = (ENV['IMAGEMAGICK_CONVERT_COMMAND'] || 'convert').freeze
  GS_BIN = (ENV['GS_COMMAND'] || 'gs').freeze
  ALLOWED_TYPES = %w[image/bmp image/gif image/jpeg image/png image/webp application/pdf].freeze
  GENERATION_TIMEOUT = 30

  def self.generate(source, target, size, is_pdf = false)
    return nil unless convert_available?
    return nil if is_pdf && !gs_available?

    unless File.exist?(target)
      mime_type = File.open(source) { |f| Marcel::MimeType.for(f) }
      return nil unless ALLOWED_TYPES.include?(mime_type)
      return nil if is_pdf && mime_type != "application/pdf"

      directory = File.dirname(target)
      FileUtils.mkdir_p(directory)
      size_option = "#{size}x#{size}>"

      if is_pdf
        cmd = "#{shell_quote(CONVERT_BIN)} #{shell_quote("#{source}[0]")} -thumbnail #{shell_quote(size_option)} #{shell_quote("png:#{target}")}"
      else
        cmd = "#{shell_quote(CONVERT_BIN)} #{shell_quote(source)} -auto-orient -thumbnail #{shell_quote(size_option)} #{shell_quote(target)}"
      end

      pid = nil
      begin
        Timeout.timeout(GENERATION_TIMEOUT) do
          pid = Process.spawn(cmd)
          _, status = Process.wait2(pid)
          unless status.success?
            logger.error("Creating thumbnail failed (#{status.exitstatus}):\nCommand: #{cmd}")
            return nil
          end
        end
      rescue Timeout::Error
        Process.kill('KILL', pid) if pid
        logger.error("Creating thumbnail timed out:\nCommand: #{cmd}")
        return nil
      rescue => e
        logger.error("Creating thumbnail error: #{e.message}\nCommand: #{cmd}")
        return nil
      end
    end
    target
  end

  def self.convert_available?
    return @convert_available if defined?(@convert_available)

    begin
      `#{shell_quote(CONVERT_BIN)} -version`
      @convert_available = $?.success?
    rescue
      @convert_available = false
    end
    logger.warn("Imagemagick's convert binary (#{CONVERT_BIN}) not available") unless @convert_available
    @convert_available
  end

  def self.gs_available?
    return @gs_available if defined?(@gs_available)

    begin
      `#{shell_quote(GS_BIN)} -version`
      @gs_available = $?.success?
    rescue
      @gs_available = false
    end
    logger.warn("gs binary (#{GS_BIN}) not available") unless @gs_available
    @gs_available
  end

  def self.logger
    Rails.logger
  end

  def self.shell_quote(string)
    Shellwords.escape(string)
  end
end
