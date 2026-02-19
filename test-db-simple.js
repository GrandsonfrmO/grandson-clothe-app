const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zyhqiwaudcilqwrcckdq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aHFpd2F1ZGNpbHF3cmNja2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTY2MjUsImV4cCI6MjA4NTczMjYyNX0.grCiyrI24onpx6IeFVWrt3PCLXLD0vrKefbPxgpmQZ8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
    console.log('🔍 Testing Supabase connection...')
    console.log('URL:', supabaseUrl)

    try {
        // Test 1: Check categories
        console.log('\n📦 Testing categories table...')
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .limit(5)

        if (catError) {
            console.error('❌ Categories error:', catError.message)
        } else {
            console.log('✅ Categories found:', categories?.length || 0)
            if (categories && categories.length > 0) {
                console.log('   First category:', categories[0])
            }
        }

        // Test 2: Check products
        console.log('\n🛍️ Testing products table...')
        const { data: products, error: prodError, count } = await supabase
            .from('products')
            .select('*', { count: 'exact' })
            .limit(3)

        if (prodError) {
            console.error('❌ Products error:', prodError.message)
        } else {
            console.log('✅ Products found:', count || 0)
            if (products && products.length > 0) {
                console.log('   First product:', products[0].name)
                console.log('   Images:', products[0].images)
            } else {
                console.log('⚠️ No products in database!')
            }
        }

        // Test 3: Check homepage content
        console.log('\n🏠 Testing homepage_content table...')
        const { data: homepage, error: homeError } = await supabase
            .from('homepage_content')
            .select('*')

        if (homeError) {
            console.error('❌ Homepage content error:', homeError.message)
        } else {
            console.log('✅ Homepage content found:', homepage?.length || 0)
            if (homepage && homepage.length > 0) {
                console.log('   Sections:', homepage.map(h => h.section_key).join(', '))
            }
        }

    } catch (error) {
        console.error('💥 Test failed:', error)
    }
}

testDatabase()
