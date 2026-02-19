import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://zyhqiwaudcilqwrcckdq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aHFpd2F1ZGNpbHF3cmNja2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NjYyNSwiZXhwIjoyMDg1NzMyNjI1fQ.ubuFLkzLZ06ufH8gNsKEpWDz7r_mc4fS9eFWnu6Oi3w'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listAccounts() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_verified, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erreur:', error)
      process.exit(1)
    }

    console.log('\n📋 LISTE DES COMPTES GRANDSON CLOTHES\n')
    console.log('═'.repeat(90))
    
    if (!users || users.length === 0) {
      console.log('Aucun compte trouvé')
      console.log('═'.repeat(90))
      process.exit(0)
    }

    console.log(`\n${'#'.padEnd(3)} | ${'Email'.padEnd(35)} | ${'Nom'.padEnd(25)} | ${'Rôle'.padEnd(10)} | Vérifié`)
    console.log('─'.repeat(90))

    users.forEach((user, index) => {
      const fullName = `${user.first_name} ${user.last_name}`.substring(0, 25)
      const verified = user.is_verified ? '✅' : '❌'
      console.log(
        `${(index + 1).toString().padEnd(3)} | ${user.email.padEnd(35)} | ${fullName.padEnd(25)} | ${user.role.padEnd(10)} | ${verified}`
      )
    })
    
    console.log('─'.repeat(90))
    console.log(`\n📊 Total: ${users.length} compte(s)\n`)

    // Breakdown by role
    const adminCount = users.filter(u => u.role === 'admin').length
    const customerCount = users.filter(u => u.role === 'customer').length
    const verifiedCount = users.filter(u => u.is_verified).length

    console.log('📈 Statistiques:')
    console.log(`   • Administrateurs: ${adminCount}`)
    console.log(`   • Clients: ${customerCount}`)
    console.log(`   • Vérifiés: ${verifiedCount}`)
    console.log(`   • Non vérifiés: ${users.length - verifiedCount}\n`)

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

listAccounts()
