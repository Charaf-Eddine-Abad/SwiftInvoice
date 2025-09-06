const { PrismaClient } = require('@prisma/client')

async function fixInvoiceConstraint() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Fixing invoice number constraint...')
    
    // Drop the existing unique constraint on invoice_number
    await prisma.$executeRaw`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_invoice_number_key"`
    console.log('✅ Dropped old unique constraint')
    
    // Add composite unique constraint on user_id and invoice_number
    await prisma.$executeRaw`ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_invoice_number_key" UNIQUE ("user_id", "invoice_number")`
    console.log('✅ Added composite unique constraint')
    
    console.log('🎉 Invoice number constraint fixed successfully!')
    console.log('Now each user can have their own invoice numbering sequence.')
    
  } catch (error) {
    console.error('❌ Error fixing constraint:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixInvoiceConstraint()
