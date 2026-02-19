async function testModelsAPI() {
  console.log('🧪 Test de l\'API /api/admin/models...\n')

  try {
    const response = await fetch('http://localhost:3000/api/admin/models')
    console.log('📡 Status:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('📦 Données reçues:', JSON.stringify(data, null, 2))
    
    if (data.models && data.models.length > 0) {
      console.log(`\n✅ ${data.models.length} models trouvés:`)
      data.models.forEach((model: any, index: number) => {
        console.log(`   ${index + 1}. ${model.name} (${model.is_active ? 'Actif' : 'Inactif'})`)
      })
    } else {
      console.log('\n⚠️ Aucun model trouvé')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testModelsAPI()
