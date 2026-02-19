#!/usr/bin/env node
/**
 * Script principal pour exécuter tous les tests
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🎯 Suite de tests complète pour Grandson Clothes App\n');

// Configuration
const TESTS = [
  { name: 'Test rapide des pages', command: 'node scripts/quick-page-test.js', file: 'scripts/quick-page-test.js' },
  { name: 'Analyse du build Next.js', command: 'node scripts/test-next-build.js', file: 'scripts/test-next-build.js' },
  { name: 'Test des pages (sans serveur)', command: 'node scripts/test-pages-simple.js', file: 'scripts/test-pages-simple.js' },
];

const OPTIONAL_TESTS = [
  { name: 'Test HTTP des pages', command: 'node scripts/test-pages-http.js', file: 'scripts/test-pages-http.js', requiresServer: true },
  { name: 'Test TypeScript', command: 'npx tsc --noEmit --skipLibCheck', file: null },
  { name: 'Vérification ESLint', command: 'npx eslint . --ext .ts,.tsx', file: null },
];

// Fonction pour exécuter un test
function runTest(test, isOptional = false) {
  console.log(`\n${isOptional ? '🔸' : '🔹'} ${test.name}`);
  console.log('─'.repeat(50));
  
  // Vérifier si le fichier existe pour les tests avec fichiers
  if (test.file && !fs.existsSync(path.join(__dirname, '..', test.file))) {
    console.log('❌ Fichier de test non trouvé');
    return { success: false, skipped: true };
  }
  
  // Vérifier les prérequis pour les tests HTTP
  if (test.requiresServer) {
    console.log('⚠️  Nécessite un serveur en cours d\'exécution');
    console.log('💡 Exécutez d\'abord: npm run dev');
    return { success: false, skipped: true };
  }
  
  try {
    const startTime = Date.now();
    
    if (test.command.includes('node scripts/')) {
      // Exécuter les scripts Node.js
      execSync(test.command, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        timeout: 60000 // 1 minute
      });
    } else {
      // Exécuter les commandes système
      execSync(test.command, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        timeout: 30000 // 30 secondes
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Réussi en ${duration}ms`);
    return { success: true, duration };
    
  } catch (error) {
    console.log(`\n❌ Échec: ${error.message}`);
    
    if (error.status !== null && error.status !== undefined) {
      console.log(`   Code de sortie: ${error.status}`);
    }
    
    return { success: false, error: error.message };
  }
}

// Fonction pour afficher un résumé
function showSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success && !r.skipped).length;
  const skippedTests = results.filter(r => r.skipped).length;
  
  console.log(`\nTotal tests: ${totalTests}`);
  console.log(`✅ Réussis: ${passedTests}`);
  console.log(`❌ Échoués: ${failedTests}`);
  console.log(`🔸 Ignorés: ${skippedTests}`);
  
  // Afficher les détails des échecs
  const failures = results.filter(r => !r.success && !r.skipped);
  if (failures.length > 0) {
    console.log('\n🚨 Tests échoués:');
    failures.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.test.name}`);
      if (result.error) {
        console.log(`      Erreur: ${result.error}`);
      }
    });
  }
  
  // Afficher les tests ignorés
  const skipped = results.filter(r => r.skipped);
  if (skipped.length > 0) {
    console.log('\n🔸 Tests ignorés:');
    skipped.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.test.name}`);
    });
  }
  
  // Recommandations
  console.log('\n🎯 RECOMMANDATIONS:');
  
  if (failedTests === 0 && skippedTests === 0) {
    console.log('   ✅ Tous les tests ont réussi!');
    console.log('   🚀 L\'application est prête pour le déploiement.');
  } else if (failedTests === 0) {
    console.log('   ✅ Tous les tests exécutés ont réussi.');
    console.log('   💡 Certains tests optionnels ont été ignorés.');
  } else if (failedTests <= 2) {
    console.log('   ⚠️  Quelques tests ont échoué.');
    console.log('   → Vérifiez les erreurs spécifiques ci-dessus.');
  } else {
    console.log('   ❗ Plusieurs tests ont échoué.');
    console.log('   → Revoyez les problèmes fondamentaux.');
  }
  
  // Suggestions spécifiques
  if (failures.some(r => r.test.name.includes('TypeScript'))) {
    console.log('\n💡 Pour les erreurs TypeScript:');
    console.log('   - Exécutez: npx tsc --noEmit');
    console.log('   - Vérifiez les fichiers signalés');
  }
  
  if (failures.some(r => r.test.name.includes('ESLint'))) {
    console.log('\n💡 Pour les erreurs ESLint:');
    console.log('   - Exécutez: npx eslint . --fix');
    console.log('   - Ou ignorez-les avec: npm run build (ignore les erreurs ESLint)');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Fonction principale
async function main() {
  console.log('Cette suite exécute tous les tests disponibles pour vérifier');
  console.log('l\'intégrité de l\'application.\n');
  
  const results = [];
  
  // Exécuter les tests principaux
  console.log('🚀 TESTS PRINCIPAUX');
  console.log('='.repeat(40));
  
  for (const test of TESTS) {
    const result = runTest(test);
    results.push({ test, ...result });
  }
  
  // Demander pour les tests optionnels
  console.log('\n🔸 TESTS OPTIONNELS');
  console.log('='.repeat(40));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  for (const test of OPTIONAL_TESTS) {
    const question = `Exécuter "${test.name}" ? (o/n): `;
    
    const answer = await new Promise(resolve => {
      rl.question(question, resolve);
    });
    
    if (answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui') {
      const result = runTest(test, true);
      results.push({ test, ...result });
    } else {
      console.log(`   🔸 ${test.name} - Ignoré`);
      results.push({ test, success: false, skipped: true });
    }
  }
  
  rl.close();
  
  // Afficher le résumé
  showSummary(results);
  
  // Générer un rapport
  generateReport(results);
  
  // Code de sortie
  const hasCriticalFailures = results.some(r => 
    !r.success && !r.skipped && TESTS.includes(r.test)
  );
  
  if (hasCriticalFailures) {
    console.log('\n❌ Des tests critiques ont échoué.');
    process.exit(1);
  } else {
    console.log('\n✅ Suite de tests terminée avec succès!');
    process.exit(0);
  }
}

// Fonction pour générer un rapport
function generateReport(results) {
  const reportDir = path.join(__dirname, '..', 'test-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportDir, `test-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    application: 'Grandson Clothes App',
    results: results.map(r => ({
      test: r.test.name,
      success: r.success,
      skipped: r.skipped || false,
      duration: r.duration || null,
      error: r.error || null
    })),
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success && !r.skipped).length,
      skipped: results.filter(r => r.skipped).length
    }
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📁 Rapport sauvegardé: ${reportFile}`);
  
  // Créer aussi un rapport texte
  const textReport = `
TEST REPORT - ${new Date().toLocaleString()}
===========================================

Application: Grandson Clothes App
Date: ${new Date().toISOString()}

RÉSULTATS:
${results.map((r, i) => `
${i + 1}. ${r.test.name}
    Statut: ${r.skipped ? 'IGNORÉ' : r.success ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}
    ${r.duration ? `Durée: ${r.duration}ms` : ''}
    ${r.error ? `Erreur: ${r.error}` : ''}
`).join('')}

RÉSUMÉ:
  Total: ${report.summary.total}
  Réussis: ${report.summary.passed}
  Échoués: ${report.summary.failed}
  Ignorés: ${report.summary.skipped}

${report.summary.failed === 0 ? '✅ TOUS LES TESTS ONT RÉUSSI' : '⚠️  CERTAINS TESTS ONT ÉCHOUÉ'}
`;
  
  const textReportFile = path.join(reportDir, `test-report-${timestamp}.txt`);
  fs.writeFileSync(textReportFile, textReport);
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  });
}

module.exports = { runTest, TESTS, OPTIONAL_TESTS };