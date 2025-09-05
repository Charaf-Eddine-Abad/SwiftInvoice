import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a secure random string for NextAuth secret
 * @returns string - A secure random string
 */
export function generateSecret(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

