import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/invoices/[id]/pdf - Generate PDF for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch invoice with client and items
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        client: true,
        invoiceItems: true,
        user: true,
      }
    })
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    
    // Generate HTML content for PDF
    const htmlContent = generateInvoiceHTML(invoice)
    
    // Return HTML content that can be converted to PDF on the client side
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any) {
  const subtotal = invoice.invoiceItems.reduce((sum: number, item: any) => sum + Number(item.total), 0)
  const taxAmount = (subtotal * Number(invoice.tax || 0)) / 100
  const finalTotal = subtotal + taxAmount - Number(invoice.discount || 0)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-gray-50 font-sans">
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-blue-600 px-8 py-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white">SwiftInvoice</h1>
          <p class="text-blue-100 mt-1">Professional Invoicing</p>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-bold text-white">INVOICE</h2>
          <p class="text-blue-100">#${invoice.invoiceNumber}</p>
        </div>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="px-8 py-6 border-b border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Bill To -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
          <div class="text-gray-700">
            <p class="font-medium">${invoice.client.name}</p>
            ${invoice.client.companyName ? `<p class="text-gray-600">${invoice.client.companyName}</p>` : ''}
            ${invoice.client.address ? `<p class="text-gray-600">${invoice.client.address}</p>` : ''}
            <p class="text-gray-600">${invoice.client.email}</p>
            ${invoice.client.taxId ? `<p class="text-gray-600">Tax ID: ${invoice.client.taxId}</p>` : ''}
          </div>
        </div>
        
        <!-- Invoice Info -->
        <div class="md:text-right">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
          <div class="space-y-1 text-gray-700">
            <p><span class="font-medium">Issue Date:</span> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><span class="font-medium">Due Date:</span> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><span class="font-medium">Status:</span> 
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }">${invoice.status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="px-8 py-6">
      <div class="overflow-hidden border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${invoice.invoiceItems.map((item: any) => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$${Number(item.unitPrice).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">$${Number(item.total).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Totals -->
    <div class="px-8 py-6 bg-gray-50 border-t border-gray-200">
      <div class="flex justify-end">
        <div class="w-80">
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Tax (${invoice.tax}%):</span>
              <span>$${taxAmount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Discount:</span>
              <span>$${Number(invoice.discount || 0).toFixed(2)}</span>
            </div>
            <div class="border-t border-gray-300 pt-2 mt-3">
              <div class="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total:</span>
                <span>$${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-8 py-6 bg-gray-100 border-t border-gray-200">
      <div class="text-center">
        <p class="text-gray-600 italic">Thank you for your business!</p>
        <p class="text-sm text-gray-500 mt-2">Generated by SwiftInvoice</p>
      </div>
    </div>
  </div>
  
  <script>
    // Auto-print when page loads
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `
}

