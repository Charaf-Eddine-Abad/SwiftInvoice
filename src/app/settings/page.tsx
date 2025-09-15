'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import PasswordInput from '@/components/PasswordInput'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface User {
  id: string
  name: string
  email: string
  organization?: {
    id: string
    name: string
    industry?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country: string
    phone?: string
    email?: string
    website?: string
    taxId?: string
    currency: string
    timezone: string
    language: string
  }
  invoiceCustomization?: {
    id: string
    logoUrl?: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    templateStyle: string
    showLogo: boolean
    showCompanyInfo: boolean
    footerText?: string
  }
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { t, language, setLanguage } = useLanguage()
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const [userRes, orgRes, customRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/organization'),
        fetch('/api/invoice-customization')
      ])

      const userData = await userRes.json()
      const orgData = await orgRes.json()
      const customData = await customRes.json()

      setUser({
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        organization: orgData.organization,
        invoiceCustomization: customData.customization
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: t('settings.profile'), icon: '👤' },
    { id: 'branding', name: t('settings.branding'), icon: '🎨' },
    { id: 'security', name: t('settings.security'), icon: '🔒' },
    { id: 'preferences', name: t('settings.preferences'), icon: '⚙️' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <Card>
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <CardContent className="p-6">
            {activeTab === 'profile' && (
              <ProfileOrganizationTab user={user} onUpdate={fetchUserData} />
            )}
            {activeTab === 'branding' && (
              <InvoiceBrandingTab user={user} onUpdate={fetchUserData} />
            )}
            {activeTab === 'security' && (
              <SecurityPrivacyTab user={user} />
            )}
            {activeTab === 'preferences' && (
              <AppPreferencesTab user={user} onUpdate={fetchUserData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Profile & Organization Tab Component
function ProfileOrganizationTab({ user, onUpdate }: { user: User | null, onUpdate: () => void }) {
  const [editing, setEditing] = useState<'profile' | 'organization' | null>(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organizationName: user?.organization?.name || '',
    industry: user?.organization?.industry || '',
    address: user?.organization?.address || '',
    city: user?.organization?.city || '',
    state: user?.organization?.state || '',
    zipCode: user?.organization?.zipCode || '',
    country: user?.organization?.country || 'US',
    phone: user?.organization?.phone || '',
    organizationEmail: user?.organization?.email || '',
    website: user?.organization?.website || '',
    taxId: user?.organization?.taxId || ''
  })

  const handleSave = async (type: 'profile' | 'organization') => {
    try {
      if (type === 'profile') {
        const response = await fetch('/api/auth/update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email
          })
        })
        if (response.ok) {
          setEditing(null)
          onUpdate()
        }
      } else {
        const response = await fetch('/api/organization', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.organizationName,
            industry: formData.industry,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            phone: formData.phone,
            email: formData.organizationEmail,
            website: formData.website,
            taxId: formData.taxId
          })
        })
        if (response.ok) {
          setEditing(null)
          onUpdate()
        }
      }
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Personal Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <p className="text-sm text-muted-foreground">Personal information cannot be edited. Contact support if you need to make changes.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Name</label>
              <p className="mt-1 text-sm text-foreground bg-muted px-3 py-2 rounded-md border">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <p className="mt-1 text-sm text-foreground bg-muted px-3 py-2 rounded-md border">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organization Information</CardTitle>
            <Button
              variant="outline"
              onClick={() => setEditing(editing === 'organization' ? null : 'organization')}
            >
              {editing === 'organization' ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Company Name</label>
              {editing === 'organization' ? (
                <Input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{user?.organization?.name || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Industry</label>
              {editing === 'organization' ? (
                <Input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{user?.organization?.industry || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Address</label>
              {editing === 'organization' ? (
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{user?.organization?.address || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Phone</label>
              {editing === 'organization' ? (
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{user?.organization?.phone || 'Not set'}</p>
              )}
            </div>
          </div>
          
          {editing === 'organization' && (
            <div className="mt-4">
              <Button onClick={() => handleSave('organization')}>
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Invoice & Branding Tab Component
function InvoiceBrandingTab({ user, onUpdate }: { user: User | null, onUpdate: () => void }) {
  const [customization, setCustomization] = useState(user?.invoiceCustomization || {
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    templateStyle: 'modern',
    showLogo: true,
    showCompanyInfo: true,
    footerText: ''
  })

  const [defaults, setDefaults] = useState({
    taxRate: 10,
    discount: 0
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load user preferences when component mounts
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user-preferences')
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded preferences:', data.preferences) // Debug log
          setDefaults({
            taxRate: data.preferences.defaultTaxRate || 10,
            discount: data.preferences.defaultDiscount || 0
          })
        } else {
          console.error('Failed to load preferences:', response.status)
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
    loadPreferences()
  }, [])

  const handleSaveCustomization = async () => {
    try {
      const response = await fetch('/api/invoice-customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customization)
      })
      if (response.ok) {
        onUpdate()
        alert('Customization saved successfully!')
      }
    } catch (error) {
      console.error('Error saving customization:', error)
    }
  }

  const handleSaveDefaults = async () => {
    setSaving(true)
    try {
      console.log('Saving defaults:', { taxRate: defaults.taxRate, discount: defaults.discount }) // Debug log
      const response = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultTaxRate: defaults.taxRate,
          defaultDiscount: defaults.discount
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Save response:', data) // Debug log
        // Update local state with the saved values
        setDefaults({
          taxRate: data.preferences.defaultTaxRate,
          discount: data.preferences.defaultDiscount
        })
        alert('Default settings saved successfully!')
      } else {
        const error = await response.json()
        console.error('Save failed:', error) // Debug log
        alert(`Failed to save: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving defaults:', error)
      alert('Failed to save default settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRedesignInvoice = () => {
    window.open('/onboarding/customization', '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Invoice Template Section */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">Customize your invoice design and branding</p>
            <Button onClick={handleRedesignInvoice}>
              Redesign Invoice Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Default Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Default Tax Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={defaults.taxRate}
                onChange={(e) => setDefaults({ ...defaults, taxRate: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Default Discount ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={defaults.discount}
                onChange={(e) => setDefaults({ ...defaults, discount: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleSaveDefaults}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Default Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Security & Privacy Tab Component
function SecurityPrivacyTab({ user }: { user: User | null }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  })
  const validateCurrentPassword = async (password: string) => {
    if (!password) {
      setErrors(prev => ({ ...prev, currentPassword: '' }))
      return
    }

    // Only validate if password is at least 3 characters to avoid too many API calls
    if (password.length < 3) {
      setErrors(prev => ({ ...prev, currentPassword: '' }))
      return
    }

    try {
      const response = await fetch('/api/auth/validate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        setErrors(prev => ({ ...prev, currentPassword: '' }))
      } else {
        setErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }))
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, currentPassword: 'Error validating password' }))
    }
  }

  // Validate current password on blur (when user leaves the field)
  const handleCurrentPasswordBlur = () => {
    if (passwordForm.currentPassword) {
      validateCurrentPassword(passwordForm.currentPassword)
    }
  }

  const validateNewPassword = (password: string) => {
    if (!password) {
      setErrors(prev => ({ ...prev, newPassword: '' }))
      return
    }

    if (password.length < 6) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters long' }))
    } else {
      setErrors(prev => ({ ...prev, newPassword: '' }))
    }
  }

  const validateConfirmPassword = (password: string) => {
    if (!password) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
      return
    }

    if (password !== passwordForm.newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleChangePassword = async () => {
    // Clear general error
    setErrors(prev => ({ ...prev, general: '' }))

    // Validate all fields
    if (!passwordForm.currentPassword) {
      setErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }))
      return
    }

    if (!passwordForm.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: 'New password is required' }))
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters long' }))
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password changed successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setErrors({ currentPassword: '', newPassword: '', confirmPassword: '', general: '' })
      } else {
        if (data.error === 'Current password is incorrect') {
          setErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }))
        } else if (data.error === 'New password must be at least 6 characters long') {
          setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters long' }))
        } else {
          setErrors(prev => ({ ...prev, general: data.error || 'Failed to change password. Please try again.' }))
        }
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors(prev => ({ ...prev, general: 'Unexpected error occurred. Please try again.' }))
    }
  }

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/auth/download-data')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'my-data.json'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading data:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Account deleted successfully')
        window.location.href = '/'
      } else {
        alert('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.general && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Current Password</label>
              <PasswordInput
                value={passwordForm.currentPassword}
                onChange={(value) => {
                  setPasswordForm({ ...passwordForm, currentPassword: value })
                  // Clear error when user starts typing
                  if (errors.currentPassword) {
                    setErrors(prev => ({ ...prev, currentPassword: '' }))
                  }
                }}
                onBlur={handleCurrentPasswordBlur}
                placeholder="Enter current password"
                error={errors.currentPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">New Password</label>
              <PasswordInput
                value={passwordForm.newPassword}
                onChange={(value) => {
                  setPasswordForm({ ...passwordForm, newPassword: value })
                  validateNewPassword(value)
                }}
                placeholder="Enter new password"
                error={errors.newPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
              <PasswordInput
                value={passwordForm.confirmPassword}
                onChange={(value) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: value })
                  validateConfirmPassword(value)
                }}
                placeholder="Confirm new password"
                error={errors.confirmPassword}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Download Personal Data</h3>
                <p className="text-sm text-muted-foreground">Download all your personal data in JSON format (GDPR compliance)</p>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadData}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Download Data
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-destructive/80">Permanently delete your account and all associated data</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// App Preferences Tab Component
function AppPreferencesTab({ user, onUpdate }: { user: User | null, onUpdate: () => void }) {
  const { t, language, setLanguage } = useLanguage()
  const [preferences, setPreferences] = useState({
    language: user?.organization?.language || 'en'
  })

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ]

  const handleSavePreferences = async () => {
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: preferences.language
        })
      })
      if (response.ok) {
        // Update the language context
        setLanguage(preferences.language as 'en' | 'fr')
        onUpdate()
        alert(t('common.success'))
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('prefs.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="block w-full border-input rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'en' 
              ? 'Changing the language will update the entire website interface.'
              : 'Changer la langue mettra à jour toute l\'interface du site web.'
            }
          </p>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button onClick={handleSavePreferences}>
          {t('prefs.save')}
        </Button>
      </div>
    </div>
  )
}
