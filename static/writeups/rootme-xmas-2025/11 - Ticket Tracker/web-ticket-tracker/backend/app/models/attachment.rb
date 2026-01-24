class Attachment < ApplicationRecord
  belongs_to :ticket

  validates :filename, presence: true
  validates :content_type, presence: true
end
