class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :load_current_user

  private

  def load_current_user
    session_id = cookies[:session_id]
    @current_user = CustomSessionStore.get_user_from_session(session_id) if session_id
  end

  def require_auth
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return false
    end
  end

  def require_validated
    unless @current_user&.validated?
      render json: { error: 'Account not validated by admin' }, status: :forbidden
      return false
    end
  end

  def require_admin
    unless @current_user&.admin?
      render json: { error: 'Admin access required' }, status: :forbidden
      return false
    end
  end
end
