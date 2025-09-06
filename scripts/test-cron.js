const fetch = require('node-fetch')

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here'

async function testCronJobs() {
  console.log('🧪 Testing SwiftInvoice Cron Jobs...')
  console.log(`📡 App URL: ${APP_URL}`)
  console.log('')

  // Test recurring invoices
  console.log('🔄 Testing recurring invoices...')
  try {
    const response = await fetch(`${APP_URL}/api/cron/recurring`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`✅ Recurring invoices: ${result.message}`)
      if (result.results && result.results.length > 0) {
        result.results.forEach(r => {
          console.log(`   - ${r.status}: ${r.invoiceNumber || r.error}`)
        })
      }
    } else {
      console.error(`❌ Recurring invoices: ${result.error}`)
    }
  } catch (error) {
    console.error(`❌ Recurring invoices: ${error.message}`)
  }

  console.log('')

  // Test reminders
  console.log('📧 Testing reminders...')
  try {
    const response = await fetch(`${APP_URL}/api/cron/reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`✅ Reminders: ${result.message}`)
      if (result.results && result.results.length > 0) {
        result.results.forEach(r => {
          console.log(`   - ${r.status}: ${r.invoiceNumber || r.error}`)
        })
      }
    } else {
      console.error(`❌ Reminders: ${result.error}`)
    }
  } catch (error) {
    console.error(`❌ Reminders: ${error.message}`)
  }

  console.log('')
  console.log('🎉 Cron job testing completed!')
}

testCronJobs()
