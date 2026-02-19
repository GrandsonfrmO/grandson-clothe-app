#!/usr/bin/env node
/**
 * Test avec serveur de développement
 * Démarre le serveur Next.js et teste les pages principales
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PORT = 3001; // Port différent pour ne pas interférer
const HOST = 'localhost';
const TIMEOUT = 10000; // 10 secondes

// Pages à tester
const TEST_PAGES = [
  { path: '/', name: 'Accueil', critical: true },
  { path: '/explorer', name: 'Explorer', critical: true },
  { path: '/models', name: 'Modèles', critical: true },
  { path: '/panier', name: 'Panier', critical: true },
  { path: '/admin/login', name: 'Login Admin', critical: true },
  { path: '/favoris', name: 'Favoris' },
  { path: '/profil', name: 'Profil' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/aide', name: 'Aide' },
];

let serverProcess = null;

// Fonction pour démarrer le serveur
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Démarrage du serveur de développement...');
    
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: PORT.toString() },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let started = false;
    
    // Capturer la sortie
    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      if (!started && text.includes('Ready in') || text.includes('started server')) {
        started = true;
        console.log('✅ Serveur démarré');
        resolve();
      }
      
      // Afficher les logs importants
      if (text.includes('error') || text.includes('Error') || text.includes('Failed')) {
        console.log(`[Server] ${text.trim()}`);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      console.log(`[Server Error] ${text.trim()}`);
    });
    
    // Timeout
    setTimeout(() => {
      if (!started) {
        reject(new Error('Timeout lors du démarrage du serveur'));
      }
    }, 30000);
    
    // Gestion des erreurs
    serverProcess.on('error', reject);
    serverProcess.on('close', (code) => {
      if (!started) {
        reject(new Error(`Serveur arrêté avec code: ${code}`));
      }
    });
  });
}

// Fonction pour arrêter le serveur
function stopServer() {
  if (serverProcess) {
    console.log('🛑 Arrêt du serveur...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// Fonction pour tester une page
async function testPage(page) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: page.path,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Page-Tester/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let data = '';
      let size = 0;
      
      res.on('data', (chunk) => {
        data += chunk;
        size += chunk.length;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        const result = {
          page: page.name,
          path: page.path,
          status: 'success',
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          size,
          duration,
          isHtml: res.headers['content-type']?.includes('text/html') || false,
          hasDoctype: data.includes('<!DOCTYPE'),
          hasReactRoot: data.includes('id="__next"') || data.includes('id="root"'),
          hasTitle: data.includes('<title>'),
          error: null
        };
        
        resolve(result);
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
        duration: Date.now() - startTime,
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
        duration: TIMEOUT,
        isHtml: false
      });
    });
    
    req.end();
  });
}

// Fonction pour vérifier la santé du serveur
async function checkServerHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            healthy: res.statusCode === 200,
            statusCode: res.statusCode,
            response: json
          });
        } catch {
          resolve({
            healthy: res.statusCode === 200,
            statusCode: res.statusCode,
            response: data
          });
        }
      });
    });
    
    req.on('error', () => {
      resolve({ healthy: false, error: 'Connection failed' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ healthy: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

// Fonction principale
async function main() {
  console.log('🌐 TEST AVEC SERVEUR DE DÉVELOPPEMENT\n');
  
  let serverStarted = false;
  
  try {
    // Vérifier si le serveur est déjà en cours d'exécution
    try {
      const health = await checkServerHealth();
      if (health.healthy) {
        console.log('✅ Serveur déjà en cours d\'exécution');
        serverStarted = true;
      }
    } catch {
      // Le serveur n'est pas en cours d'exécution, on le démarre
    }
    
    if (!serverStarted) {
      await startServer();
      serverStarted = true;
      
      // Attendre que le serveur soit prêt
      console.log('⏳ Attente que le serveur soit prêt...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Vérifier la santé
    console.log('\n🏥 Vérification de la santé du serveur...');
    const health = await checkServerHealth();
    if (health.healthy) {
      console.log('✅ Serveur en bonne santé');
    } else {
      console.log(`⚠️  Problème de santé: ${health.error || health.statusCode}`);
    }
    
    // Tester les pages
    console.log('\n📋 Test des pages:');
    const results = [];
    
    for (const page of TEST_PAGES) {
      process.stdout.write(`  ${page.name.padEnd(20)}`);
      const result = await testPage(page);
      results.push(result);
      
      if (result.status === 'success') {
        if (result.statusCode === 200) {
          console.log(`✅ 200 (${result.duration}ms)`);
        } else if (result.statusCode === 404) {
          console.log(`❌ 404`);
        } else if (result.statusCode === 500) {
          console.log(`❌ 500 (Erreur serveur)`);
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
    const criticalSuccessful = results.filter(r => r.critical && r.status === 'success' && r.statusCode === 200);
    const errors = results.filter(r => r.status === 'error' || r.status === 'timeout');
    const notFound = results.filter(r => r.status === 'success' && r.statusCode === 404);
    const serverErrors = results.filter(r => r.status === 'success' && r.statusCode >= 500);
    
    console.log(`✅ Pages avec 200 OK: ${successful.length}/${results.length}`);
    console.log(`✅ Pages critiques OK: ${criticalSuccessful.length}/${TEST_PAGES.filter(p => p.critical).length}`);
    console.log(`❌ Erreurs/timeout: ${errors.length}`);
    console.log(`🔍 Pages 404: ${notFound.length}`);
    console.log(`💥 Erreurs serveur (5xx): ${serverErrors.length}`);
    
    // Vérifier la qualité des réponses
    if (successful.length > 0) {
      console.log('\n🔍 Qualité des réponses:');
      
      const htmlPages = successful.filter(r => r.isHtml);
      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
      const avgSize = successful.reduce((sum, r) => sum + r.size, 0) / successful.length;
      
      console.log(`   Pages HTML: ${htmlPages.length}/${successful.length}`);
      console.log(`   Temps moyen de réponse: ${Math.round(avgDuration)}ms`);
      console.log(`   Taille moyenne: ${Math.round(avgSize / 1024)} Ko`);
      
      // Vérifier les métriques importantes
      const hasDoctype = successful.filter(r => r.hasDoctype).length;
      const hasReactRoot = successful.filter(r => r.hasReactRoot).length;
      const hasTitle = successful.filter(r => r.hasTitle).length;
      
      console.log(`   Avec DOCTYPE: ${hasDoctype}/${htmlPages.length}`);
      console.log(`   Avec React root: ${hasReactRoot}/${htmlPages.length}`);
      console.log(`   Avec titre: ${hasTitle}/${htmlPages.length}`);
      
      // Pages les plus lentes
      const slowest = [...successful].sort((a, b) => b.duration - a.duration).slice(0, 3);
      if (slowest.length > 0) {
        console.log('\n🐌 Pages les plus lentes:');
        slowest.forEach((page, i) => {
          console.log(`   ${i + 1}. ${page.page}: ${page.duration}ms`);
        });
      }
    }
    
    // Afficher les problèmes
    if (errors.length > 0) {
      console.log('\n🚨 Erreurs de connexion:');
      errors.forEach(error => {
        console.log(`   - ${error.page}: ${error.error}`);
      });
    }
    
    if (notFound.length > 0) {
      console.log('\n🔍 Pages non trouvées (404):');
      notFound.forEach(page => {
        console.log(`   - ${page.page} (${page.path})`);
      });
    }
    
    if (serverErrors.length > 0) {
      console.log('\n💥 Erreurs serveur:');
      serverErrors.forEach(page => {
        console.log(`   - ${page.page}: HTTP ${page.statusCode}`);
      });
    }
    
    // Évaluation finale
    console.log('\n🏆 ÉVALUATION FINALE:');
    
    const allCriticalOk = criticalSuccessful.length === TEST_PAGES.filter(p => p.critical).length;
    const successRate = Math.round((successful.length / results.length) * 100);
    
    if (allCriticalOk && successRate >= 90) {
      console.log('✅ EXCELLENT - Toutes les pages critiques fonctionnent');
      console.log('   L\'application est prête pour les tests utilisateurs');
    } else if (allCriticalOk && successRate >= 70) {
      console.log('⚠️  BON - La plupart des pages fonctionnent');
      console.log('   Vérifiez les pages problématiques');
    } else if (allCriticalOk) {
      console.log('🔸 MOYEN - Pages critiques OK, mais autres problèmes');
      console.log('   Amélioration nécessaire sur les pages secondaires');
    } else {
      console.log('❌ PROBLÉMATIQUE - Pages critiques défaillantes');
      console.log('   Révision urgente nécessaire');
    }
    
    // Recommandations
    console.log('\n🎯 RECOMMANDATIONS:');
    
    if (!allCriticalOk) {
      console.log('   1. Corriger les pages critiques défaillantes');
    }
    
    if (successRate < 80) {
      console.log('   2. Améliorer le taux de succès global');
    }
    
    if (avgDuration > 1000) {
      console.log('   3. Optimiser les performances des pages lentes');
    }
    
    console.log('   4. Tester sur différents navigateurs');
    console.log('   5. Tester les fonctionnalités interactives');
    
  } catch (error) {
    console.error(`\n❌ Erreur lors du test: ${error.message}`);
  } finally {
    // Arrêter le serveur si nous l'avons démarré
    if (serverStarted && !serverStarted) {
      stopServer();
    }
    
    console.log('\n✅ Test terminé');
  }
}

// Gestion de la sortie propre
process.on('SIGINT', () => {
  console.log('\n\n🛑 Interruption par l\'utilisateur');
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    stopServer();
    process.exit(1);
  });
}

module.exports = { testPage, checkServerHealth, TEST_PAGES };