#!/usr/bin/env node

/**
 * Script de test pour vérifier l'affichage de la page d'accueil
 */

const http = require('http');

console.log('🧪 Test d\'affichage de la page d\'accueil\n');

// Test 1: Vérifier que le serveur répond
function testServerResponse() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Test de connexion au serveur...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Serveur répond avec status 200\n');
          resolve({ statusCode: res.statusCode, html: data });
        } else {
          console.log(`   ❌ Serveur répond avec status ${res.statusCode}\n`);
          reject(new Error(`Status code: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ Erreur de connexion:', error.message);
      console.log('   💡 Assurez-vous que le serveur est démarré (npm run dev)\n');
      reject(error);
    });

    req.on('timeout', () => {
      console.log('   ❌ Timeout - le serveur ne répond pas\n');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 2: Vérifier le contenu HTML
function testHTMLContent(html) {
  console.log('2️⃣ Vérification du contenu HTML...');
  
  const checks = [
    { name: 'Balise <html>', pattern: /<html/i, found: false },
    { name: 'Balise <body>', pattern: /<body/i, found: false },
    { name: 'Balise <div>', pattern: /<div/i, found: false },
    { name: 'Scripts Next.js', pattern: /_next/i, found: false },
    { name: 'Styles', pattern: /style|css/i, found: false },
  ];

  checks.forEach(check => {
    check.found = check.pattern.test(html);
    if (check.found) {
      console.log(`   ✅ ${check.name} trouvé`);
    } else {
      console.log(`   ❌ ${check.name} manquant`);
    }
  });

  const allFound = checks.every(check => check.found);
  console.log();
  return allFound;
}

// Test 3: Vérifier les APIs
function testAPIs() {
  return new Promise((resolve) => {
    console.log('3️⃣ Test des APIs...');
    
    const apis = [
      '/api/products?limit=4&isNew=true',
      '/api/admin/categories',
      '/api/admin/homepage-content'
    ];

    let completed = 0;
    const results = [];

    apis.forEach(path => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        timeout: 3000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const success = res.statusCode === 200;
          results.push({ path, success, status: res.statusCode });
          console.log(`   ${success ? '✅' : '❌'} ${path} - Status ${res.statusCode}`);
          
          completed++;
          if (completed === apis.length) {
            console.log();
            resolve(results.every(r => r.success));
          }
        });
      });

      req.on('error', () => {
        results.push({ path, success: false, status: 'error' });
        console.log(`   ❌ ${path} - Erreur`);
        completed++;
        if (completed === apis.length) {
          console.log();
          resolve(false);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        results.push({ path, success: false, status: 'timeout' });
        console.log(`   ❌ ${path} - Timeout`);
        completed++;
        if (completed === apis.length) {
          console.log();
          resolve(false);
        }
      });

      req.end();
    });
  });
}

// Exécuter tous les tests
async function runTests() {
  try {
    // Test 1
    const { statusCode, html } = await testServerResponse();
    
    // Test 2
    const htmlValid = testHTMLContent(html);
    
    // Test 3
    const apisValid = await testAPIs();
    
    // Résumé
    console.log('📊 RÉSUMÉ DES TESTS\n');
    console.log(`   Serveur:     ${statusCode === 200 ? '✅ OK' : '❌ ERREUR'}`);
    console.log(`   HTML:        ${htmlValid ? '✅ OK' : '❌ ERREUR'}`);
    console.log(`   APIs:        ${apisValid ? '✅ OK' : '⚠️  PARTIEL'}`);
    console.log();
    
    if (statusCode === 200 && htmlValid) {
      console.log('✅ LA PAGE DEVRAIT S\'AFFICHER CORRECTEMENT\n');
      console.log('🌐 Ouvrez: http://localhost:3000\n');
      console.log('💡 Si la page est blanche:');
      console.log('   1. Ouvrez la console (F12)');
      console.log('   2. Vérifiez les erreurs JavaScript');
      console.log('   3. Videz le cache (Ctrl+Shift+Delete)');
      console.log('   4. Rechargez la page (Ctrl+R)\n');
    } else {
      console.log('❌ PROBLÈME DÉTECTÉ\n');
      console.log('🔧 Actions à faire:');
      console.log('   1. Vérifiez que le serveur est démarré');
      console.log('   2. Vérifiez les erreurs dans le terminal');
      console.log('   3. Redémarrez le serveur si nécessaire\n');
    }
    
  } catch (error) {
    console.log('\n❌ ERREUR LORS DES TESTS\n');
    console.log('Message:', error.message);
    console.log('\n🔧 Vérifiez que:');
    console.log('   1. Le serveur Next.js est démarré (npm run dev)');
    console.log('   2. Le port 3000 est disponible');
    console.log('   3. Aucune erreur dans le terminal du serveur\n');
  }
}

runTests();
