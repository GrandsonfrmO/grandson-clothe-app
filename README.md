# 👔 Grandson Clothes Shop

Application e-commerce moderne pour la vente de vêtements, développée avec Next.js 16 et Supabase.

## ✨ Fonctionnalités

### 🛍️ Côté Client
- **Catalogue produits** avec filtres avancés et recherche
- **Panier d'achat** avec gestion du stock en temps réel
- **Favoris** synchronisés entre appareils
- **Profil utilisateur** avec historique des commandes
- **Checkout** avec support invité et utilisateur connecté
- **Paiement mobile** (Orange Money, Wave, Moov Money)
- **Suivi de commande** en temps réel
- **PWA** - Installation sur mobile et desktop
- **Mode hors ligne** avec synchronisation automatique

### 👨‍💼 Panneau d'Administration
- **Dashboard** avec analytics en temps réel
- **Gestion des produits** (CRUD complet)
- **Gestion des commandes** avec statuts
- **Gestion des utilisateurs**
- **Inventaire** avec tracking des stocks
- **Galerie média** avec optimisation d'images
- **Modèles** et offres spéciales
- **Vidéos** promotionnelles
- **Catégories** et organisation
- **Analytics** détaillées

### 🎨 Design & UX
- Interface moderne et responsive
- Animations fluides
- Optimisation des images (Cloudinary)
- Chargement progressif
- Support multi-langues (FR/EN)
- Thème adaptatif

## 🚀 Technologies

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Storage**: Cloudinary
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime

### Paiement
- Orange Money API
- Wave API
- Moov Money API

### DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (optionnel)

## 📦 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Compte Cloudinary
- Comptes API de paiement (Orange Money, Wave, Moov)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/YOUR-USERNAME/grandson-clothes-shop.git
cd grandson-clothes-shop
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos propres clés :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_random_jwt_secret_min_32_chars

# Payment Gateways
ORANGE_MONEY_API_KEY=your_orange_api_key
ORANGE_MONEY_API_SECRET=your_orange_api_secret
WAVE_API_KEY=your_wave_api_key
MOOV_MONEY_API_KEY=your_moov_api_key

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Configurer la base de données**
```bash
# Exécuter les migrations Supabase
npm run db:migrate

# Seed la base de données (optionnel)
npm run db:seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Build & Déploiement

### Build local
```bash
npm run build
npm run start
```

### Déploiement sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement à chaque push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/grandson-clothes-shop)

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Build
npm run build            # Construire pour la production
npm run start            # Démarrer le serveur de production

# Base de données
npm run db:migrate       # Exécuter les migrations
npm run db:seed          # Seed la base de données
npm run db:reset         # Reset la base de données

# Tests
npm run test             # Exécuter les tests
npm run test:pages       # Tester toutes les pages

# Utilitaires
npm run lint             # Vérifier le code
npm run format           # Formater le code
npm run type-check       # Vérifier TypeScript
```

## 📁 Structure du Projet

```
grandson-clothes-shop/
├── app/                      # Pages Next.js (App Router)
│   ├── (public)/            # Routes publiques
│   ├── admin/               # Panneau d'administration
│   ├── api/                 # API Routes
│   └── layout.tsx           # Layout principal
├── components/              # Composants React
│   ├── admin/              # Composants admin
│   ├── auth/               # Composants d'authentification
│   ├── home/               # Composants page d'accueil
│   └── ui/                 # Composants UI réutilisables
├── lib/                     # Utilitaires et configurations
│   ├── supabase.ts         # Client Supabase
│   ├── auth.ts             # Logique d'authentification
│   ├── cart-context.tsx    # Context du panier
│   └── ...
├── hooks/                   # Custom React Hooks
├── public/                  # Fichiers statiques
├── scripts/                 # Scripts utilitaires
├── supabase/               # Migrations et seeds
│   └── migrations/
├── .env.example            # Exemple de variables d'environnement
├── next.config.mjs         # Configuration Next.js
├── tailwind.config.js      # Configuration Tailwind
└── tsconfig.json           # Configuration TypeScript
```

## 🔐 Sécurité

- ✅ Authentification JWT sécurisée
- ✅ Row Level Security (RLS) sur Supabase
- ✅ Validation des entrées côté serveur
- ✅ Protection CSRF
- ✅ Rate limiting sur les API
- ✅ Sanitization des données
- ✅ HTTPS obligatoire en production
- ✅ Variables d'environnement sécurisées

## 🎯 Roadmap

- [ ] Support multi-devises
- [ ] Programme de fidélité
- [ ] Chat en direct
- [ ] Recommandations IA
- [ ] Application mobile native
- [ ] Support multi-vendeurs
- [ ] Système d'avis et notes
- [ ] Blog intégré
- [ ] Newsletter
- [ ] Codes promo avancés

## 🤝 Contribution

Les contributions sont les bienvenues! Voici comment contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Grandson Clothes Team** - *Développement initial*

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Supabase](https://supabase.com/) pour le backend
- [Vercel](https://vercel.com/) pour l'hébergement
- [Cloudinary](https://cloudinary.com/) pour la gestion des images
- La communauté open source

## 📞 Support

Pour toute question ou problème :

- 📧 Email: support@grandsonclothes.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR-USERNAME/grandson-clothes-shop/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/YOUR-USERNAME/grandson-clothes-shop/discussions)

## 📊 Statistiques

![GitHub stars](https://img.shields.io/github/stars/YOUR-USERNAME/grandson-clothes-shop?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR-USERNAME/grandson-clothes-shop?style=social)
![GitHub issues](https://img.shields.io/github/issues/YOUR-USERNAME/grandson-clothes-shop)
![GitHub license](https://img.shields.io/github/license/YOUR-USERNAME/grandson-clothes-shop)

---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile sur GitHub!
