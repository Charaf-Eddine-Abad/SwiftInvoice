export function generateProfessionalTemplate(
  invoice: any, 
  client: any,
  subtotal: number,
  taxAmount: number, 
  finalTotal: number,
  options: {
    primaryColor: string,
    secondaryColor: string,
    accentColor: string,
    fontFamily: string,
    showLogo: boolean,
    showCompanyInfo: boolean,
    footerText: string,
    logoUrl: string,
    companyName: string
  }
) {
  const { primaryColor, secondaryColor, accentColor, fontFamily, showLogo, showCompanyInfo, footerText, logoUrl, companyName } = options
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber || ''}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    body { font-family: '${fontFamily}', sans-serif; }
    .prof-header { 
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      color: white;
    }
    .prof-accent { background: ${accentColor}; }
    .prof-text-accent { color: ${primaryColor}; }
  </style>
</head>
<body class="bg-gray-100">
  <div class="max-w-5xl mx-auto bg-white shadow-xl">
    <div class="prof-header px-10 py-12">
      <div class="flex justify-between items-start">
        <div>
          ${showLogo && logoUrl ? 
            `<img src="${logoUrl}" alt="Logo" class="h-16 mb-4 brightness-0 invert" />` : ''
          }
          <h1 class="text-4xl font-bold mb-1">${companyName}</h1>
          <p class="opacity-90">Professional Invoice</p>
        </div>
        <div class="text-right">
          <div class="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
            <p class="text-sm opacity-90 mb-1">Invoice Number</p>
            <p class="text-2xl font-bold">${invoice.invoiceNumber || 'N/A'}</p>
            <p class="text-sm opacity-90 mt-2">${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="px-10 py-8">
      ${showCompanyInfo && client ? `
        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="text-xs uppercase tracking-wide text-gray-500 mb-3">Billed To</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="font-semibold prof-text-accent">${client.name || ''}</p>
              ${client.companyName ? `<p class="text-gray-700">${client.companyName}</p>` : ''}
              ${client.address ? `<p class="text-gray-600 text-sm mt-1">${client.address}</p>` : ''}
              ${client.email ? `<p class="text-gray-600 text-sm">${client.email}</p>` : ''}
            </div>
          </div>
          <div>
            <h3 class="text-xs uppercase tracking-wide text-gray-500 mb-3">Payment Details</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Due Date:</span>
                <span class="font-semibold">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                  invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }">
                  ${invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="mb-8">
        <h3 class="text-xs uppercase tracking-wide text-gray-500 mb-3">Invoice Items</h3>
        <div class="bg-gray-50 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="prof-accent text-white">
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Qty</th>
                <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Rate</th>
                <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${Array.isArray(invoice.invoiceItems) ? invoice.invoiceItems.map((item: any, index: number) => `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
                  <td class="px-6 py-4 text-sm text-gray-900">${item?.description ?? ''}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 text-center">${Number(item?.quantity ?? 0)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 text-right">$${Number(item?.unitPrice ?? 0).toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-900 text-right">$${Number(item?.total ?? 0).toFixed(2)}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="flex justify-end">
        <div class="w-80 bg-gray-50 rounded-lg p-6">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-semibold">$${subtotal.toFixed(2)}</span>
            </div>
            ${invoice.tax ? `
              <div class="flex justify-between">
                <span class="text-gray-600">Tax (${invoice.tax}%)</span>
                <span class="font-semibold">$${taxAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${invoice.discount ? `
              <div class="flex justify-between">
                <span class="text-gray-600">Discount</span>
                <span class="font-semibold">-$${Number(invoice.discount).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="border-t-2 border-gray-300 pt-3">
              <div class="flex justify-between">
                <span class="text-lg font-bold prof-text-accent">Total Due</span>
                <span class="text-lg font-bold prof-text-accent">$${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      ${footerText ? `
        <div class="text-center mt-8 pt-8 border-t border-gray-200">
          <p class="text-gray-600 italic">${footerText}</p>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `
}
