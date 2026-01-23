#!/bin/bash
set -e

if [ -z "$SECRET_KEY_BASE" ]; then
  export SECRET_KEY_BASE=$(bundle exec rails secret)
  echo "✓ SECRET_KEY_BASE generated"
else
  echo "✓ Using provided SECRET_KEY_BASE"
fi

# Remove existing server PID if any
rm -f tmp/pids/server.pid

# Run database setup
echo "Setting up database..."
bundle exec rake db:create db:migrate db:seed

# Start Rails server in background
echo "Starting Rails server..."
bundle exec rails server -b 0.0.0.0 -e production &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:3000/api/me > /dev/null 2>&1; then
    echo "✓ Server is ready!"
    break
  fi
  sleep 1
done

# Verify everything is working
echo "Checking admin account..."
response=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  -w "\n%{http_code}")

code=$(echo "$response" | tail -n1)

if [ "$code" = "200" ]; then
    echo "Admin connection successful"
else
    echo "Admin connection failure (HTTP $code)"
fi

wait $SERVER_PID