class CreateAttachments < ActiveRecord::Migration[7.0]
  def change
    create_table :attachments do |t|
      t.integer :ticket_id, null: false
      t.string :filename, null: false
      t.string :content_type
      t.string :file_path
      t.string :thumbnail_path

      t.timestamps
    end

    add_index :attachments, :ticket_id
    add_foreign_key :attachments, :tickets
  end
end
