import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// Firebase project config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
}

console.log('=== Firebase Config Check ===')
console.log('API Key:', firebaseConfig.apiKey ? '✓ Set' : '✗ Missing')
console.log('Auth Domain:', firebaseConfig.authDomain ? '✓ Set' : '✗ Missing')
console.log('Project ID:', firebaseConfig.projectId ? '✓ Set' : '✗ Missing')
console.log('Database URL:', firebaseConfig.databaseURL ? '✓ Set' : '✗ Missing')

// Validate config
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId']
const missingFields = requiredFields.filter(
  (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
)

if (missingFields.length > 0) {
  console.error('❌ Missing Firebase config fields:', missingFields)
  console.error('Please check your .env.local file')
}

// Initialize Firebase
let app: ReturnType<typeof initializeApp>
try {
  app = initializeApp(firebaseConfig)
  console.log('✓ Firebase initialized successfully')
} catch (err) {
  console.error('❌ Firebase initialization error:', err)
  throw err
}

// Initialize Firebase Authentication
export const auth = getAuth(app)
console.log('✓ Auth initialized')

// Initialize Realtime Database
export const database = getDatabase(app)
console.log('✓ Database initialized')

export default app
