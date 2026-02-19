# Guide d'importation sur GitHub

## 📋 Prérequis

1. Avoir un compte GitHub (créer sur https://github.com)
2. Avoir Git installé sur votre machine
3. Configurer Git avec vos informations :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

## 🚀 Méthode 1 : Via l'interface GitHub (Recommandé pour débutants)

### Étape 1 : Créer un nouveau repository sur GitHub

1. Allez sur https://github.com
2. Cliquez sur le bouton "+" en haut à droite
3. Sélectionnez "New repository"
4. Remplissez les informations :
   - **Repository name** : `grandson-clothes-shop` (ou le nom de votre choix)
   - **Description** : "E-commerce application for Grandson Clothes"
   - **Visibility** : Private (recommandé) ou Public
   - **NE PAS** cocher "Initialize with README" (vous en avez déjà un)
5. Cliquez sur "Create repository"

### Étape 2 : Initialiser Git localement

Ouvrez un terminal dans le dossier de votre projet et exécutez :

```bash
# Initialiser le repository Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit: Grandson Clothes Shop"
```

### Étape 3 : Connecter au repository GitHub

Remplacez `VOTRE-USERNAME` et `VOTRE-REPO` par vos informations :

```bash
# Ajouter le remote
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git

# Pousser le code
git branch -M main
git push -u origin main
```

## 🔧 Méthode 2 : Via le script automatique

Exécutez simplement :

```bash
node scripts/setup-github.js
```

Le script vous guidera à travers le processus.

## ⚠️ Vérifications importantes avant de pousser

### 1. Vérifier que les fichiers sensibles sont ignorés

```bash
# Vérifier que .env.local n'est PAS dans la liste
git status
```

Si vous voyez `.env.local` ou d'autres fichiers sensibles, ils ne doivent PAS être commités !

### 2. Créer un README.md

Un bon README doit contenir :
- Description du projet
- Technologies utilisées
- Instructions d'installation
- Variables d'environnement nécessaires
- Instructions de déploiement

### 3. Vérifier le .gitignore

Assurez-vous que ces fichiers/dossiers sont ignorés :
- ✅ `.env.local`
- ✅ `node_modules/`
- ✅ `.next/`
- ✅ `supabase/.temp/`
- ✅ `.kiro/`

## 📝 Commandes Git utiles

### Vérifier l'état
```bash
git status
```

### Ajouter des fichiers
```bash
# Ajouter tous les fichiers
git add .

# Ajouter un fichier spécifique
git add chemin/vers/fichier.ts
```

### Créer un commit
```bash
git commit -m "Description des changements"
```

### Pousser les changements
```bash
git push
```

### Voir l'historique
```bash
git log --oneline
```

### Créer une branche
```bash
git checkout -b nom-de-la-branche
```

## 🔐 Sécurité

### Fichiers à NE JAMAIS commiter :

- ❌ `.env.local` (contient vos clés API)
- ❌ `node_modules/` (trop volumineux)
- ❌ `.next/` (fichiers de build)
- ❌ Fichiers de base de données locales
- ❌ Clés privées ou certificats

### Si vous avez accidentellement commité un fichier sensible :

```bash
# Retirer le fichier de Git mais le garder localement
git rm --cached .env.local

# Ajouter au .gitignore
echo ".env.local" >> .gitignore

# Commiter le changement
git add .gitignore
git commit -m "Remove sensitive file from Git"
git push
```

⚠️ **Important** : Si des secrets ont été exposés, changez-les immédiatement !

## 🌿 Workflow Git recommandé

### Pour le développement quotidien :

```bash
# 1. Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire vos modifications
# ... coder ...

# 3. Ajouter et commiter
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# 4. Pousser la branche
git push -u origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request sur GitHub
# 6. Merger après review
# 7. Revenir sur main
git checkout main
git pull
```

## 📦 Structure du projet pour GitHub

Fichiers recommandés à la racine :

- ✅ `README.md` - Description du projet
- ✅ `LICENSE` - Licence du projet
- ✅ `.gitignore` - Fichiers à ignorer
- ✅ `.env.example` - Exemple de variables d'environnement
- ✅ `package.json` - Dépendances
- ✅ `CONTRIBUTING.md` - Guide de contribution (optionnel)
- ✅ `CHANGELOG.md` - Historique des versions (optionnel)

## 🚀 Après l'importation

### 1. Configurer GitHub Actions (CI/CD)

Créez `.github/workflows/ci.yml` pour automatiser les tests et le déploiement.

### 2. Protéger la branche main

Dans les paramètres du repository :
- Settings > Branches > Add rule
- Cocher "Require pull request reviews before merging"

### 3. Ajouter des badges au README

```markdown
![Build Status](https://github.com/USERNAME/REPO/workflows/CI/badge.svg)
![License](https://img.shields.io/github/license/USERNAME/REPO)
```

## 🆘 Problèmes courants

### "Permission denied"
```bash
# Utiliser HTTPS au lieu de SSH
git remote set-url origin https://github.com/USERNAME/REPO.git
```

### "Repository not found"
```bash
# Vérifier l'URL du remote
git remote -v

# Corriger si nécessaire
git remote set-url origin https://github.com/USERNAME/REPO.git
```

### Fichiers trop volumineux
```bash
# GitHub limite à 100MB par fichier
# Utiliser Git LFS pour les gros fichiers
git lfs install
git lfs track "*.psd"
```

## 📚 Ressources

- [Documentation Git](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ✅ Checklist finale

Avant de pousser votre code :

- [ ] `.gitignore` est configuré correctement
- [ ] `.env.local` n'est PAS dans Git
- [ ] `README.md` est à jour
- [ ] `.env.example` contient toutes les variables nécessaires
- [ ] Le code compile sans erreur (`npm run build`)
- [ ] Les tests passent (si vous en avez)
- [ ] Pas de `console.log()` ou code de debug
- [ ] Les commentaires sont en anglais (bonne pratique)
- [ ] Le code est formaté correctement

## 🎉 Félicitations !

Votre projet est maintenant sur GitHub ! 🚀

N'oubliez pas de :
- Faire des commits réguliers avec des messages clairs
- Créer des branches pour les nouvelles fonctionnalités
- Documenter votre code
- Garder votre README à jour
