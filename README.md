# 📌 Documentation de l'API Boutique

## 🚀 Installation

### Prérequis

- Node.js installé
- MySQL installé et configuré

### Étapes d'installation

```sh
# Cloner le projet
git clone https://github.com/votre-repo/boutique-api.git
cd boutique-api

# Installer les dépendances
npm install

# Configurer la base de données
- Créer une base de données MySQL
- Modifier le fichier de configuration avec vos informations de connexion

# Exécuter les scripts SQL
mysql -u root -p < db.sql
mysql -u root -p < data.sql

# Lancer le serveur
npm start
```

---

## 🏛️ Schéma de la Base de Données

### 📂 Tables principales :

1. **Categories** (`id_categorie`, `nom_categorie`)
2. **Fournisseurs** (`id_fournisseur`, `nom`, `adresse`, `telephone`, `email`)
3. **Produits** (`id_produit`, `reference`, `nom_produit`, `description`, `prix_unitaire`, `quantite_stock`, `id_categorie`)
4. **Clients** (`id_client`, `nom`, `adresse`, `telephone`, `email`)
5. **Commandes** (`id_commande`, `date_commande`, `id_client`, `statut`)
6. **Lignes_Commande** (`id_ligne`, `id_commande`, `id_produit`, `quantite`, `prix_unitaire`)

### 🔗 Relations principales :

- **Produits** → appartient à une **Catégorie** (FK: `id_categorie`)
- **Produits** → fourni par un ou plusieurs **Fournisseurs** (table pivot `Produits_Fournisseurs`)
- **Commandes** → passées par un **Client** (FK: `id_client`)
- **Lignes_Commande** → détaille les **Produits** commandés (FK: `id_produit`, `id_commande`)

---

## 🔥 Endpoints de l’API

### ✅ Produits

- **Créer un produit**  
  `POST /produits`
  ```json
  {
    "reference": "P123",
    "nom_produit": "T-shirt Noir",
    "description": "T-shirt 100% coton",
    "prix_unitaire": 19.99,
    "quantite_stock": 50,
    "id_categorie": 1
  }
  ```
- **Lister les produits**  
  `GET /produits`
- **Consulter un produit**  
  `GET /produits/:id`
- **Modifier un produit**  
  `PUT /produits/:id`
- **Supprimer un produit**  
  `DELETE /produits/:id`
- **Produits en stock faible**  
  `GET /produits/stock-faible?seuil=10`

### ✅ Clients

- **Créer un client**  
  `POST /clients`
- **Lister les clients**  
  `GET /clients`
- **Consulter un client**  
  `GET /clients/:id`
- **Modifier un client**  
  `PUT /clients/:id`
- **Supprimer un client**  
  `DELETE /clients/:id`

### ✅ Commandes

- **Créer une commande**  
  `POST /commandes`
- **Lister les commandes**  
  `GET /commandes`
- **Consulter une commande**  
  `GET /commandes/:id`
- **Rechercher une commande**  
  `GET /commandes/recherche?client=1&date=2024-01-01&statut=En%20cours&produit=5`

### ✅ Notifications de stock faible

- **Lister les produits en stock faible**  
  `GET /produits/stock-faible?seuil=10`
  ```json
  [
    {
      "id_produit": 3,
      "nom_produit": "Clavier mécanique",
      "quantite_stock": 5
    }
  ]
  ```

### ✅ Gestion fine du stock

- **Créer une commande avec gestion du stock**  
  `POST /commandes`
  ```json
  {
    "id_client": 1,
    "produits": [
      { "id_produit": 3, "quantite": 2 },
      { "id_produit": 5, "quantite": 1 }
    ]
  }
  ```
  - Vérification automatique du stock
  - Décrémentation des quantités si commande acceptée
  - Blocage si stock insuffisant

### ✅ Recherche multi-critères

- **Filtrer les commandes par client, date, statut, produit**  
  `GET /commandes/recherche?client=1&start_date=2024-01-01&end_date=2024-12-31&statut=En%20cours&produit=3`
  ```json
  [
    {
      "id_commande": 12,
      "date_commande": "2024-02-15",
      "id_client": 1,
      "statut": "En cours"
    }
  ]
  ```

### ✅ Statistiques

- **Produits les plus vendus**  
  `GET /statistiques/produits-plus-vendus`

  ```json
  [
    { "nom_produit": "Souris gaming", "total_vendu": 150 },
    { "nom_produit": "Clavier mécanique", "total_vendu": 120 }
  ]
  ```

- **Total des ventes sur une période**  
  `GET /statistiques/ventes?start_date=2024-01-01&end_date=2024-12-31`
  ```json
  {
    "total_ventes": 15320.5
  }
  ```

---

## 🚨 Audit V1 : Problèmes Identifiés

1. **Sécurité** :

   - Requêtes SQL vulnérables aux injections (ex. `SELECT * FROM produits WHERE nom = '"+ req.body.nom + "'`)
   - Aucune validation des entrées utilisateurs

2. **Logique métier** :

   - Commandes possibles avec des stocks insuffisants
   - Aucune gestion du stock après une commande

3. **Manque de fonctionnalités** :
   - Pas de recherche avancée sur les commandes
   - Pas de notifications en cas de stock faible

---

## 🔥 Améliorations en V2

### ✅ Sécurité renforcée

- **Requêtes paramétrées** pour éviter les injections SQL
- **Validation des entrées** avec `Joi` pour éviter les données incorrectes

### ✅ Meilleure gestion métier

- **Vérification du stock** avant validation d’une commande
- **Décrémentation automatique** du stock après achat
- **Blocage des commandes** si stock insuffisant

### ✅ Nouvelles fonctionnalités

- **Recherche multi-critères** pour filtrer les commandes
- **Statistiques** sur les ventes et produits les plus populaires
- **Notifications de stock faible**

---

✨ **Cette V2 est plus robuste, sécurisée et complète !** 🚀
