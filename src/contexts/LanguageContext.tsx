'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clients',
    'nav.invoices': 'Invoices',
    'nav.recurring': 'Recurring',
    'nav.expenses': 'Expenses',
    'nav.reminders': 'Reminders',
    'nav.payments': 'Payments',
    'nav.settings': 'Settings',
    'nav.welcome': 'Welcome',
    'nav.signout': 'Sign out',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account settings and preferences',
    'settings.profile': 'Profile & Organization',
    'settings.branding': 'Invoice & Branding',
    'settings.security': 'Security & Privacy',
    'settings.preferences': 'App Preferences',
    
    // Profile & Organization
    'profile.personal': 'Personal Information',
    'profile.organization': 'Organization Information',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.company': 'Company Name',
    'profile.industry': 'Industry',
    'profile.address': 'Address',
    'profile.phone': 'Phone',
    'profile.edit': 'Edit',
    'profile.cancel': 'Cancel',
    'profile.save': 'Save Changes',
    'profile.notset': 'Not set',
    
    // Invoice & Branding
    'branding.template': 'Invoice Template',
    'branding.customize': 'Customize your invoice design and branding',
    'branding.redesign': 'Redesign Invoice Template',
    'branding.defaults': 'Default Settings',
    'branding.taxrate': 'Default Tax Rate (%)',
    'branding.discount': 'Default Discount ($)',
    
    // Security & Privacy
    'security.password': 'Change Password',
    'security.current': 'Current Password',
    'security.new': 'New Password',
    'security.confirm': 'Confirm New Password',
    'security.change': 'Change Password',
    'security.data': 'Data Management',
    'security.download': 'Download Personal Data',
    'security.downloaddesc': 'Download all your personal data in JSON format (GDPR compliance)',
    'security.downloadbtn': 'Download Data',
    'security.delete': 'Delete Account',
    'security.deletedesc': 'Permanently delete your account and all associated data',
    'security.deletebtn': 'Delete Account',
    
    // App Preferences
    'prefs.language': 'Language',
    'prefs.save': 'Save Preferences',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close'
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.clients': 'Clients',
    'nav.invoices': 'Factures',
    'nav.recurring': 'Récurrentes',
    'nav.expenses': 'Dépenses',
    'nav.reminders': 'Rappels',
    'nav.payments': 'Paiements',
    'nav.settings': 'Paramètres',
    'nav.welcome': 'Bienvenue',
    'nav.signout': 'Se déconnecter',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérez vos paramètres de compte et préférences',
    'settings.profile': 'Profil et Organisation',
    'settings.branding': 'Facturation et Marque',
    'settings.security': 'Sécurité et Confidentialité',
    'settings.preferences': 'Préférences de l\'application',
    
    // Profile & Organization
    'profile.personal': 'Informations personnelles',
    'profile.organization': 'Informations de l\'organisation',
    'profile.name': 'Nom',
    'profile.email': 'Email',
    'profile.company': 'Nom de l\'entreprise',
    'profile.industry': 'Secteur d\'activité',
    'profile.address': 'Adresse',
    'profile.phone': 'Téléphone',
    'profile.edit': 'Modifier',
    'profile.cancel': 'Annuler',
    'profile.save': 'Enregistrer les modifications',
    'profile.notset': 'Non défini',
    
    // Invoice & Branding
    'branding.template': 'Modèle de facture',
    'branding.customize': 'Personnalisez le design et la marque de votre facture',
    'branding.redesign': 'Repenser le modèle de facture',
    'branding.defaults': 'Paramètres par défaut',
    'branding.taxrate': 'Taux de taxe par défaut (%)',
    'branding.discount': 'Remise par défaut ($)',
    
    // Security & Privacy
    'security.password': 'Changer le mot de passe',
    'security.current': 'Mot de passe actuel',
    'security.new': 'Nouveau mot de passe',
    'security.confirm': 'Confirmer le nouveau mot de passe',
    'security.change': 'Changer le mot de passe',
    'security.data': 'Gestion des données',
    'security.download': 'Télécharger les données personnelles',
    'security.downloaddesc': 'Téléchargez toutes vos données personnelles au format JSON (conformité RGPD)',
    'security.downloadbtn': 'Télécharger les données',
    'security.delete': 'Supprimer le compte',
    'security.deletedesc': 'Supprimer définitivement votre compte et toutes les données associées',
    'security.deletebtn': 'Supprimer le compte',
    
    // App Preferences
    'prefs.language': 'Langue',
    'prefs.save': 'Enregistrer les préférences',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

