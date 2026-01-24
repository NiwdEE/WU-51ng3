require 'fileutils'
require 'shellwords'
require_relative '../../../lib/thumbnail'

class Api::TicketsController < ApplicationController
  before_action :require_auth
  before_action :require_validated, only: [:create, :upload_attachment]

  def index
    tickets = Ticket.visible_to(@current_user)
    render json: {
      tickets: tickets.map { |t|
        t.as_json.merge(
          owner_name: t.owner.name,
          attachments_count: t.attachments.count
        )
      }
    }
  end

  def show
    ticket = Ticket.find_by(id: params[:id])

    unless ticket
      render json: { error: 'Ticket not found' }, status: :not_found
      return
    end

    unless ticket.viewable_by?(@current_user)
      render json: { error: 'Access denied' }, status: :forbidden
      return
    end

    render json: {
      ticket: ticket.as_json.merge(
        owner_name: ticket.owner.name,
        attachments: ticket.attachments.as_json
      )
    }
  end

  def create
    ticket = @current_user.tickets.new(ticket_params)

    if ticket.save
      render json: {
        message: 'Ticket created successfully',
        ticket: ticket.as_json
      }, status: :created
    else
      render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def upload_attachment
    ticket = Ticket.find_by(id: params[:id])

    unless ticket
      render json: { error: 'Ticket not found' }, status: :not_found
      return
    end

    unless ticket.owner_id == @current_user.id || @current_user.admin?
      render json: { error: 'Access denied' }, status: :forbidden
      return
    end

    file = params[:file]

    unless file
      render json: { error: 'No file provided' }, status: :bad_request
      return
    end

    upload_dir = Rails.root.join('public', 'uploads')
    FileUtils.mkdir_p(upload_dir)

    filename = "#{SecureRandom.hex(8)}_#{file.original_filename}"
    file_path = upload_dir.join(filename)

    file_content = file.read

    File.open(file_path, 'wb') do |f|
      f.write(file_content)
    end

    mime_type = File.open(file_path) { |f| Marcel::MimeType.for(f) }

    allowed_types = Thumbnail::ALLOWED_TYPES
    unless allowed_types.include?(mime_type)
      File.delete(file_path) if File.exist?(file_path)
      render json: {
        error: "Invalid file type. Detected: #{mime_type}. Only #{allowed_types.join(', ')} allowed."
      }, status: :bad_request
      return
    end

    is_pdf = mime_type == 'application/pdf'

    attachment = ticket.attachments.create!(
      filename: file.original_filename,
      content_type: mime_type,
      file_path: "/uploads/#{filename}"
    )

    if is_pdf || mime_type.start_with?('image/')
      generate_thumbnail(file_path, attachment, is_pdf)
    end

    render json: {
      message: 'File uploaded successfully',
      attachment: attachment.as_json
    }, status: :created
  end

  private

  def ticket_params
    params.require(:ticket).permit(:title, :description)
  end

  def generate_thumbnail(source_path, attachment, is_pdf = false)
    begin
      thumbnail_filename = "thumb_#{File.basename(source_path, '.*')}.png"
      thumbnail_path = Rails.root.join('public', 'uploads', thumbnail_filename)

      result = Thumbnail.generate(source_path.to_s, thumbnail_path.to_s, 300, is_pdf)

      if result && File.exist?(thumbnail_path) && File.size(thumbnail_path) > 0
        attachment.update(thumbnail_path: "/uploads/#{thumbnail_filename}")
        Rails.logger.info "Thumbnail generated successfully: #{thumbnail_path}"
      else
        Rails.logger.warn "Thumbnail generation returned nil or file not created for #{source_path}"
      end

    rescue => e
      Rails.logger.error "Thumbnail generation error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end
end
