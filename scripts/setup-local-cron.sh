#!/bin/bash

# Setup local cron jobs for development
# This script adds cron jobs to your local system

echo "Setting up local cron jobs for SwiftInvoice..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Create cron job entries
CRON_RECURRING="0 9 * * * cd $PROJECT_DIR && curl -X POST http://localhost:3000/api/cron/recurring -H 'Authorization: Bearer your-cron-secret-here'"
CRON_REMINDERS="0 10 * * * cd $PROJECT_DIR && curl -X POST http://localhost:3000/api/cron/reminders -H 'Authorization: Bearer your-cron-secret-here'"

# Add to crontab
(crontab -l 2>/dev/null; echo "$CRON_RECURRING") | crontab -
(crontab -l 2>/dev/null; echo "$CRON_REMINDERS") | crontab -

echo "✅ Cron jobs added successfully!"
echo "📅 Recurring invoices will run daily at 9:00 AM"
echo "📧 Reminders will run daily at 10:00 AM"
echo ""
echo "To view your cron jobs: crontab -l"
echo "To remove cron jobs: crontab -r"
