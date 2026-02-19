#!/usr/bin/env node
/**
 * Test de build production
 * Vérifie que l'application peut être construite pour la production
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  TEST DE BUILD PRODUCTION\n');

// Vérifier l'environnement
console.log('🔍 Vérification de l\'environnement...');

// Vérifier Node.js version
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
} catch (error) {
  console.log('❌ Node.js non disponible');
  process.exit(1);
}

// Vérifier npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.log('❌ npm non disponible');
  process.exit(1);
}

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  const requiredDeps = ['react', 'react-dom', 'next'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`❌ Dépendances manquantes: ${missingDeps.join(', ')}`);
    console.log('💡 Exécutez: npm install');
    process.exit(1);
  }
  
  console.log('✅ Dépendances principales présentes');
  console.log(`   Next.js: ${packageJson.dependencies.next}`);
  console.log(`   React: ${packageJson.dependencies.react}`);
  console.log(`   Total dépendances: ${Object.keys(packageJson.dependencies || {}).length}`);
  
  // Vérifier les scripts
  const requiredScripts = ['dev', 'build', 'start'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
  
  if (missingScripts.length > 0) {
    console.log(`⚠️  Scripts manquants: ${missingScripts.join(', ')}`);
  } else {
    console.log('✅ Scripts principaux présents');
  }
  
} catch (error) {
  console.log(`❌ Erreur package.json: ${error.message}`);
  process.exit(1);
}

// Nettoyer le cache Next.js
console.log('\n🧹 Nettoyage du cache...');
try {
  if (fs.existsSync('.next')) {
    execSync('rmdir /s /q .next', { stdio: 'ignore' });
    console.log('✅ Cache .next nettoyé');
  } else {
    console.log('✅ Pas de cache à nettoyer');
  }
} catch (error) {
  console.log('⚠️  Impossible de nettoyer le cache');
}

// Tester le build
console.log('\n🔨 Test du build production...');
console.log('   Cette opération peut prendre quelques minutes...\n');

const startTime = Date.now();
let buildSuccess = false;
let buildOutput = '';

try {
  // Exécuter le build avec timeout
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'pipe',
    shell: true,
    timeout: 300000 // 5 minutes
  });
  
  buildProcess.stdout.on('data', (data) => {
    const output = data.toString();
    buildOutput += output;
    
    // Afficher les messages importants
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('✓') || line.includes('error') || line.includes('warn') || line.includes('info')) {
        console.log(`   ${line}`);
      }
    });
  });
  
  buildProcess.stderr.on('data', (data) => {
    const output = data.toString();
    buildOutput += output;
    console.log(`   [stderr] ${output}`);
  });
  
  await new Promise((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        buildSuccess = true;
        resolve();
      } else {
        reject(new Error(`Build échoué avec code ${code}`));
      }
    });
    
    buildProcess.on('error', reject);
  });
  
  const duration = Date.now() - startTime;
  console.log(`\n✅ Build réussi en ${Math.round(duration / 1000)} secondes`);
  
} catch (error) {
  const duration = Date.now() - startTime;
  console.log(`\n❌ Build échoué après ${Math.round(duration / 1000)} secondes`);
  console.log(`   Erreur: ${error.message}`);
  
  // Analyser les erreurs courantes
  if (buildOutput.includes('Module not found')) {
    console.log('\n💡 Problème: Module non trouvé');
    console.log('   → Exécutez: npm install');
  }
  
  if (buildOutput.includes('SyntaxError')) {
    console.log('\n💡 Problème: Erreur de syntaxe');
    console.log('   → Vérifiez les fichiers TypeScript/JavaScript');
  }
  
  if (buildOutput.includes('Memory')) {
    console.log('\n💡 Problème: Mémoire insuffisante');
    console.log('   → Essayez: npm run build -- --max-old-space-size=4096');
  }
  
  process.exit(1);
}

// Analyser le résultat du build
console.log('\n📊 Analyse du build...');

// Vérifier les fichiers générés
const nextDir = '.next';
if (fs.existsSync(nextDir)) {
  const buildStats = {
    static: fs.existsSync(path.join(nextDir, 'static')) ? '✅' : '❌',
    server: fs.existsSync(path.join(nextDir, 'server')) ? '✅' : '❌',
    buildId: fs.existsSync(path.join(nextDir, 'BUILD_ID')) ? '✅' : '❌',
    cache: fs.existsSync(path.join(nextDir, 'cache')) ? '✅' : '❌',
  };
  
  console.log('Structure .next:');
  Object.entries(buildStats).forEach(([key, value]) => {
    console.log(`   ${value} ${key}`);
  });
  
  // Compter les pages statiques
  try {
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      const files = getAllFiles(staticDir);
      console.log(`   📁 Fichiers statiques: ${files.length}`);
    }
  } catch (error) {
    // Ignorer
  }
  
} else {
  console.log('❌ Dossier .next non généré');
  process.exit(1);
}

// Vérifier les pages générées
console.log('\n📄 Pages générées:');
try {
  const buildManifestPath = path.join(nextDir, 'build-manifest.json');
  if (fs.existsSync(buildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf-8'));
    
    const pageCount = Object.keys(manifest.pages || {}).length;
    console.log(`   ✅ ${pageCount} pages dans le manifest`);
    
    // Afficher quelques pages
    const samplePages = Object.keys(manifest.pages || {}).slice(0, 5);
    samplePages.forEach(page => {
      console.log(`      - ${page}`);
    });
    
    if (pageCount > 5) {
      console.log(`      ... et ${pageCount - 5} autres`);
    }
  } else {
    console.log('   ⚠️  build-manifest.json non trouvé');
  }
} catch (error) {
  console.log(`   ⚠️  Erreur manifest: ${error.message}`);
}

// Vérifier la taille du build
console.log('\n📦 Taille du build:');
try {
  function getDirSize(dir) {
    let size = 0;
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          traverse(fullPath);
        } else {
          try {
            const stats = fs.statSync(fullPath);
            size += stats.size;
          } catch (error) {
            // Ignorer
          }
        }
      }
    }
    
    traverse(dir);
    return size;
  }
  
  const buildSize = getDirSize(nextDir);
  const sizeMB = (buildSize / (1024 * 1024)).toFixed(2);
  console.log(`   📊 Taille totale: ${sizeMB} MB`);
  
  if (parseFloat(sizeMB) > 100) {
    console.log('   ⚠️  Build assez volumineux');
    console.log('   → Pensez à optimiser les images et bundles');
  } else if (parseFloat(sizeMB) > 50) {
    console.log('   ✅ Taille raisonnable');
  } else {
    console.log('   ✅ Taille optimale');
  }
  
} catch (error) {
  console.log(`   ⚠️  Impossible de calculer la taille: ${error.message}`);
}

// Tester le serveur de production (rapide)
console.log('\n🚀 Test du serveur production...');
console.log('   Démarrage rapide du serveur...');

try {
  // Vérifier si le serveur peut démarrer
  const testProcess = spawn('npm', ['run', 'start'], {
    stdio: 'pipe',
    shell: true,
    timeout: 30000 // 30 secondes
  });
  
  let serverOutput = '';
  let serverReady = false;
  
  testProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    
    if (serverOutput.includes('Ready') || serverOutput.includes('started')) {
      serverReady = true;
      testProcess.kill('SIGTERM');
    }
  });
  
  await new Promise((resolve) => {
    setTimeout(() => {
      testProcess.kill('SIGTERM');
      resolve();
    }, 10000); // 10 secondes max
  });
  
  if (serverReady) {
    console.log('   ✅ Serveur prêt');
  } else {
    console.log('   ⚠️  Serveur non testé (démarrage trop long)');
  }
  
} catch (error) {
  console.log(`   ⚠️  Test serveur échoué: ${error.message}`);
}

// Recommandations finales
console.log('\n🎯 RECOMMANDATIONS FINALES:');
console.log('────────────────────────────────────');

if (buildSuccess) {
  console.log('✅ BUILD RÉUSSI!');
  console.log('\n🚀 Étapes de déploiement:');
  console.log('   1. Vérifier les variables d\'environnement (.env.local)');
  console.log('   2. Configurer la base de données (Supabase)');
  console.log('   3. Tester en local: npm run start');
  console.log('   4. Déployer sur Vercel: vercel --prod');
  console.log('   5. Configurer le domaine et SSL');
  
  console.log('\n🔧 Optimisations recommandées:');
  console.log('   • Activer la compression Gzip/Brotli');
  console.log('   • Configurer le caching CDN');
  console.log('   • Mettre en place monitoring');
  console.log('   • Configurer les backups automatiques');
} else {
  console.log('❌ BUILD ÉCHOUÉ');
  console.log('\n🔧 Problèmes à résoudre:');
  console.log('   1. Vérifier les erreurs TypeScript');
  console.log('   2. Corriger les dépendances manquantes');
  console.log('   3. Résoudre les problèmes de mémoire');
  console.log('   4. Tester avec: npm run dev (développement)');
}

console.log('\n📝 Documentation:');
console.log('   • Next.js: https://nextjs.org/docs');
console.log('   • Vercel: https://vercel.com/docs');
console.log('   • Supabase: https://supabase.com/docs');

console.log('\n✅ Test de build production terminé!');

// Fonction utilitaire
function getAllFiles(dir) {
  let results = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        traverse(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return results;
}

// Exécuter
if (require.main === module) {
  (async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur:', error);
      process.exit(1);
    }
  })();
}

async function main() {
  // Le code principal est déjà exécuté
}