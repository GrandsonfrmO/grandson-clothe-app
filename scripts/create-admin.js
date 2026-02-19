#!/usr/bin/env node

/**
 * Script pour créer un utilisateur administrateur
 */

const API_BASE = 'http://localhost:3000'

const ADMIN_DATA = {
  firstName: 'Admin',
  lastName: 'GRANDSON',
  email: 'admin@grandsonclothes.com',
  password: 'admin123',
  phone: '+224 123 456 789'
}

async function createAdmin() {
  console.log('👤 Création de l\'utilisateur administrateur...')
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ADMIN_DATA),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Utilisateur admin créé avec succès!')
      console.log(`📧 Email: ${ADMIN_DATA.email}`)
      console.log(`🔑 Mot de passe: ${ADMIN_DATA.password}`)
      console.log(`👤 Nom: ${ADMIN_DATA.firstName} ${ADMIN_DATA.lastName}`)
      
      // Note: Dans un vrai système, il faudrait promouvoir l'utilisateur au rôle admin
      console.log('\n⚠️  Note: L\'utilisateur a été créé avec le rôle "user".')
      console.log('   Dans un système réel, il faudrait le promouvoir au rôle "admin".')
      
    } else {
      if (data.error && data.error.includes('existe déjà')) {
        console.log('ℹ️  L\'utilisateur admin existe déjà.')
        console.log(`📧 Email: ${ADMIN_DATA.email}`)
        console.log(`🔑 Mot de passe: ${ADMIN_DATA.password}`)
      } else {
        console.error('❌ Erreur lors de la création:', data.error)
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Impossible de se connecter au serveur.')
      console.log('💡 Assurez-vous que le serveur Next.js est démarré avec "npm run dev"')
    } else {
      console.error('❌ Erreur:', error.message)
    }
  }
}

console.log('🚀 Script de création d\'administrateur\n')
createAdmin()