import { createAuthClient } from "better-auth/react"

// Determine if we're in production based on environment variables
const isProduction = process.env.NODE_ENV === 'production';

// Set the appropriate base URL depending on environment
const baseURL = isProduction 
  ? 'https://battleship-woad.vercel.app/' 
  : 'http://localhost:3000';

export const authClient = createAuthClient({
    baseURL,
})

export const { signIn, signUp, signOut } = authClient;