import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/invoices/[id]/pdf - Generate PDF for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let errorDetails = { step: 'init', detail: '' }
  try {
    errorDetails.step = 'session'
    const session = await getServerSession(authOptions)
    console.log('PDF Route - Session check:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      console.log('PDF Route - No valid session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    errorDetails.step = 'params'
    const { id } = await params
    console.log('PDF Route - Request params:', { id })
    
    if (!id) {
      console.log('PDF Route - No invoice ID provided')
      return NextResponse.json(
        { error: 'Invoice ID required' },
        { status: 400 }
      )
    }
    
    // Fetch invoice with only core tables that definitely exist
    errorDetails.step = 'database'
    console.log('PDF Route - Fetching invoice:', { id, userId: session.user.id })
    
    // SIMPLIFIED: Only query core tables, skip organization/customization
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        client: true,
        invoiceItems: true
      }
    })
    
    console.log('PDF Route - Invoice query result:', { 
      found: !!invoice,
      hasClient: !!invoice?.client,
      itemsCount: invoice?.invoiceItems?.length || 0
    })
    
    if (!invoice) {
      console.log('PDF Route - Invoice not found:', { id, userId: session.user.id })
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    
    // Generate HTML content for PDF
    errorDetails.step = 'html_generation'
    console.log('PDF Route - Starting HTML generation')
    
    let htmlContent
    try {
      htmlContent = await generateInvoiceHTML(invoice)
      console.log('PDF Route - HTML generated successfully, length:', htmlContent.length)
    } catch (htmlError) {
      console.error('PDF Route - HTML generation error:', htmlError)
      errorDetails.detail = `HTML generation error: ${htmlError instanceof Error ? htmlError.message : 'Unknown'}`
      throw new Error(`HTML generation failed: ${htmlError instanceof Error ? htmlError.message : 'Unknown error'}`)
    }
    
    errorDetails.step = 'response'
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
    console.error('PDF Route - Fatal error:', {
      step: errorDetails.step,
      detail: errorDetails.detail,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        step: errorDetails.step,
        // Include stack trace only in development
        ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    )
  }
}

async function generateInvoiceHTML(invoice: any) {
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
  
  // Load saved customization
  let customization: any = null
  try {
    customization = await prisma.invoiceCustomization.findUnique({ where: { userId: invoice.userId } })
    console.log('Loaded customization:', customization ? 'Found' : 'Not found', {
      hasLogo: !!customization?.logoUrl,
      style: customization?.templateStyle,
      showLogo: customization?.showLogo
    })
  } catch (e) {
    console.warn('Could not load customization:', e)
  }

  const primaryColor = customization?.primaryColor || '#2563eb'
  const secondaryColor = customization?.secondaryColor || '#1e40af'
  const accentColor = customization?.accentColor || '#3b82f6'
  const fontFamily = customization?.fontFamily || 'Inter'
  const templateStyle = (customization?.templateStyle || 'modern') as string
  const showLogo = customization?.showLogo ?? true
  const showCompanyInfo = customization?.showCompanyInfo ?? true
  const footerText = customization?.footerText || ''
  const logoUrl = customization?.logoUrl || ''
  const companyName = 'Your Company'
  
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
    const companyInfoHTML = showCompanyInfo && client ? `
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
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Items</h3>
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
    .classic-border { border: 3px double #333; padding: 24px; margin: 20px; }
    .classic-header { background: #f8f8f8; border-bottom: 2px solid #333; }
    .classic-title { font-family: 'Georgia', serif; letter-spacing: 2px; }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-4xl mx-auto classic-border">
    <div class="classic-header px-8 py-8">
      <div class="text-center">
        ${showLogo && logoUrl ? 
          `<img src="${logoUrl}" alt="Logo" class="h-16 mx-auto mb-4" />` : ''
        }
        <h1 class="classic-title text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
        <div class="text-lg text-gray-700">
          <span class="font-semibold">Invoice No:</span> ${invoice.invoiceNumber || 'N/A'}
        </div>
        <div class="text-gray-600 mt-2">
          <span class="font-semibold">Date:</span> ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}
        </div>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML.replace('rounded-lg', '').replace('bg-gray-50', 'bg-gray-100')}
    ${totalsHTML}
    <div class="px-8 py-6 border-t-2 border-gray-300 text-center">
      <p class="text-gray-700 font-serif italic">${footerText || 'Thank you for your business!'}</p>
      <p class="text-sm text-gray-500 mt-2">${companyName}</p>
    </div>
  </div>
</body>
</html>
        `

      case 'minimal':
        // Minimal style with clean lines and lots of whitespace
        const minimalItemsHTML = `
          <div class="mb-8">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-2 text-xs uppercase tracking-wide text-gray-500">Description</th>
                  <th class="text-right py-2 text-xs uppercase tracking-wide text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Array.isArray(invoice.invoiceItems) ? invoice.invoiceItems.map((item: any) => `
                  <tr class="border-b">
                    <td class="py-3">
                      <p class="font-light">${item?.description ?? ''}</p>
                      <p class="text-gray-500 text-sm">${Number(item?.quantity ?? 0)} × $${Number(item?.unitPrice ?? 0).toFixed(2)}</p>
                    </td>
                    <td class="text-right py-3 font-light">$${Number(item?.total ?? 0).toFixed(2)}</td>
                  </tr>
                `).join('') : ''}
              </tbody>
            </table>
          </div>
        `
        
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber || ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@100;300;400;500&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
    body { background: #fafafa; }
    .minimal-line { border-bottom: 1px solid #e0e0e0; }
    .minimal-text { color: #666; font-weight: 300; }
    .minimal-accent { color: ${primaryColor}; }
  </style>
</head>
<body>
  <div class="max-w-2xl mx-auto bg-white my-8">
    <div class="px-12 py-12">
      ${showLogo && logoUrl ? 
        `<img src="${logoUrl}" alt="Logo" class="h-12 mb-8" />` : ''
      }
      <div class="flex justify-between items-start mb-12">
        <div>
          <h1 class="text-3xl font-light minimal-accent mb-1">Invoice</h1>
          <p class="minimal-text text-sm">${invoice.invoiceNumber || ''}</p>
        </div>
        <div class="text-right">
          <p class="minimal-text text-sm">Date</p>
          <p class="font-light">${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</p>
        </div>
      </div>
      
      ${showCompanyInfo && client ? `
        <div class="minimal-line pb-8 mb-8">
          <p class="minimal-text text-xs uppercase tracking-wide mb-2">Bill To</p>
          <p class="font-normal">${client.name || ''}</p>
          ${client.companyName ? `<p class="minimal-text">${client.companyName}</p>` : ''}
          ${client.email ? `<p class="minimal-text text-sm">${client.email}</p>` : ''}
        </div>
      ` : ''}
      
      ${minimalItemsHTML}
      
      <div class="flex justify-end mb-12">
        <div class="w-48">
          <div class="flex justify-between py-1">
            <span class="minimal-text text-sm">Subtotal</span>
            <span class="font-light">$${subtotal.toFixed(2)}</span>
          </div>
          ${invoice.tax ? `
            <div class="flex justify-between py-1">
              <span class="minimal-text text-sm">Tax</span>
              <span class="font-light">$${taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${invoice.discount ? `
            <div class="flex justify-between py-1">
              <span class="minimal-text text-sm">Discount</span>
              <span class="font-light">-$${Number(invoice.discount).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between py-2 border-t mt-2">
            <span class="font-normal">Total</span>
            <span class="font-normal minimal-accent">$${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      ${footerText ? `<p class="text-center minimal-text text-sm">${footerText}</p>` : ''}
    </div>
  </div>
</body>
</html>
        `

      case 'professional':
        // Import the professional template
        const { generateProfessionalTemplate } = require('./professional-template')
        return generateProfessionalTemplate(invoice, client, subtotal, taxAmount, finalTotal, {
          primaryColor,
          secondaryColor,
          accentColor,
          fontFamily,
          showLogo,
          showCompanyInfo,
          footerText,
          logoUrl,
          companyName
        })

      default: // modern
        // Modern style with gradient accents and rounded corners
        const modernItemsHTML = `
          <div class="px-8 py-6">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Items</h3>
            <div class="overflow-hidden rounded-xl border" style="border-color: ${primaryColor}20">
              <table class="w-full">
                <thead style="background: linear-gradient(90deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                    <th class="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Qty</th>
                    <th class="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  ${Array.isArray(invoice.invoiceItems) ? invoice.invoiceItems.map((item: any, i: number) => `
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 text-sm text-gray-900">${item?.description ?? ''}</td>
                      <td class="px-6 py-4 text-sm text-gray-600 text-center">${Number(item?.quantity ?? 0)}</td>
                      <td class="px-6 py-4 text-sm text-gray-600 text-right">$${Number(item?.unitPrice ?? 0).toFixed(2)}</td>
                      <td class="px-6 py-4 text-sm font-semibold text-gray-900 text-right">$${Number(item?.total ?? 0).toFixed(2)}</td>
                    </tr>
                  `).join('') : ''}
                </tbody>
              </table>
            </div>
          </div>
        `
        
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
    .modern-gradient { background: linear-gradient(90deg, ${primaryColor}15 0%, ${secondaryColor}15 100%); }
    .modern-accent { color: ${primaryColor}; }
    .modern-border { border-color: ${primaryColor}20; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-4xl mx-auto my-8 bg-white rounded-2xl shadow-lg overflow-hidden">
    <div class="modern-gradient px-8 py-8 border-b modern-border">
      <div class="flex justify-between items-start">
        <div>
          ${showLogo && logoUrl ? 
            `<img src="${logoUrl}" alt="Logo" class="h-14 mb-3" />` : ''
          }
          <h1 class="text-3xl font-bold text-gray-800">${companyName}</h1>
          <p class="text-gray-600 mt-1">Invoice Document</p>
        </div>
        <div class="text-right bg-white rounded-xl px-6 py-4 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice</p>
          <p class="text-2xl font-bold modern-accent">${invoice.invoiceNumber || 'N/A'}</p>
          <p class="text-sm text-gray-600 mt-2">${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</p>
        </div>
      </div>
    </div>
    
    ${showCompanyInfo && client ? `
      <div class="px-8 py-6 border-b modern-border">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
            <div class="space-y-1">
              <p class="font-semibold text-gray-900">${client.name || ''}</p>
              ${client.companyName ? `<p class="text-gray-600">${client.companyName}</p>` : ''}
              ${client.address ? `<p class="text-gray-500 text-sm">${client.address}</p>` : ''}
              ${client.email ? `<p class="text-gray-500 text-sm">${client.email}</p>` : ''}
            </div>
          </div>
          <div class="md:text-right">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h3>
            <div class="space-y-1">
              <p class="text-gray-700">
                <span class="text-gray-500">Due:</span> 
                <span class="font-semibold">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
              </p>
              <p>
                <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                  invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }">
                  ${invoice.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
    
    ${modernItemsHTML}
    
    <div class="px-8 py-6">
      <div class="flex justify-end">
        <div class="w-72 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5">
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium">$${subtotal.toFixed(2)}</span>
            </div>
            ${invoice.tax ? `
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tax (${invoice.tax}%)</span>
                <span class="font-medium">$${taxAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${invoice.discount ? `
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Discount</span>
                <span class="font-medium">-$${Number(invoice.discount).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="border-t border-gray-300 pt-3 mt-3">
              <div class="flex justify-between">
                <span class="text-lg font-bold modern-accent">Total</span>
                <span class="text-lg font-bold modern-accent">$${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    ${footerText ? `
      <div class="modern-gradient px-8 py-6 text-center">
        <p class="text-gray-600 italic">${footerText}</p>
      </div>
    ` : ''}
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

