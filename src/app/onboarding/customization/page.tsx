'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CustomizationData {
  logoUrl: string
  fontFamily: string
  templateStyle: string
  showLogo: boolean
  showCompanyInfo: boolean
  footerText: string
}

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
  'Playfair Display',
  'Merriweather',
]

const templateStyles = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
  { id: 'classic', name: 'Classic', description: 'Traditional business layout' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
  { id: 'professional', name: 'Professional', description: 'Corporate and formal' },
]


export default function InvoiceCustomizationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [customization, setCustomization] = useState<CustomizationData>({
    logoUrl: '',
    fontFamily: 'Inter',
    templateStyle: 'modern',
    showLogo: true,
    showCompanyInfo: true,
    footerText: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadExistingCustomization()
    }
  }, [status, router])

  const loadExistingCustomization = async () => {
    try {
      const response = await fetch('/api/invoice-customization')
      if (response.ok) {
        const data = await response.json()
        if (data.customization) {
          setCustomization(prev => ({
            ...prev,
            ...data.customization
          }))
        }
      }
    } catch (error) {
      console.error('Error loading customization:', error)
    }
  }

  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')

  const handleUploadMethodChange = (method: 'file' | 'url') => {
    setUploadMethod(method)
  }

  const handleInputChange = (field: keyof CustomizationData, value: string | boolean) => {
    setCustomization(prev => ({ ...prev, [field]: value }))
  }


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCustomization(prev => ({ ...prev, logoUrl: data.logoUrl }))
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/invoice-customization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customization),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const error = await response.json()
        console.error('Error saving customization:', error)
        alert('Error saving customization. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving customization. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generatePreviewHTML = () => {
    const baseStyles = `
      body { font-family: '${customization.fontFamily}', sans-serif; }
    `

    const headerHTML = `
      <div class="bg-white px-8 py-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            ${customization.showLogo && customization.logoUrl ? 
              `<img src="${customization.logoUrl}" alt="Logo" class="h-12 mb-2" />` : 
              `<h1 class="text-3xl font-bold text-gray-900">Your Company</h1>`
            }
            <p class="text-gray-600 mt-1">Professional Invoicing</p>
          </div>
          <div class="text-right">
            <h2 class="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p class="text-gray-600">#INV-0001</p>
          </div>
        </div>
      </div>
    `

    const companyInfoHTML = customization.showCompanyInfo ? `
      <div class="px-8 py-6 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div class="text-gray-700">
              <p class="font-medium">Client Name</p>
              <p class="text-gray-600">Client Company</p>
              <p class="text-gray-600">client@example.com</p>
            </div>
          </div>
          <div class="md:text-right">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
            <div class="space-y-1 text-gray-700">
              <p><span class="font-medium">Issue Date:</span> ${new Date().toLocaleDateString()}</p>
              <p><span class="font-medium">Due Date:</span> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p><span class="font-medium">Status:</span> 
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 bg-blue-100 text-blue-800">
                  SENT
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
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sample Service</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">1</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">$100.00</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">$100.00</td>
              </tr>
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
                <span>$100.00</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Tax (10%):</span>
                <span>$10.00</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Discount:</span>
                <span>$0.00</span>
              </div>
              <div class="border-t border-gray-300 pt-2 mt-3">
                <div class="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total:</span>
                  <span>$110.00</span>
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
          <p class="text-sm text-gray-500 mt-2">Generated by Your Company</p>
          ${customization.footerText ? `<p class="text-sm text-gray-500 mt-1">${customization.footerText}</p>` : ''}
        </div>
      </div>
    `

    // Generate different layouts based on template style
    switch (customization.templateStyle) {
      case 'classic':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
    .classic-border { border: 2px solid #2563eb; }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-4xl mx-auto classic-border">
    ${headerHTML}
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
  <title>Invoice Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
  </style>
</head>
<body class="bg-white">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white px-8 py-8 border-b border-gray-200">
      <div class="text-center">
        ${customization.showLogo && customization.logoUrl ? 
          `<img src="${customization.logoUrl}" alt="Logo" class="h-16 mx-auto mb-4" />` : 
          `<h1 class="text-4xl font-light text-gray-900">Your Company</h1>`
        }
        <h2 class="text-xl font-light mt-2 text-gray-900">INVOICE #INV-0001</h2>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML}
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
  <title>Invoice Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-5xl mx-auto bg-white shadow-2xl">
    <div class="bg-white px-10 py-8 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          ${customization.showLogo && customization.logoUrl ? 
            `<img src="${customization.logoUrl}" alt="Logo" class="h-16 mb-3" />` : 
            `<h1 class="text-4xl font-bold text-gray-900">Your Company</h1>`
          }
          <p class="text-gray-600 text-lg">Professional Services</p>
        </div>
        <div class="text-right">
          <h2 class="text-3xl font-bold text-gray-900">INVOICE</h2>
          <p class="text-gray-600 text-lg">#INV-0001</p>
        </div>
      </div>
    </div>
    ${companyInfoHTML}
    ${itemsTableHTML}
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
  <title>Invoice Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
  </style>
</head>
<body class="bg-white">
  <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">
    ${headerHTML}
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Customize Your Invoice Design</h1>
          <p className="mt-2 text-muted-foreground">Make your invoices reflect your brand</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Logo
                </label>
                
                {/* Upload Method Selection */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={() => handleUploadMethodChange('file')}
                        className="mr-2"
                      />
                      <span className="text-sm text-foreground">Upload from computer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="url"
                        checked={uploadMethod === 'url'}
                        onChange={() => handleUploadMethodChange('url')}
                        className="mr-2"
                      />
                      <span className="text-sm text-foreground">Use URL</span>
                    </label>
                  </div>
                </div>

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && (
                      <p className="text-sm text-blue-600 mt-2">Uploading...</p>
                    )}
                    {customization.logoUrl && (
                      <div className="mt-2">
                        <img
                          src={customization.logoUrl}
                          alt="Current logo"
                          className="h-16 w-auto border rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div className="mb-4">
                    <Input
                      type="url"
                      value={customization.logoUrl}
                      onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Paste the URL of your logo image
                    </p>
                    {customization.logoUrl && (
                      <div className="mt-2">
                        <img
                          src={customization.logoUrl}
                          alt="Current logo"
                          className="h-16 w-auto border rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>



              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Font Family
                </label>
                <select
                  value={customization.fontFamily}
                  onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Style */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Template Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {templateStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleInputChange('templateStyle', style.id)}
                      className={`p-3 border rounded-md text-left transition-colors ${
                        customization.templateStyle === style.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <div className="font-medium text-foreground">{style.name}</div>
                      <div className="text-sm text-muted-foreground">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.showLogo}
                    onChange={(e) => handleInputChange('showLogo', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-foreground">Show company logo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.showCompanyInfo}
                    onChange={(e) => handleInputChange('showCompanyInfo', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-foreground">Show company information</span>
                </label>
              </div>

              {/* Footer Text */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Footer Text
                </label>
                <textarea
                  value={customization.footerText}
                  onChange={(e) => handleInputChange('footerText', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Thank you for your business!"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Customization'}
              </Button>
            </form>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={generatePreviewHTML()}
                  className="w-full h-96 border-0"
                  title="Invoice Preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
