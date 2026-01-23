class Api::AdminController < ApplicationController
  before_action :require_admin

  def tickets
    @tickets = Ticket.all

    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @tickets = @tickets.where(
        "title LIKE ? OR description LIKE ?",
        search_term,
        search_term
      )
    end

    if params[:sort].present?
      @tickets = @tickets.order(Arel.sql(params[:sort]))
    else
      @tickets = @tickets.order(created_at: :desc)
    end

    tickets_data = @tickets.map do |ticket|
      {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        visibility: ticket.visibility,
        owner_id: ticket.owner_id,
        owner_name: ticket.owner.name,
        owner_email: ticket.owner.email,
        attachments_count: ticket.attachments.count,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at
      }
    end

    render json: {
      tickets: tickets_data,
      total: @tickets.count
    }
  end

  def stats
    render json: {
      total_users: User.count,
      total_tickets: Ticket.count,
      public_tickets: Ticket.where(visibility: 'public').count,
      private_tickets: Ticket.where(visibility: 'private').count,
      total_attachments: Attachment.count
    }
  end

  private

  def require_admin
    unless @current_user && @current_user.id == 1
      render json: { error: 'Access denied.' }, status: 403
    end
  end
end
