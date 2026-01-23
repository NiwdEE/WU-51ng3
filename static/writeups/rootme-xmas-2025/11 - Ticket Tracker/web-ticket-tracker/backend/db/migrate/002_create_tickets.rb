class CreateTickets < ActiveRecord::Migration[7.0]
  def change
    create_table :tickets do |t|
      t.string :title, null: false
      t.text :description
      t.integer :owner_id, null: false
      t.string :visibility, default: 'public'

      t.timestamps
    end

    add_index :tickets, :owner_id
    add_foreign_key :tickets, :users, column: :owner_id
  end
end
