#!/bin/bash

rm -f /app/db/cdn.db
rm -rf /uploads/*
gunicorn --bind 0.0.0.0:80 --access-logfile - app:app
