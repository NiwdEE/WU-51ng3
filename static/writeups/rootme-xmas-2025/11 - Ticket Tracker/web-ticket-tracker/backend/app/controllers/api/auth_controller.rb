class Api::AuthController < ApplicationController
  skip_before_action :load_current_user, only: [:register, :login]

  def register
    user_params = params.require(:user).permit!

    user = User.new(user_params)

    if user.save
      render json: {
        message: 'User created successfully. Awaiting admin validation.'
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    email = params[:email]
    password = params[:password]

    user = User.find_by(email: email)

    if user&.authenticate(password)
      unless user.validated?
        render json: { error: 'Account not validated by admin' }, status: :forbidden
        return
      end

      session_id = CustomSessionStore.create_session(user.id)

      cookies[:session_id] = {
        value: session_id,
        httponly: true,
        same_site: :lax
      }

      render json: {
        message: 'Login successful',
        user: user.as_json(except: [:password])
      }
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def logout
    session_id = cookies[:session_id]
    CustomSessionStore.destroy_session(session_id) if session_id
    cookies.delete(:session_id)

    render json: { message: 'Logged out successfully' }
  end

  def me
    if @current_user
      render json: { user: @current_user.as_json(except: [:password]) }
    else
      render json: { error: 'Not authenticated' }, status: :unauthorized
    end
  end
end
