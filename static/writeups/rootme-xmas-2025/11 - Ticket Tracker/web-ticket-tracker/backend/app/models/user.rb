class User < ApplicationRecord
  has_many :tickets, foreign_key: 'owner_id'

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :password, presence: true

  def authenticate(password_attempt)
    password == password_attempt
  end

  def admin?
    id == 1
  end
end
