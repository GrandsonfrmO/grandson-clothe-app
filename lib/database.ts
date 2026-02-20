import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { setDefaultResultOrder } from 'dns'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement en premier
if (typeof window === 'undefined') {
  dotenv.config({ path: '.env.local' })
}

// Force IPv4 preference to avoid IPv6 DNS issues
try {
  setDefaultResultOrder('ipv4first')
} catch (e) {
  console.warn('Could not set DNS order preference:', e)
}

// Configuration de la base de données PostgreSQL avec Supabase
let client: postgres.Sql | null = null
let db: ReturnType<typeof drizzle> | null = null

try {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.warn('⚠️ DATABASE_URL is not defined in environment variables')
  } else {
    console.log('🔗 Connecting to Supabase database...')
    console.log('🔍 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':***@')) // Masquer le mot de passe
    
    client = postgres(databaseUrl, {
      prepare: false,
      max: 10,
      connect_timeout: 10, // 10 secondes timeout
      idle_timeout: 20,
      max_lifetime: 60 * 30, // 30 minutes
      // Force IPv4 to avoid IPv6 DNS issues
      connection: {
        application_name: 'grandson-clothes-app',
      },
    })
    
    db = drizzle(client, { schema })
    console.log('✅ Database client initialized')
  }
} catch (error) {
  console.error('❌ Database initialization error:', error)
  client = null
  db = null
}

// Fallback: si db est null, on essaie de se reconnecter
if (!db && process.env.DATABASE_URL) {
  try {
    console.log('🔄 Attempting fallback connection...')
    client = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 10,
      connect_timeout: 10,
    })
    db = drizzle(client, { schema })
    console.log('✅ Fallback connection successful')
  } catch (error) {
    console.error('❌ Fallback connection failed:', error)
  }
}

export { db }

// Test de connexion
export async function testConnection() {
  try {
    if (!client || !db) {
      console.error('❌ Database client not initialized')
      console.log('Environment variables:')
      console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
      console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set')
      return false
    }
    
    console.log('🧪 Testing database connection...')
    const result = await client`SELECT NOW() as now, version() as version`
    console.log('✅ Database connected successfully!')
    console.log('- Time:', result[0].now)
    console.log('- Version:', result[0].version.split(' ')[0])
    return true
  } catch (error: any) {
    console.error('❌ Database connection failed:', error)
    
    // Diagnostic détaillé
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOTFOUND') {
      console.error('🔍 DNS Resolution failed. Possible causes:')
      console.error('  - Internet connection issue')
      console.error('  - Supabase project paused/deleted')
      console.error('  - Firewall blocking connection')
      console.error('  - DNS server issue')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Connection refused. Possible causes:')
      console.error('  - Wrong port number')
      console.error('  - Supabase service down')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🔍 Connection timeout. Possible causes:')
      console.error('  - Network latency issues')
      console.error('  - Firewall blocking connection')
    }
    
    return false
  }
}

// Fermeture propre de la connexion
export async function closeConnection() {
  if (client) {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}