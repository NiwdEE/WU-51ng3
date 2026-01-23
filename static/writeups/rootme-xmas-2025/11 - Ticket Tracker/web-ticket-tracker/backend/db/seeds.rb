# Database seeds for TicketTracker application

puts "Seeding database..."

admin_email = ENV['ADMIN_EMAIL']
admin_password = ENV['ADMIN_PASSWORD']
admin_name = ENV['ADMIN_NAME']

admin = User.find_by(email: admin_email)

if admin
  puts "✓ Admin user already exists (#{admin_email})"
else
  admin = User.create!(
    email: admin_email,
    password: admin_password,
    name: admin_name,
    validated: true,
    role: 'admin'
  )
  puts "✓ Admin user created (#{admin_email})"
  puts "✓ Password stored in plain text: #{admin_password}"
end

welcome_ticket = admin.tickets.find_by(title: 'Welcome to TicketTracker')

if welcome_ticket
  puts "✓ Welcome ticket already exists"
else
  public_ticket = admin.tickets.create!(
    title: 'Welcome to TicketTracker',
    description: 'This is the welcome ticket visible to everyone. Feel free to explore the system!'
  )
  puts "✓ Welcome ticket created"
end

puts "\nDatabase seeding completed successfully!"