'use client'

import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: string
  disabled?: boolean
  onBlur?: () => void
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  className = "",
  error,
  disabled = false,
  onBlur
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pr-12 pl-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
            error ? 'border-destructive' : 'border-input'
          } ${disabled ? 'bg-muted cursor-not-allowed' : 'bg-background'} ${className}`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
