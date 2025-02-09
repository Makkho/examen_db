# Audit V1

## 1. Failles de Sécurité

### a) Injection SQL

Actuellement, le code utilise des **requêtes paramétrées**, ce qui réduit considérablement les risques d'injection SQL. Cependant, une **revue complète** de toutes les requêtes est nécessaire pour s'assurer qu'aucune **concaténation de chaînes** n'est utilisée accidentellement.

#### 🔥 Exemple de faille :

Si une requête est construite en concaténant des valeurs utilisateur, comme ceci :

```js
const sql = "SELECT * FROM produits WHERE nom_produit = '" + req.body.nom + "'";
connection.query(sql);
```

Un attaquant pourrait injecter du SQL malveillant :

```sql
nom_produit = 'Test' OR '1'='1';
```

Cela retournerait **tous les produits de la base de données**, une faille critique !

**✅ Solution :** Toujours utiliser des requêtes préparées :

```js
const sql = "SELECT * FROM produits WHERE nom_produit = ?";
connection.query(sql, [req.body.nom]);
```

### b) Manque de validation des entrées

Le code ne valide pas les entrées utilisateur avant de les insérer en base de données. Cela pourrait entraîner :

- Des **quantités négatives** ou incohérentes.
- Des **champs vides ou trop longs**.
- Des **formats invalides** pour les e-mails et numéros de téléphone.

#### 🔥 Exemple de faille :

Un utilisateur peut soumettre une **quantité négative** :

```json
{
  "id_produit": 1,
  "quantite": -10
}
```

Cela peut **corrompre les données de stock**.

**✅ Solution :** Ajouter une validation côté serveur :

```js
if (req.body.quantite <= 0) {
  return res.status(400).json({ message: "Quantité invalide" });
}
```

### c) Manque d’authentification et de contrôle d’accès

- Actuellement, **aucune authentification** n'est requise pour manipuler la base de données.
- Toute personne connaissant l'URL peut **modifier ou supprimer des données sensibles**.

**✅ Solution :** Mettre en place un **middleware d’authentification** avec JWT ou session.

## 2. Améliorations Possibles

### a) Utilisation de procédures stockées

Au lieu d'envoyer des requêtes SQL depuis l'application, utiliser **des procédures stockées dans MySQL** pour :

- **Centraliser la logique métier**.
- **Réduire les risques d’injection SQL**.
- **Optimiser les performances**.

### b) Vérifications métier

- **Empêcher de commander un produit hors stock**.
- **Limiter les commandes à des quantités raisonnables**.
- **S’assurer que le prix unitaire est toujours positif**.

#### ✅ Amélioration pour la gestion des stocks :

```sql
CREATE TRIGGER before_insert_lignes_commande
BEFORE INSERT ON Lignes_Commande
FOR EACH ROW
BEGIN
  IF NEW.quantite > (SELECT quantite_stock FROM Produits WHERE id_produit = NEW.id_produit) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Stock insuffisant';
  END IF;
END;
```

### c) Ajout de logs et monitoring

- Ajouter **un middleware de logs** pour enregistrer les accès et modifications de la base.
- Surveiller les requêtes suspectes et implémenter un **système de détection d’anomalies**.

### d) Mise en place d'un ORM

Utiliser **Sequelize** ou **TypeORM** permettrait :

- D’améliorer la lisibilité du code.
- De **réduire les erreurs SQL**.
- De **faciliter les migrations de bases de données**.

---

### 🚀 **Conclusion**

En intégrant ces améliorations, on pourrait obtenir une **V2 beaucoup plus sécurisée et performante**. Cela justifie pleinement une reconnaissance financière pour la montée en compétences et la qualité apportée !
