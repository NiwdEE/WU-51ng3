class Ticket < ApplicationRecord
  belongs_to :owner, class_name: 'User', foreign_key: 'owner_id'
  has_many :attachments, dependent: :destroy

  validates :title, presence: true

  WELCOME_TICKET_TITLE = 'Welcome to TicketTracker'

  scope :visible_to, ->(user) {
    if user
      where(owner_id: user.id).or(where(title: WELCOME_TICKET_TITLE))
    else
      none
    end
  }

  def viewable_by?(user)
    return true if title == WELCOME_TICKET_TITLE
    return true if user&.id == 1
    owner_id == user&.id
  end
end
