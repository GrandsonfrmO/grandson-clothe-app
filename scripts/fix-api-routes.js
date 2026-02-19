#!/usr/bin/env node
/**
 * Script pour corriger les routes API Next.js 16+
 * Les params sont maintenant des Promises dans Next.js 16+
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des routes API Next.js 16+\n');

const API_DIR = path.join(__dirname, '..', 'app', 'api');
let filesFixed = 0;
let filesSkipped = 0;
let errors = 0;

// Fonction pour corriger un fichier
function fixRouteFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Vérifier si c'est une route avec params
    if (!content.includes('{ params }') && !content.includes('params:')) {
      return false; // Pas une route avec params
    }
    
    // Vérifier si déjà corrigé
    if (content.includes('params: Promise<') || content.includes('await params')) {
      return false; // Déjà corrigé
    }
    
    let newContent = content;
    
    // Pattern 1: { params }: { params: { id: string } }
    const pattern1 = /\{ params \}: \{ params: \{ ([^}]+) \} \}/g;
    newContent = newContent.replace(pattern1, '{ params }: { params: Promise<{ $1 }> }');
    
    // Pattern 2: { params: { id: string } }
    const pattern2 = /\{ params: \{ ([^}]+) \} \}/g;
    newContent = newContent.replace(pattern2, '{ params }: { params: Promise<{ $1 }> }');
    
    // Pattern 3: params: { id: string }
    const pattern3 = /params: \{ ([^}]+) \}/g;
    newContent = newContent.replace(pattern3, '{ params }: { params: Promise<{ $1 }> }');
    
    // Ajouter await pour extraire les params
    if (newContent !== content) {
      // Trouver les extractions de params comme const { id } = params;
      const paramExtractionPattern = /const\s*\{([^}]+)\}\s*=\s*params\s*;/g;
      newContent = newContent.replace(paramExtractionPattern, 'const { $1 } = await params;');
      
      // Trouver les extractions de params comme const id = params.id;
      const paramDotPattern = /const\s+(\w+)\s*=\s*params\.(\w+)\s*;/g;
      newContent = newContent.replace(paramDotPattern, 'const { $2: $1 } = await params;');
      
      fs.writeFileSync(filePath, newContent, 'utf-8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ❌ Erreur: ${filePath} - ${error.message}`);
    errors++;
    return false;
  }
}

// Fonction pour parcourir récursivement
function traverseDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (item.name === 'route.ts' || item.name === 'route.js') {
      console.log(`  📄 ${path.relative(API_DIR, fullPath)}`);
      
      if (fixRouteFile(fullPath)) {
        console.log(`    ✅ Corrigé`);
        filesFixed++;
      } else {
        console.log(`    ⏭️  Déjà OK ou sans params`);
        filesSkipped++;
      }
    }
  }
}

// Vérifier si le dossier API existe
if (!fs.existsSync(API_DIR)) {
  console.log('❌ Dossier API non trouvé');
  process.exit(1);
}

// Parcourir et corriger
console.log('Recherche des routes API...\n');
traverseDirectory(API_DIR);

// Résumé
console.log('\n📊 RÉSUMÉ:');
console.log(`✅ Fichiers corrigés: ${filesFixed}`);
console.log(`⏭️  Fichiers ignorés: ${filesSkipped}`);
console.log(`❌ Erreurs: ${errors}`);

if (filesFixed > 0) {
  console.log('\n🎯 RECOMMANDATIONS:');
  console.log('1. Testez les routes corrigées avec: npm run dev');
  console.log('2. Vérifiez le build: npm run build');
  console.log('3. Les params sont maintenant des Promises, utilisez await');
  
  console.log('\n📝 Exemple de correction:');
  console.log('AVANT: export async function GET(request, { params }: { params: { id: string } }) {');
  console.log('      const { id } = params;');
  console.log('');
  console.log('APRÈS: export async function GET(request, { params }: { params: Promise<{ id: string }> }) {');
  console.log('      const { id } = await params;');
} else {
  console.log('\n✅ Toutes les routes sont déjà à jour!');
}

console.log('\n🔧 Correction terminée!');