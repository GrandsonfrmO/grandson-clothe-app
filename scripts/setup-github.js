#!/usr/bin/env node
/**
 * Script d'aide pour configurer GitHub
 * Guide l'utilisateur à travers le processus d'importation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

async function checkGitInstalled() {
  console.log('🔍 Vérification de Git...');
  try {
    const version = exec('git --version', { silent: true });
    console.log(`✅ Git installé: ${version.trim()}`);
    return true;
  } catch (error) {
    console.log('❌ Git n\'est pas installé');
    console.log('📥 Téléchargez Git: https://git-scm.com/downloads');
    return false;
  }
}

async function checkGitConfig() {
  console.log('\n🔍 Vérification de la configuration Git...');
  
  try {
    const name = exec('git config --global user.name', { silent: true, ignoreError: true });
    const email = exec('git config --global user.email', { silent: true, ignoreError: true });
    
    if (!name || !email) {
      console.log('⚠️  Configuration Git incomplète');
      
      const userName = await question('Votre nom complet: ');
      const userEmail = await question('Votre email: ');
      
      exec(`git config --global user.name "${userName}"`);
      exec(`git config --global user.email "${userEmail}"`);
      
      console.log('✅ Configuration Git mise à jour');
    } else {
      console.log(`✅ Nom: ${name.trim()}`);
      console.log(`✅ Email: ${email.trim()}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la configuration Git');
    return false;
  }
}

async function checkSensitiveFiles() {
  console.log('\n🔒 Vérification des fichiers sensibles...');
  
  const sensitiveFiles = [
    '.env.local',
    '.env.development.local',
    '.env.production.local',
    'node_modules',
    '.next'
  ];
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.log('⚠️  .gitignore non trouvé');
    return false;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  
  let allGood = true;
  sensitiveFiles.forEach(file => {
    if (gitignoreContent.includes(file)) {
      console.log(`✅ ${file} est ignoré`);
    } else {
      console.log(`⚠️  ${file} n'est PAS ignoré`);
      allGood = false;
    }
  });
  
  return allGood;
}

async function initGitRepo() {
  console.log('\n📦 Initialisation du repository Git...');
  
  // Vérifier si Git est déjà initialisé
  if (fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log('✅ Repository Git déjà initialisé');
    return true;
  }
  
  try {
    exec('git init');
    console.log('✅ Repository Git initialisé');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de l\'initialisation');
    return false;
  }
}

async function createInitialCommit() {
  console.log('\n📝 Création du commit initial...');
  
  try {
    // Vérifier s'il y a déjà des commits
    const hasCommits = exec('git log --oneline', { silent: true, ignoreError: true });
    
    if (hasCommits) {
      console.log('✅ Des commits existent déjà');
      return true;
    }
    
    console.log('Ajout des fichiers...');
    exec('git add .');
    
    console.log('Création du commit...');
    exec('git commit -m "Initial commit: Grandson Clothes Shop"');
    
    console.log('✅ Commit initial créé');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la création du commit');
    console.log('💡 Vérifiez qu\'il y a des fichiers à commiter');
    return false;
  }
}

async function setupRemote() {
  console.log('\n🌐 Configuration du remote GitHub...');
  
  console.log('\n📋 Instructions:');
  console.log('1. Allez sur https://github.com');
  console.log('2. Cliquez sur "+" > "New repository"');
  console.log('3. Nommez votre repository (ex: grandson-clothes-shop)');
  console.log('4. Choisissez Private ou Public');
  console.log('5. NE PAS cocher "Initialize with README"');
  console.log('6. Cliquez sur "Create repository"\n');
  
  const proceed = await question('Avez-vous créé le repository sur GitHub? (o/n): ');
  
  if (proceed.toLowerCase() !== 'o' && proceed.toLowerCase() !== 'oui') {
    console.log('⏸️  Créez d\'abord le repository sur GitHub');
    return false;
  }
  
  const repoUrl = await question('\nCollez l\'URL du repository (ex: https://github.com/username/repo.git): ');
  
  if (!repoUrl || !repoUrl.includes('github.com')) {
    console.log('❌ URL invalide');
    return false;
  }
  
  try {
    // Vérifier si un remote existe déjà
    const existingRemote = exec('git remote get-url origin', { silent: true, ignoreError: true });
    
    if (existingRemote) {
      console.log('⚠️  Un remote "origin" existe déjà');
      const replace = await question('Voulez-vous le remplacer? (o/n): ');
      
      if (replace.toLowerCase() === 'o' || replace.toLowerCase() === 'oui') {
        exec(`git remote set-url origin ${repoUrl}`);
        console.log('✅ Remote mis à jour');
      }
    } else {
      exec(`git remote add origin ${repoUrl}`);
      console.log('✅ Remote ajouté');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la configuration du remote');
    return false;
  }
}

async function pushToGitHub() {
  console.log('\n🚀 Push vers GitHub...');
  
  const confirm = await question('Êtes-vous prêt à pousser le code? (o/n): ');
  
  if (confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'oui') {
    console.log('⏸️  Push annulé');
    return false;
  }
  
  try {
    console.log('Configuration de la branche main...');
    exec('git branch -M main', { ignoreError: true });
    
    console.log('Push en cours...');
    exec('git push -u origin main');
    
    console.log('✅ Code poussé sur GitHub avec succès!');
    return true;
  } catch (error) {
    console.log('❌ Erreur lors du push');
    console.log('\n💡 Problèmes courants:');
    console.log('   - Vérifiez vos identifiants GitHub');
    console.log('   - Vérifiez que le repository existe');
    console.log('   - Essayez: git push -u origin main --force (attention!)');
    return false;
  }
}

async function createReadme() {
  console.log('\n📄 Vérification du README...');
  
  const readmePath = path.join(process.cwd(), 'README.md');
  
  if (fs.existsSync(readmePath)) {
    console.log('✅ README.md existe déjà');
    return true;
  }
  
  const create = await question('Voulez-vous créer un README.md? (o/n): ');
  
  if (create.toLowerCase() !== 'o' && create.toLowerCase() !== 'oui') {
    console.log('⏭️  README ignoré');
    return false;
  }
  
  const readmeContent = `# Grandson Clothes Shop

E-commerce application for fashion retail.

## 🚀 Technologies

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Image Hosting**: Cloudinary
- **Payment**: Orange Money, Wave, Moov Money

## 📦 Installation

\`\`\`bash
# Cloner le repository
git clone https://github.com/YOUR-USERNAME/grandson-clothes-shop.git

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Configurer les variables dans .env.local

# Lancer le serveur de développement
npm run dev
\`\`\`

## 🔧 Configuration

Créez un fichier \`.env.local\` avec les variables suivantes:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_jwt_secret

# Payment Gateways
ORANGE_MONEY_API_KEY=your_orange_api_key
WAVE_API_KEY=your_wave_api_key
MOOV_MONEY_API_KEY=your_moov_api_key
\`\`\`

## 🏗️ Build

\`\`\`bash
npm run build
npm run start
\`\`\`

## 📝 Scripts

- \`npm run dev\` - Démarrer le serveur de développement
- \`npm run build\` - Construire pour la production
- \`npm run start\` - Démarrer le serveur de production
- \`npm run lint\` - Vérifier le code

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez créer une issue ou une pull request.

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.

## 👤 Auteur

Grandson Clothes Shop Team

## 🔗 Liens

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ README.md créé');
  
  return true;
}

async function showSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  
  try {
    const remote = exec('git remote get-url origin', { silent: true });
    const branch = exec('git branch --show-current', { silent: true });
    const lastCommit = exec('git log -1 --oneline', { silent: true, ignoreError: true });
    
    console.log(`\n✅ Repository: ${remote.trim()}`);
    console.log(`✅ Branche: ${branch.trim()}`);
    if (lastCommit) {
      console.log(`✅ Dernier commit: ${lastCommit.trim()}`);
    }
    
    console.log('\n🎉 Votre projet est maintenant sur GitHub!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Visitez votre repository sur GitHub');
    console.log('   2. Ajoutez une description et des topics');
    console.log('   3. Configurez les GitHub Actions (CI/CD)');
    console.log('   4. Invitez des collaborateurs si nécessaire');
    console.log('   5. Protégez la branche main');
    
    console.log('\n💡 Commandes Git utiles:');
    console.log('   git status          - Voir l\'état des fichiers');
    console.log('   git add .           - Ajouter tous les fichiers');
    console.log('   git commit -m "msg" - Créer un commit');
    console.log('   git push            - Pousser les changements');
    console.log('   git pull            - Récupérer les changements');
    
  } catch (error) {
    console.log('⚠️  Impossible d\'afficher le résumé complet');
  }
}

async function main() {
  console.log('🚀 CONFIGURATION GITHUB POUR GRANDSON CLOTHES SHOP\n');
  console.log('Ce script va vous guider pour importer votre projet sur GitHub.\n');
  
  // Étape 1: Vérifier Git
  if (!await checkGitInstalled()) {
    rl.close();
    return;
  }
  
  // Étape 2: Vérifier la configuration Git
  if (!await checkGitConfig()) {
    rl.close();
    return;
  }
  
  // Étape 3: Vérifier les fichiers sensibles
  await checkSensitiveFiles();
  
  // Étape 4: Créer README si nécessaire
  await createReadme();
  
  // Étape 5: Initialiser Git
  if (!await initGitRepo()) {
    rl.close();
    return;
  }
  
  // Étape 6: Créer le commit initial
  if (!await createInitialCommit()) {
    rl.close();
    return;
  }
  
  // Étape 7: Configurer le remote
  if (!await setupRemote()) {
    rl.close();
    return;
  }
  
  // Étape 8: Push vers GitHub
  if (!await pushToGitHub()) {
    rl.close();
    return;
  }
  
  // Étape 9: Afficher le résumé
  await showSummary();
  
  rl.close();
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('\n❌ Erreur:', error.message);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⏸️  Processus interrompu par l\'utilisateur');
  rl.close();
  process.exit(0);
});

// Exécuter
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    rl.close();
    process.exit(1);
  });
}

module.exports = { checkGitInstalled, checkGitConfig, checkSensitiveFiles };