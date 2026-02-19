import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Test de connexion Supabase...\n')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

console.log('✓ Variables d\'environnement chargées')
console.log('  URL:', supabaseUrl)
console.log('  Service Key:', supabaseServiceKey.substring(0, 20) + '...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  try {
    console.log('📊 Test 1: Récupération des produits...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(3)

    if (productsError) {
      console.error('❌ Erreur produits:', productsError.message)
      throw productsError
    }

    console.log(`✅ ${products?.length || 0} produits récupérés`)
    if (products && products.length > 0) {
      products.forEach(p => console.log(`   - ${p.name}`))
    }

    console.log('\n📊 Test 2: Récupération des catégories...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(3)

    if (categoriesError) {
      console.error('❌ Erreur catégories:', categoriesError.message)
      throw categoriesError
    }

    console.log(`✅ ${categories?.length || 0} catégories récupérées`)
    if (categories && categories.length > 0) {
      categories.forEach(c => console.log(`   - ${c.name}`))
    }

    console.log('\n📊 Test 3: Récupération des utilisateurs...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(3)

    if (usersError) {
      console.error('❌ Erreur utilisateurs:', usersError.message)
      throw usersError
    }

    console.log(`✅ ${users?.length || 0} utilisateurs récupérés`)
    if (users && users.length > 0) {
      users.forEach(u => console.log(`   - ${u.email} (${u.role})`))
    }

    console.log('\n📊 Test 4: Récupération des commandes...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total')
      .limit(3)

    if (ordersError) {
      console.error('❌ Erreur commandes:', ordersError.message)
      throw ordersError
    }

    console.log(`✅ ${orders?.length || 0} commandes récupérées`)
    if (orders && orders.length > 0) {
      orders.forEach(o => console.log(`   - ${o.order_number} (${o.status}) - ${o.total} GNF`))
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 TOUS LES TESTS RÉUSSIS!')
    console.log('='.repeat(50))
    console.log('\n✅ La connexion Supabase fonctionne correctement')
    console.log('✅ La clé Service Role est valide')
    console.log('✅ Toutes les tables sont accessibles')
    console.log('\n🚀 Votre site est prêt à fonctionner!')

  } catch (error: any) {
    console.error('\n' + '='.repeat(50))
    console.error('❌ ÉCHEC DES TESTS')
    console.error('='.repeat(50))
    console.error('\nErreur:', error.message)
    console.error('\n💡 Vérifiez:')
    console.error('  1. La clé Service Role est correcte')
    console.error('  2. Les tables existent dans Supabase')
    console.error('  3. Les migrations ont été appliquées')
    process.exit(1)
  }
}

testConnection()
