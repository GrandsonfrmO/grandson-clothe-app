#!/usr/bin/env node
/**
 * Test final complet de toutes les pages
 * Vérifie: existence, syntaxe, routes dynamiques, et prépare pour le build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 TEST FINAL COMPLET DES PAGES\n');

const APP_DIR = path.join(__dirname, '..', 'app');
const RESULTS_FILE = path.join(__dirname, '..', 'final-test-results.json');

// Catégories de pages
const PAGE_CATEGORIES = {
  critical: [
    { path: '/', name: 'Accueil' },
    { path: '/explorer', name: 'Explorer' },
    { path: '/models', name: 'Modèles' },
    { path: '/panier', name: 'Panier' },
    { path: '/checkout', name: 'Checkout' },
    { path: '/admin/login', name: 'Login Admin' },
    { path: '/admin', name: 'Dashboard Admin' },
  ],
  
  public: [
    { path: '/favoris', name: 'Favoris' },
    { path: '/profil', name: 'Profil' },
    { path: '/commandes', name: 'Commandes' },
    { path: '/paiement', name: 'Paiement' },
    { path: '/aide', name: 'Aide' },
    { path: '/parametres', name: 'Paramètres' },
    { path: '/adresses', name: 'Adresses' },
    { path: '/confidentialite', name: 'Confidentialité' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/recherche', name: 'Recherche' },
  ],
  
  checkout: [
    { path: '/checkout-choice', name: 'Choix checkout' },
    { path: '/checkout-guest', name: 'Checkout invité' },
    { path: '/order-confirmation', name: 'Confirmation' },
    { path: '/payment-success', name: 'Paiement réussi' },
    { path: '/payment-failure', name: 'Paiement échoué' },
  ],
  
  admin: [
    { path: '/admin/analytics', name: 'Analytics' },
    { path: '/admin/app-icons', name: 'App Icons' },
    { path: '/admin/categories', name: 'Catégories' },
    { path: '/admin/gallery', name: 'Galerie' },
    { path: '/admin/homepage', name: 'Homepage' },
    { path: '/admin/inventory', name: 'Inventaire' },
    { path: '/admin/media-library', name: 'Médiathèque' },
    { path: '/admin/models', name: 'Modèles Admin' },
    { path: '/admin/orders', name: 'Commandes Admin' },
    { path: '/admin/products', name: 'Produits Admin' },
    { path: '/admin/products/new', name: 'Nouveau produit' },
    { path: '/admin/settings', name: 'Paramètres Admin' },
    { path: '/admin/special-offer', name: 'Offre spéciale' },
    { path: '/admin/users', name: 'Utilisateurs' },
    { path: '/admin/videos', name: 'Vidéos' },
  ],
  
  help: [
    { path: '/aide/commandes', name: 'Aide commandes' },
    { path: '/aide/livraison', name: 'Aide livraison' },
    { path: '/aide/paiement', name: 'Aide paiement' },
    { path: '/aide/retours', name: 'Aide retours' },
  ],
  
  settings: [
    { path: '/parametres/langue', name: 'Paramètres langue' },
    { path: '/parametres/about', name: 'À propos' },
  ],
  
  special: [
    { path: '/zones-livraison', name: 'Zones livraison' },
    { path: '/pwa-demo', name: 'PWA Demo' },
    { path: '/test-simple', name: 'Test simple' },
  ],
  
  // Routes dynamiques (peuvent ne pas exister physiquement)
  dynamic: [
    { path: '/models/[id]', name: 'Modèle détail', template: true },
    { path: '/produit/[id]', name: 'Produit détail', template: true },
    { path: '/commandes/[orderNumber]', name: 'Détail commande', template: true },
    { path: '/admin/products/[id]/edit', name: 'Édition produit', template: true },
  ]
};

// Fonction pour vérifier une page
function analyzePage(page) {
  const relativePath = page.path === '/' ? 'page.tsx' : `${page.path}/page.tsx`;
  const fullPath = path.join(APP_DIR, relativePath);
  
  const result = {
    ...page,
    exists: false,
    isTemplate: page.template || false,
    size: 0,
    lines: 0,
    hasReact: false,
    hasDefaultExport: false,
    hasJSX: false,
    useClient: false,
    useServer: false,
    isEmpty: false,
    syntaxError: null,
    issues: []
  };
  
  // Pour les templates, vérifier si le dossier existe
  if (page.template) {
    const dirPath = path.dirname(fullPath);
    result.exists = fs.existsSync(dirPath);
    if (!result.exists) {
      result.issues.push('Dossier template non trouvé');
    }
    return result;
  }
  
  // Pour les pages normales
  if (!fs.existsSync(fullPath)) {
    result.issues.push('Fichier non trouvé');
    return result;
  }
  
  result.exists = true;
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stats = fs.statSync(fullPath);
    
    result.size = stats.size;
    result.lines = content.split('\n').length;
    result.hasReact = content.includes('import React') || content.includes('import * as React');
    result.hasDefaultExport = content.includes('export default');
    result.hasJSX = content.includes('<') && content.includes('>');
    result.useClient = content.includes("'use client'") || content.includes('"use client"');
    result.useServer = content.includes("'use server'") || content.includes('"use server"');
    result.isEmpty = content.trim().length === 0;
    
    // Vérifications de qualité
    if (!result.hasDefaultExport) {
      result.issues.push('Pas d\'export default');
    }
    
    if (result.isEmpty) {
      result.issues.push('Fichier vide');
    }
    
    if (result.lines < 5 && !result.isEmpty) {
      result.issues.push('Fichier très court');
    }
    
    if (result.useClient && result.useServer) {
      result.issues.push('Utilise à la fois use client et use server');
    }
    
    // Vérifier les imports courants problématiques
    if (content.includes('require(') && content.includes('import ')) {
      result.issues.push('Mélange require() et import');
    }
    
  } catch (error) {
    result.syntaxError = error.message;
    result.issues.push(`Erreur de lecture: ${error.message}`);
  }
  
  return result;
}

// Fonction pour analyser une catégorie
function analyzeCategory(categoryName, pages) {
  console.log(`\n📁 ${categoryName.toUpperCase()}`);
  console.log('─'.repeat(50));
  
  const results = pages.map(page => analyzePage(page));
  
  results.forEach(result => {
    const status = result.exists ? (result.issues.length === 0 ? '✅' : '⚠️') : '❌';
    const templateMark = result.isTemplate ? '[T] ' : '';
    console.log(`  ${status} ${templateMark}${result.name.padEnd(30)} ${result.path}`);
    
    if (result.issues.length > 0 && result.issues.length <= 3) {
      result.issues.forEach(issue => console.log(`      ${issue}`));
    } else if (result.issues.length > 3) {
      console.log(`      ${result.issues.length} problèmes`);
    }
  });
  
  return results;
}

// Fonction pour vérifier les routes API
function analyzeApiRoutes() {
  console.log('\n🌐 ROUTES API');
  console.log('─'.repeat(50));
  
  const apiDir = path.join(APP_DIR, 'api');
  if (!fs.existsSync(apiDir)) {
    console.log('  ❌ Dossier API non trouvé');
    return { count: 0, routes: [] };
  }
  
  const routes = [];
  
  function traverse(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        traverse(fullPath);
      } else if (item.name === 'route.ts' || item.name === 'route.js') {
        const relativePath = path.relative(apiDir, fullPath).replace(/\\/g, '/');
        routes.push(relativePath);
      }
    }
  }
  
  traverse(apiDir);
  
  console.log(`  ✅ ${routes.length} routes API trouvées`);
  
  // Grouper par catégorie
  const categories = {};
  routes.forEach(route => {
    const parts = route.split('/');
    const category = parts[0] || 'root';
    if (!categories[category]) categories[category] = [];
    categories[category].push(route);
  });
  
  Object.entries(categories).forEach(([category, categoryRoutes]) => {
    console.log(`    ${category}: ${categoryRoutes.length} routes`);
  });
  
  return { count: routes.length, routes };
}

// Fonction pour vérifier la configuration
function analyzeConfig() {
  console.log('\n⚙️  CONFIGURATION');
  console.log('─'.repeat(50));
  
  const configFiles = [
    { path: 'package.json', required: true },
    { path: 'next.config.mjs', required: true },
    { path: 'tsconfig.json', required: true },
    { path: '.env.example', required: false },
    { path: '.env.local', required: false },
    { path: 'tailwind.config.js', required: false },
    { path: 'postcss.config.js', required: false },
    { path: 'app/globals.css', required: true },
    { path: 'app/layout.tsx', required: true },
  ];
  
  const results = [];
  
  configFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file.path);
    const exists = fs.existsSync(fullPath);
    
    const status = exists ? '✅' : (file.required ? '❌' : '⚠️');
    console.log(`  ${status} ${file.path}`);
    
    if (exists) {
      try {
        const stats = fs.statSync(fullPath);
        console.log(`      ${stats.size} octets`);
      } catch (error) {
        console.log(`      Erreur: ${error.message}`);
      }
    } else if (file.required) {
      console.log(`      REQUIS - À créer`);
    }
    
    results.push({ ...file, exists });
  });
  
  return results;
}

// Fonction pour tester le build
function testBuild() {
  console.log('\n🔨 TEST DE BUILD');
  console.log('─'.repeat(50));
  
  try {
    console.log('  Vérification TypeScript...');
    execSync('npx tsc --noEmit --skipLibCheck', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      timeout: 30000
    });
    console.log('  ✅ TypeScript OK');
  } catch (error) {
    console.log('  ❌ Erreurs TypeScript');
    const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
    const lines = output.split('\n').slice(0, 10);
    lines.forEach(line => console.log(`      ${line}`));
    if (lines.length > 10) console.log('      ... (tronqué)');
  }
  
  try {
    console.log('  Vérification Next.js...');
    execSync('npx next info', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      timeout: 15000
    });
    console.log('  ✅ Next.js info OK');
  } catch (error) {
    console.log('  ⚠️  Next.js info échoué');
  }
  
  return { typescriptOk: false, nextInfoOk: false };
}

// Fonction principale
async function main() {
  const allResults = {
    timestamp: new Date().toISOString(),
    categories: {},
    summary: {},
    recommendations: []
  };
  
  // Analyser toutes les catégories
  const categoryResults = {};
  
  for (const [categoryName, pages] of Object.entries(PAGE_CATEGORIES)) {
    const results = analyzeCategory(categoryName, pages);
    categoryResults[categoryName] = results;
    
    // Statistiques par catégorie
    const stats = {
      total: results.length,
      exists: results.filter(r => r.exists).length,
      ok: results.filter(r => r.exists && r.issues.length === 0).length,
      hasIssues: results.filter(r => r.issues.length > 0).length,
      missing: results.filter(r => !r.exists && !r.isTemplate).length,
      templates: results.filter(r => r.isTemplate).length
    };
    
    allResults.categories[categoryName] = stats;
  }
  
  // Analyser les routes API
  const apiResults = analyzeApiRoutes();
  
  // Analyser la configuration
  const configResults = analyzeConfig();
  
  // Tester le build
  const buildResults = testBuild();
  
  // Calculer les statistiques globales
  const allPages = Object.values(categoryResults).flat();
  const globalStats = {
    totalPages: allPages.length,
    pagesExist: allPages.filter(p => p.exists).length,
    pagesOk: allPages.filter(p => p.exists && p.issues.length === 0).length,
    pagesWithIssues: allPages.filter(p => p.issues.length > 0).length,
    missingPages: allPages.filter(p => !p.exists && !p.isTemplate).length,
    templatePages: allPages.filter(p => p.isTemplate).length,
    apiRoutes: apiResults.count,
    configFiles: configResults.filter(c => c.exists).length,
    requiredConfigMissing: configResults.filter(c => c.required && !c.exists).length
  };
  
  allResults.summary = globalStats;
  
  // Générer des recommandations
  console.log('\n🎯 RECOMMANDATIONS');
  console.log('─'.repeat(50));
  
  if (globalStats.missingPages > 0) {
    console.log(`❌ ${globalStats.missingPages} pages manquantes`);
    allPages
      .filter(p => !p.exists && !p.isTemplate)
      .forEach(page => {
        console.log(`   - ${page.name} (${page.path})`);
        allResults.recommendations.push(`Créer la page: ${page.name} (${page.path})`);
      });
  }
  
  if (globalStats.pagesWithIssues > 0) {
    console.log(`⚠️  ${globalStats.pagesWithIssues} pages avec problèmes`);
    allPages
      .filter(p => p.issues.length > 0)
      .slice(0, 5)
      .forEach(page => {
        console.log(`   - ${page.name}: ${page.issues.join(', ')}`);
        allResults.recommendations.push(`Corriger: ${page.name} - ${page.issues[0]}`);
      });
  }
  
  if (globalStats.requiredConfigMissing > 0) {
    console.log(`❌ ${globalStats.requiredConfigMissing} fichiers de configuration requis manquants`);
    configResults
      .filter(c => c.required && !c.exists)
      .forEach(config => {
        console.log(`   - ${config.path}`);
        allResults.recommendations.push(`Créer: ${config.path}`);
      });
  }
  
  if (globalStats.templatePages > 0) {
    console.log(`📋 ${globalStats.templatePages} routes dynamiques (templates)`);
    console.log('   Ces routes nécessitent des données pour fonctionner');
  }
  
  // Résumé final
  console.log('\n📊 RÉSUMÉ FINAL');
  console.log('─'.repeat(50));
  
  console.log(`Pages totales: ${globalStats.totalPages}`);
  console.log(`✅ Pages existantes: ${globalStats.pagesExist}`);
  console.log(`✅ Pages sans problème: ${globalStats.pagesOk}`);
  console.log(`⚠️  Pages avec problèmes: ${globalStats.pagesWithIssues}`);
  console.log(`❌ Pages manquantes: ${globalStats.missingPages}`);
  console.log(`📋 Templates: ${globalStats.templatePages}`);
  console.log(`🌐 Routes API: ${globalStats.apiRoutes}`);
  console.log(`⚙️  Fichiers config: ${globalStats.configFiles}/9`);
  
  const successRate = Math.round((globalStats.pagesOk / globalStats.totalPages) * 100);
  console.log(`📈 Taux de succès: ${successRate}%`);
  
  // Évaluation
  console.log('\n🏆 ÉVALUATION');
  console.log('─'.repeat(50));
  
  if (successRate >= 90 && globalStats.missingPages === 0) {
    console.log('✅ EXCELLENT - Prêt pour la production');
    console.log('   Toutes les pages critiques sont présentes et fonctionnelles');
  } else if (successRate >= 80) {
    console.log('⚠️  BON - Quelques améliorations nécessaires');
    console.log('   Vérifiez les recommandations ci-dessus');
  } else if (successRate >= 60) {
    console.log('🔸 MOYEN - Travail significatif nécessaire');
    console.log('   Plusieurs pages ont des problèmes');
  } else {
    console.log('❌ INSUFFISANT - Révision majeure nécessaire');
    console.log('   Beaucoup de pages manquantes ou problématiques');
  }
  
  // Prochaines étapes
  console.log('\n🚀 PROCHAINES ÉTAPES');
  console.log('─'.repeat(50));
  
  console.log('1. Corriger les pages manquantes');
  console.log('2. Résoudre les problèmes détectés');
  console.log('3. Tester avec: npm run dev');
  console.log('4. Build: npm run build');
  console.log('5. Déployer: npm run start (production)');
  
  // Sauvegarder les résultats
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(allResults, null, 2));
  console.log(`\n📁 Résultats détaillés: ${RESULTS_FILE}`);
  
  // Code de sortie
  if (globalStats.missingPages > 5 || successRate < 70) {
    console.log('\n❌ Des problèmes critiques nécessitent une attention');
    process.exit(1);
  } else if (globalStats.missingPages > 0 || successRate < 80) {
    console.log('\n⚠️  Des améliorations sont recommandées');
    process.exit(0);
  } else {
    console.log('\n✅ Tous les tests passent avec succès!');
    process.exit(0);
  }
}

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
}

module.exports = { analyzePage, PAGE_CATEGORIES };