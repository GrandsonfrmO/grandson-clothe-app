#!/usr/bin/env node
/**
 * Test rapide des pages - version simplifiée
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');

// Pages principales à vérifier absolument
const CRITICAL_PAGES = [
  '/',                    // Page d'accueil
  '/explorer',           // Explorer
  '/models',             // Modèles
  '/panier',             // Panier
  '/checkout',           // Checkout
  '/admin/login',        // Login admin
  '/admin',              // Dashboard admin
];

// Pages importantes
const IMPORTANT_PAGES = [
  '/produit/1',
  '/favoris',
  '/profil',
  '/commandes',
  '/paiement',
  '/aide',
  '/parametres',
];

// Toutes les pages
const ALL_PAGES = [
  ...CRITICAL_PAGES,
  ...IMPORTANT_PAGES,
  '/models/1',
  '/commandes/ORDER-123',
  '/adresses',
  '/confidentialite',
  '/aide/commandes',
  '/aide/livraison',
  '/aide/paiement',
  '/aide/retours',
  '/parametres/langue',
  '/parametres/about',
  '/zones-livraison',
  '/checkout-choice',
  '/checkout-guest',
  '/order-confirmation',
  '/payment-success',
  '/payment-failure',
  '/pwa-demo',
  '/admin/analytics',
  '/admin/app-icons',
  '/admin/categories',
  '/admin/gallery',
  '/admin/homepage',
  '/admin/inventory',
  '/admin/media-library',
  '/admin/models',
  '/admin/orders',
  '/admin/products',
  '/admin/products/new',
  '/admin/products/1/edit',
  '/admin/settings',
  '/admin/special-offer',
  '/admin/users',
  '/admin/videos',
  '/test-simple',
  '/notifications',
  '/recherche',
];

function checkPage(pagePath) {
  const relativePath = pagePath === '/' ? 'page.tsx' : `${pagePath}/page.tsx`;
  const fullPath = path.join(APP_DIR, relativePath);
  
  if (!fs.existsSync(fullPath)) {
    return { exists: false, error: 'Fichier non trouvé' };
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const size = fs.statSync(fullPath).size;
    
    return {
      exists: true,
      size,
      lines: content.split('\n').length,
      hasReact: content.includes('import React') || content.includes('import * as React'),
      hasDefaultExport: content.includes('export default'),
      hasJSX: content.includes('<') && content.includes('>'),
      isEmpty: content.trim().length === 0
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function main() {
  console.log('🚀 Test rapide des pages\n');
  
  let criticalOk = 0;
  let importantOk = 0;
  let allOk = 0;
  
  console.log('📋 Pages critiques:');
  CRITICAL_PAGES.forEach(page => {
    const result = checkPage(page);
    const status = result.exists && !result.error ? '✅' : '❌';
    console.log(`  ${status} ${page}`);
    if (result.exists && !result.error) criticalOk++;
  });
  
  console.log('\n📋 Pages importantes:');
  IMPORTANT_PAGES.forEach(page => {
    const result = checkPage(page);
    const status = result.exists && !result.error ? '✅' : '⚠️';
    console.log(`  ${status} ${page}`);
    if (result.exists && !result.error) importantOk++;
  });
  
  console.log('\n📊 Résumé:');
  console.log(`Pages critiques: ${criticalOk}/${CRITICAL_PAGES.length} OK`);
  console.log(`Pages importantes: ${importantOk}/${IMPORTANT_PAGES.length} OK`);
  
  // Vérifier quelques pages problématiques potentielles
  console.log('\n🔍 Vérifications supplémentaires:');
  
  // Vérifier la page d'accueil
  const homePage = checkPage('/');
  if (homePage.exists && !homePage.error) {
    console.log(`  ✅ Page d'accueil: ${homePage.size} octets, ${homePage.lines} lignes`);
  } else {
    console.log(`  ❌ Page d'accueil: ${homePage.error || 'Manquante'}`);
  }
  
  // Vérifier le layout principal
  const layoutPath = path.join(APP_DIR, 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutSize = fs.statSync(layoutPath).size;
    console.log(`  ✅ Layout principal: ${layoutSize} octets`);
  } else {
    console.log('  ❌ Layout principal: Manquant');
  }
  
  // Vérifier les fichiers globaux
  const globalFiles = ['globals.css', 'page.tsx', 'page-backup.tsx', 'page-simple.tsx'];
  console.log('\n📁 Fichiers globaux:');
  globalFiles.forEach(file => {
    const filePath = path.join(APP_DIR, file);
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      console.log(`  ✅ ${file}: ${size} octets`);
    } else {
      console.log(`  ⚠️  ${file}: Manquant`);
    }
  });
  
  // Compter le nombre total de fichiers page.tsx
  console.log('\n🔢 Statistiques:');
  
  function countPageFiles(dir) {
    let count = 0;
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          traverse(fullPath);
        } else if (item.name === 'page.tsx') {
          count++;
        }
      }
    }
    
    traverse(dir);
    return count;
  }
  
  const totalPages = countPageFiles(APP_DIR);
  console.log(`  Total des fichiers page.tsx: ${totalPages}`);
  
  // Vérifier la structure des dossiers admin
  const adminDir = path.join(APP_DIR, 'admin');
  if (fs.existsSync(adminDir)) {
    const adminPages = countPageFiles(adminDir);
    console.log(`  Pages admin: ${adminPages}`);
  }
  
  console.log('\n🎯 Recommandations:');
  
  if (criticalOk < CRITICAL_PAGES.length) {
    console.log('  ❗ Certaines pages critiques sont manquantes ou erronées');
    console.log('  → Vérifiez les pages marquées ❌ ci-dessus');
  } else {
    console.log('  ✅ Toutes les pages critiques sont présentes');
  }
  
  if (totalPages < 30) {
    console.log(`  ⚠️  Seulement ${totalPages} pages détectées (attendu: ~40+)`);
    console.log('  → Certaines pages peuvent être dans des sous-dossiers non standard');
  } else {
    console.log(`  ✅ Structure de pages complète (${totalPages} pages)`);
  }
  
  console.log('\n✅ Test terminé!');
}

// Exécuter
if (require.main === module) {
  main();
}

module.exports = { checkPage, CRITICAL_PAGES, IMPORTANT_PAGES };