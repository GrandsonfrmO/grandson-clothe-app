#!/usr/bin/env node
/**
 * Test des pages avec requêtes HTTP
 * Nécessite que le serveur Next.js soit en cours d'exécution
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';
const TIMEOUT = 5000; // 5 secondes

// Pages à tester
const PAGES = [
  { path: '/', name: 'Accueil' },
  { path: '/explorer', name: 'Explorer' },
  { path: '/models', name: 'Modèles' },
  { path: '/panier', name: 'Panier' },
  { path: '/favoris', name: 'Favoris' },
  { path: '/profil', name: 'Profil' },
  { path: '/commandes', name: 'Commandes' },
  { path: '/paiement', name: 'Paiement' },
  { path: '/aide', name: 'Aide' },
  { path: '/parametres', name: 'Paramètres' },
  { path: '/admin/login', name: 'Login Admin' },
  { path: '/admin', name: 'Dashboard Admin' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/order-confirmation', name: 'Confirmation Commande' },
];

// Pages avec paramètres dynamiques
const DYNAMIC_PAGES = [
  { path: '/models/1', name: 'Modèle détail' },
  { path: '/produit/1', name: 'Produit détail' },
  { path: '/commandes/ORDER-123', name: 'Détail commande' },
];

function testPage(page) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: page.path,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Page-Tester/1.0'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          page: page.name,
          path: page.path,
          status: 'success',
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          size: data.length,
          isHtml: res.headers['content-type']?.includes('text/html') || false,
          hasDoctype: data.includes('<!DOCTYPE'),
          hasReactRoot: data.includes('id="__next"') || data.includes('id="root"'),
          error: null
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        page: page.name,
        path: page.path,
        status: 'error',
        error: error.message,
        statusCode: null,
        size: 0,
        isHtml: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        page: page.name,
        path: page.path,
        status: 'timeout',
        error: `Timeout après ${TIMEOUT}ms`,
        statusCode: null,
        size: 0,
        isHtml: false
      });
    });
    
    req.end();
  });
}

async function main() {
  console.log('🌐 Test des pages avec requêtes HTTP\n');
  console.log(`📡 Connexion à http://${HOST}:${PORT}\n`);
  
  // Vérifier d'abord si le serveur est accessible
  try {
    const testOptions = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'HEAD',
      timeout: 3000
    };
    
    await new Promise((resolve, reject) => {
      const req = http.request(testOptions, (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
      req.end();
    });
    
    console.log('✅ Serveur accessible\n');
  } catch (error) {
    console.log('❌ Serveur non accessible');
    console.log(`💡 Démarrez le serveur avec: npm run dev`);
    console.log(`💡 Ou exécutez: npx next start (si buildé)`);
    console.log(`\n📝 Pour tester sans serveur, exécutez:`);
    console.log(`   node scripts/quick-page-test.js`);
    console.log(`   node scripts/test-next-build.js`);
    process.exit(1);
  }
  
  // Tester les pages principales
  console.log('📋 Test des pages principales:');
  const results = [];
  
  for (const page of PAGES) {
    process.stdout.write(`  ${page.name.padEnd(25)}`);
    const result = await testPage(page);
    results.push(result);
    
    if (result.status === 'success') {
      if (result.statusCode === 200) {
        console.log(`✅ 200 OK`);
      } else if (result.statusCode === 404) {
        console.log(`❌ 404 Not Found`);
      } else {
        console.log(`⚠️  ${result.statusCode}`);
      }
    } else {
      console.log(`❌ ${result.error}`);
    }
  }
  
  // Tester les pages dynamiques
  console.log('\n📋 Test des pages dynamiques:');
  for (const page of DYNAMIC_PAGES) {
    process.stdout.write(`  ${page.name.padEnd(25)}`);
    const result = await testPage(page);
    results.push(result);
    
    if (result.status === 'success') {
      if (result.statusCode === 200) {
        console.log(`✅ 200 OK`);
      } else if (result.statusCode === 404) {
        console.log(`⚠️  404 (peut être normal)`);
      } else {
        console.log(`⚠️  ${result.statusCode}`);
      }
    } else {
      console.log(`❌ ${result.error}`);
    }
  }
  
  // Analyser les résultats
  console.log('\n📊 Analyse des résultats:');
  
  const successful = results.filter(r => r.status === 'success' && r.statusCode === 200);
  const errors = results.filter(r => r.status === 'error' || r.status === 'timeout');
  const notFound = results.filter(r => r.status === 'success' && r.statusCode === 404);
  const otherStatus = results.filter(r => r.status === 'success' && r.statusCode !== 200 && r.statusCode !== 404);
  
  console.log(`✅ Pages avec 200 OK: ${successful.length}/${results.length}`);
  console.log(`❌ Erreurs/timeout: ${errors.length}`);
  console.log(`🔍 Pages 404: ${notFound.length}`);
  console.log(`⚠️  Autres statuts: ${otherStatus.length}`);
  
  // Vérifier la qualité des réponses
  if (successful.length > 0) {
    console.log('\n🔍 Qualité des réponses HTML:');
    
    const htmlPages = successful.filter(r => r.isHtml);
    const hasDoctype = successful.filter(r => r.hasDoctype);
    const hasReactRoot = successful.filter(r => r.hasReactRoot);
    
    console.log(`   Pages HTML: ${htmlPages.length}/${successful.length}`);
    console.log(`   Avec DOCTYPE: ${hasDoctype.length}/${htmlPages.length}`);
    console.log(`   Avec React root: ${hasReactRoot.length}/${htmlPages.length}`);
    
    // Taille moyenne
    const avgSize = successful.reduce((sum, r) => sum + r.size, 0) / successful.length;
    console.log(`   Taille moyenne: ${Math.round(avgSize)} octets`);
    
    // Trouver les plus grandes réponses
    const largest = [...successful].sort((a, b) => b.size - a.size).slice(0, 3);
    console.log('\n📄 3 plus grandes réponses:');
    largest.forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.page}: ${page.size} octets`);
    });
  }
  
  // Afficher les problèmes
  if (errors.length > 0) {
    console.log('\n🚨 Erreurs détectées:');
    errors.forEach(error => {
      console.log(`   - ${error.page}: ${error.error}`);
    });
  }
  
  if (notFound.length > 0) {
    console.log('\n🔍 Pages 404 (à vérifier):');
    notFound.forEach(page => {
      console.log(`   - ${page.page} (${page.path})`);
    });
  }
  
  // Recommandations
  console.log('\n🎯 Recommandations:');
  
  if (successful.length === results.length) {
    console.log('   ✅ Toutes les pages répondent correctement!');
  } else if (successful.length >= results.length * 0.8) {
    console.log('   ⚠️  La plupart des pages fonctionnent');
    console.log('   → Vérifiez les pages problématiques ci-dessus');
  } else {
    console.log('   ❗ Plusieurs pages ont des problèmes');
    console.log('   → Vérifiez la configuration du serveur');
  }
  
  if (notFound.length > 0) {
    console.log('   💡 Les pages 404 peuvent être normales pour les routes dynamiques');
    console.log('   → Vérifiez que les données existent en base');
  }
  
  console.log('\n✅ Test HTTP terminé!');
}

// Gestion des arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/test-pages-http.js');
  console.log('\nOptions:');
  console.log('  --port=<port>    Port du serveur (défaut: 3000)');
  console.log('  --host=<host>    Host du serveur (défaut: localhost)');
  console.log('  --help, -h       Afficher cette aide');
  process.exit(0);
}

// Récupérer les paramètres
args.forEach(arg => {
  if (arg.startsWith('--port=')) {
    PORT = parseInt(arg.split('=')[1], 10);
  }
  if (arg.startsWith('--host=')) {
    HOST = arg.split('=')[1];
  }
});

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
}

module.exports = { testPage, PAGES, DYNAMIC_PAGES };