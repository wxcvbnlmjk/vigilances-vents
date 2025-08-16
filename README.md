# 🌤️ Application Météo - Vents et Vigilances

Une application météo complète développée en React TypeScript avec deux fonctionnalités principales :

## ✨ Fonctionnalités

### 💨 Carte des Vents
- Visualisation en temps réel des vents sur la France
- Données provenant de l'API Open-Meteo
- Contrôles de densité et d'épaisseur des particules
- Mode jour/nuit
- Différentes palettes de couleurs
- Cache local pour optimiser les performances

### ⚠️ Carte des Vigilances
- Carte des vigilances météorologiques françaises
- Filtres par département et type de phénomène
- Données en temps réel et mode test
- Interface intuitive avec DaisyUI

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm run dev

# Construire l'application pour la production
npm run build

# Prévisualiser la version de production
npm run preview
```

## 🏗️ Structure du Projet

```
meteo/
├── src/                    # Application principale
│   ├── App.tsx           # Composant principal avec onglets
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── src_vents/            # Module carte des vents
│   ├── App.tsx           # Composant carte des vents
│   └── ...
├── src_vigilance/        # Module vigilances météo
│   ├── App.tsx           # Composant vigilances
│   ├── components/       # Composants spécifiques
│   ├── services/         # API et services
│   └── types/            # Types TypeScript
├── package.json           # Dépendances et scripts
├── vite.config.ts         # Configuration Vite
└── tailwind.config.js     # Configuration Tailwind CSS
```

## 🛠️ Technologies Utilisées

- **React 18** - Framework frontend
- **TypeScript** - Typage statique
- **Vite** - Build tool et serveur de développement
- **Tailwind CSS** - Framework CSS utilitaire
- **Leaflet** - Bibliothèque de cartes
- **Leaflet-Velocity** - Visualisation des vents

## 📱 Utilisation

1. **Navigation** : Utilisez les onglets en haut de l'écran pour basculer entre les deux fonctionnalités
2. **Carte des Vents** : 
   - Ajustez la densité et l'épaisseur des particules
   - Basculez entre mode jour et nuit
   - Changez les couleurs de visualisation
3. **Vigilances** : 
   - Filtrez par département et type de phénomène
   - Passez en mode test pour les données de démonstration

## 🔧 Configuration

L'application utilise plusieurs APIs et services :
- **Open-Meteo** : Données météorologiques pour les vents
- **API Vigilances** : Données de vigilance météorologique française

## 📄 Licence

Ce projet est open source et disponible sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub.
