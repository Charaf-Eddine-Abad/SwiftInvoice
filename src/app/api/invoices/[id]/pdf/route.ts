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
    
    const { id } = params
    
    console.log('PDF generation request for invoice ID:', id)
    
    // Fetch invoice with client, items, organization, and customization
    console.log('Fetching invoice with ID:', id, 'for user:', session.user.id)
    
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        client: true,
        invoiceItems: true,
        user: {
          include: {
            organization: true,
            invoiceCustomization: true,
          }
        },
      }
    })
    
    console.log('Invoice found:', !!invoice)
    
    if (!invoice) {
      console.log('Invoice not found for ID:', id)
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    
    // Generate HTML content for PDF
    console.log('Generating HTML content for invoice:', invoice.invoiceNumber)
    console.log('Invoice data:', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      client: invoice.client?.name,
      itemsCount: invoice.invoiceItems?.length,
      hasOrganization: !!invoice.user?.organization,
      hasCustomization: !!invoice.user?.invoiceCustomization
    })
    
    let htmlContent
    try {
      htmlContent = generateInvoiceHTML(invoice)
      console.log('HTML content generated, length:', htmlContent.length)
    } catch (htmlError) {
      console.error('Error generating HTML:', htmlError)
      throw new Error(`HTML generation failed: ${htmlError instanceof Error ? htmlError.message : 'Unknown error'}`)
    }
    
    // Return HTML inline so the browser does not force a download
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Do not set Content-Disposition to avoid any download hints
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any) {
  try {
    console.log('Starting HTML generation for invoice:', invoice.invoiceNumber)
    
    if (!invoice || !invoice.invoiceItems || !Array.isArray(invoice.invoiceItems)) {
      throw new Error('Invoice items not found or not an array')
    }
    
    const subtotal = invoice.invoiceItems.reduce((sum: number, item: any) => {
      const total = Number(item.total)
      if (isNaN(total)) {
        console.warn('Invalid item total:', item)
        return sum
      }
      return sum + total
    }, 0)
    
    const taxAmount = (subtotal * Number(invoice.tax || 0)) / 100
    const finalTotal = subtotal + taxAmount - Number(invoice.discount || 0)
    
    console.log('Calculated totals:', { subtotal, taxAmount, finalTotal })
  
  // Get customization and organization data
  const customization = invoice.user?.invoiceCustomization || undefined
  const organization = invoice.user?.organization || undefined
  
  // Default values if no customization exists
  const primaryColor = customization?.primaryColor || '#2563eb'
  const secondaryColor = customization?.secondaryColor || '#1e40af'
  const accentColor = customization?.accentColor || '#3b82f6'
  const fontFamily = customization?.fontFamily || 'Inter'
  const templateStyle = customization?.templateStyle || 'modern'
  const showLogo = customization?.showLogo !== false
  const showCompanyInfo = customization?.showCompanyInfo !== false
  const footerText = customization?.footerText || ''
  const logoUrl = customization?.logoUrl || ''
  
  // Company name from organization or fallback
  const companyName = (organization && organization.name) || 'Your Company'
  
  // Generate different templates based on style - matching the preview exactly
  const generateTemplateHTML = () => {
    const baseStyles = `
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
      }
      body { font-family: '${fontFamily}', sans-serif; }
      .primary-color { background-color: ${primaryColor}; }
      .secondary-color { background-color: ${secondaryColor}; }
      .accent-color { color: ${accentColor}; }
    `

    const client = invoice.client || {}
    const companyInfoHTML = showCompanyInfo && organization && client ? `
      <div class="px-8 py-6 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div class="text-gray-700">
              <p class="font-medium">${client.name || 'Client'}</p>
              ${client.companyName ? `<p class="text-gray-600">${client.companyName}</p>` : ''}
              ${client.address ? `<p class="text-gray-600">${client.address}</p>` : ''}
              ${client.email ? `<p class="text-gray-600">${client.email}</p>` : ''}
              ${client.taxId ? `<p class="text-gray-600">Tax ID: ${client.taxId}</p>` : ''}
            </div>
          </div>
          <div class="md:text-right">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
            <div class="space-y-1 text-gray-700">
              <p><span class="font-medium">Issue Date:</span> ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</p>
              <p><span class="font-medium">Due Date:</span> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</p>
              <p><span class="font-medium">Status:</span> 
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                  ${invoice.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    ` : ''

    const itemsTableHTML = `
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
              ${Array.isArray(invoice.invoiceItems) ? invoice.invoiceItems.map((item: any) => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item?.description ?? ''}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${Number(item?.quantity ?? 0)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$${Number(item?.unitPrice ?? 0).toFixed(2)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">$${Number(item?.total ?? (Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0))).toFixed(2)}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>
    `

    const totalsHTML = `
      <div class="px-8 py-6 border-t border-gray-200">
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
    `


    const footerHTML = `
      <div class="px-8 py-6 border-t border-gray-200">
        <div class="text-center">
          <p class="text-gray-600 italic">Thank you for your business!</p>
          <p class="text-sm text-gray-500 mt-2">Generated by ${companyName}</p>
          ${footerText ? `<p class="text-sm text-gray-500 mt-1">${footerText}</p>` : ''}
        </div>
      </div>
    `

    // Generate different layouts based on template style - EXACTLY matching the preview
    switch (templateStyle) {
      case 'classic':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber || ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
    .classic-border { border: 2px solid ${primaryColor}; }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-4xl mx-auto classic-border">
    <div class="bg-white px-8 py-6 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          ${showLogo && logoUrl ? 
            `<img src="${logoUrl}" alt="Logo" class="h-12 mb-2" />` : 
            `<h1 class="text-3xl font-bold text-gray-900">${companyName}</h1>`
          }
          <p class="text-gray-600 mt-1">Professional Invoicing</p>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-bold text-gray-900">INVOICE</h2>
          <p class="text-gray-600">#${invoice.invoiceNumber || ''}</p>
        </div>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML}
    ${totalsHTML}
    ${footerHTML}
  </div>
</body>
</html>
        `

      case 'minimal':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber || ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
    .minimal-header { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white px-8 py-8 border-b border-gray-200">
      <div class="text-center">
        ${showLogo && logoUrl ? 
          `<img src="${logoUrl}" alt="Logo" class="h-16 mx-auto mb-4" />` : 
          `<h1 class="text-4xl font-light text-gray-900">${companyName}</h1>`
        }
        <h2 class="text-xl font-light mt-2 text-gray-900">INVOICE #${invoice.invoiceNumber || ''}</h2>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML}
    ${totalsHTML}
    ${footerHTML}
  </div>
</body>
</html>
        `

      case 'professional':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber || ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
    .professional-header { background: ${primaryColor}; border-bottom: 4px solid ${secondaryColor}; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-5xl mx-auto bg-white shadow-2xl">
    <div class="bg-white px-10 py-8 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          ${showLogo && logoUrl ? 
            `<img src="${logoUrl}" alt="Logo" class="h-16 mb-3" />` : 
            `<h1 class="text-4xl font-bold text-gray-900">${companyName}</h1>`
          }
          <p class="text-gray-600 text-lg">Professional Services</p>
        </div>
        <div class="text-right">
          <h2 class="text-3xl font-bold text-gray-900">INVOICE</h2>
          <p class="text-gray-600 text-lg">#${invoice.invoiceNumber || ''}</p>
        </div>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML}
    ${totalsHTML}
    ${footerHTML}
  </div>
</body>
</html>
        `

      default: // modern
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber || ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-white px-8 py-6 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          ${showLogo && logoUrl ? 
            `<img src="${logoUrl}" alt="Logo" class="h-12 mb-2" />` : 
            `<h1 class="text-3xl font-bold text-gray-900">${companyName}</h1>`
          }
          <p class="text-gray-600 mt-1">Professional Invoicing</p>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-bold text-gray-900">INVOICE</h2>
          <p class="text-gray-600">#${invoice.invoiceNumber || ''}</p>
        </div>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML}
    ${totalsHTML}
    ${footerHTML}
  </div>
</body>
</html>
        `
    }
  }

    return generateTemplateHTML()
  } catch (error) {
    console.error('Error in generateInvoiceHTML:', error)
    throw error
  }
}

