const cron = require('node-cron')
const fetch = require('node-fetch')

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here'

console.log('🕐 Starting SwiftInvoice Cron Service...')
console.log(`📡 App URL: ${APP_URL}`)

// Function to make authenticated requests
async function makeCronRequest(endpoint) {
  try {
    const response = await fetch(`${APP_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`✅ ${endpoint}: ${result.message}`)
    } else {
      console.error(`❌ ${endpoint}: ${result.error}`)
    }
  } catch (error) {
    console.error(`❌ ${endpoint}: ${error.message}`)
  }
}

// Schedule recurring invoices - every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
  console.log('🔄 Running recurring invoices cron job...')
  makeCronRequest('/api/cron/recurring')
}, {
  timezone: "UTC"
})

// Schedule reminders - every day at 10:00 AM  
cron.schedule('0 10 * * *', () => {
  console.log('📧 Running reminders cron job...')
  makeCronRequest('/api/cron/reminders')
}, {
  timezone: "UTC"
})

// Test runs (uncomment for testing)
// console.log('🧪 Running test cron jobs...')
// makeCronRequest('/api/cron/recurring')
// makeCronRequest('/api/cron/reminders')

console.log('⏰ Cron service is running...')
console.log('📅 Recurring invoices: Daily at 9:00 AM UTC')
console.log('📧 Reminders: Daily at 10:00 AM UTC')
console.log('🛑 Press Ctrl+C to stop')

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping cron service...')
  process.exit(0)
})
