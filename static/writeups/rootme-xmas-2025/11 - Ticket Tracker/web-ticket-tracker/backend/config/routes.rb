Rails.application.routes.draw do
  namespace :api do
    post 'register', to: 'auth#register'
    post 'login', to: 'auth#login'
    get 'logout', to: 'auth#logout'
    get 'me', to: 'auth#me'

    get 'admin/tickets', to: 'admin#tickets'
    get 'admin/stats', to: 'admin#stats'

    resources :tickets, only: [:index, :show, :create] do
      member do
        post 'attachments', to: 'tickets#upload_attachment'
      end
    end
  end
end
