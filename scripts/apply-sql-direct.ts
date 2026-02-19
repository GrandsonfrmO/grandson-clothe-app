/**
 * APPLICATION DIRECTE DU SQL VIA POSTGRES
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

config({ path: '.env.local' });

const { Pool } = pg;

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║        🔧 APPLICATION DIRECTE DE LA MIGRATION SQL        ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Créer la connexion PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Lire le fichier SQL
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260207_fix_all_issues.sql');
    console.log('📄 Lecture de:', migrationPath, '\n');
    
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Exécution de la migration...\n');

    // Exécuter le SQL
    await pool.query(sql);

    console.log('✅ Migration appliquée avec succès!\n');

    // Vérification
    console.log('🔍 VÉRIFICATION POST-MIGRATION\n');

    const checks = [
      { name: 'users', query: 'SELECT COUNT(*) FROM users LIMIT 1' },
      { name: 'products', query: 'SELECT COUNT(*) FROM products LIMIT 1' },
      { name: 'categories', query: 'SELECT COUNT(*) FROM categories LIMIT 1' },
      { name: 'orders', query: 'SELECT COUNT(*) FROM orders LIMIT 1' },
      { name: 'reviews', query: 'SELECT COUNT(*) FROM reviews LIMIT 1' },
      { name: 'gallery.is_active', query: 'SELECT is_active FROM gallery LIMIT 1' },
      { name: 'special_offer', query: 'SELECT COUNT(*) FROM special_offer LIMIT 1' },
      { name: 'inventory', query: 'SELECT COUNT(*) FROM inventory LIMIT 1' },
      { name: 'app_icons', query: 'SELECT COUNT(*) FROM app_icons LIMIT 1' }
    ];

    let passCount = 0;
    let failCount = 0;

    for (const check of checks) {
      try {
        await pool.query(check.query);
        console.log(`✅ ${check.name}: OK`);
        passCount++;
      } catch (error: any) {
        console.log(`❌ ${check.name}: ${error.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Résultat: ${passCount}/${checks.length} vérifications réussies\n`);

    if (failCount === 0) {
      console.log('🎉 TOUTES LES VÉRIFICATIONS SONT PASSÉES!\n');
    }

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ PROCESSUS TERMINÉ');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Prochaine étape: npx tsx scripts/test-site-complet.ts\n');
}

main();
