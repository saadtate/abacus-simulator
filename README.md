# 🧮 Historical Abacus Simulator

Un simulateur interactif en **React + TypeScript** qui permet d’explorer et de manipuler les principaux types d’abaques historiques, des tablettes mésopotamiennes au **Soroban japonais**.

## 📜 Historique
L’abaque est l’un des plus anciens dispositifs de calcul mécanique. Il a été utilisé à travers différentes civilisations :
- Abacus babylonien (~3000 av. J.-C.)
- Tablettes de calcul égyptiennes (~2000 av. J.-C.)
- Abax grec (~500 av. J.-C.)
- Calculi romain (Ier s. apr. J.-C.)
- Suanpan chinois (~200 av. J.-C. → XIVe siècle)
- Soroban japonais (XVIIe siècle)

Ce projet illustre ces variantes dans une interface moderne et pédagogique.

## 🚀 Fonctionnalités
- Sélecteur de type d’abacus (Babylonien, Égyptien, Grec, Romain, Suanpan, Soroban).
- Manipulation interactive des jetons ou perles.
- Calcul automatique de la valeur représentée.
- Affichage des puissances de position selon la base utilisée (10 ou 60).
- Interface moderne avec **React + Tailwind CSS**.

## 📦 Installation

Clonez le dépôt :
```bash
git clone https://github.com/saadtate/historical-abacus.git
cd historical-abacus


Installez les dépendances :
npm install
Lancez le projet en mode développement :
npm start
Accédez ensuite à l’application via :
http://localhost:3000
📂 Structure du projet
bash
Copier le code
src/
  ├─ components/
  │   └─ AbacusSimulator.tsx   # Composant principal du simulateur
  ├─ App.tsx
  ├─ index.tsx
  └─ styles/                   # Styles globaux (ex: Tailwind)
