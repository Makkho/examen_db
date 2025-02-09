const express = require("express");
const mysql = require("mysql2/promise");
const fs = require("fs");

const app = express();
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true,
};

const executeSQLFile = async (connection, filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");
  await connection.query(sql);
  console.log(`${filePath} exécuté avec succès`);
};

const initDB = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connexion à MySQL réussie");

    await executeSQLFile(connection, "db.sql");
    await executeSQLFile(connection, "data.sql");

    console.log("Base de données initialisée avec succès");
    return connection;
  } catch (err) {
    console.error(
      "Erreur lors de l'initialisation de la base de données :",
      err
    );
    process.exit(1);
  }
};

initDB().then((connection) => {
  // Fournisseurs CRUD
  app.post("/fournisseurs", async (req, res) => {
    const { nom, adresse, telephone, email } = req.body;
    const sql =
      "INSERT INTO fournisseurs (nom, adresse, telephone, email) VALUES (?, ?, ?, ?)";
    await connection.query(sql, [nom, adresse, telephone, email]);
    res.status(201).json({ message: "Fournisseur ajouté avec succès" });
  });

  app.get("/fournisseurs", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM fournisseurs");
    res.json(result);
  });

  app.put("/fournisseurs/:id", async (req, res) => {
    const { nom, adresse, telephone, email } = req.body;
    const sql =
      "UPDATE fournisseurs SET nom = ?, adresse = ?, telephone = ?, email = ? WHERE id_fournisseur = ?";
    await connection.query(sql, [
      nom,
      adresse,
      telephone,
      email,
      req.params.id,
    ]);
    res.json({ message: "Fournisseur mis à jour" });
  });

  app.delete("/fournisseurs/:id", async (req, res) => {
    await connection.query(
      "DELETE FROM fournisseurs WHERE id_fournisseur = ?",
      [req.params.id]
    );
    res.json({ message: "Fournisseur supprimé" });
  });

  // Catégories CRUD
  app.post("/categories", async (req, res) => {
    const { nom_categorie } = req.body;
    const sql = "INSERT INTO categories (nom_categorie) VALUES (?)";
    await connection.query(sql, [nom_categorie]);
    res.status(201).json({ message: "Catégorie ajoutée avec succès" });
  });

  app.get("/categories", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM categories");
    res.json(result);
  });

  app.put("/categories/:id", async (req, res) => {
    const { nom_categorie } = req.body;
    const sql =
      "UPDATE categories SET nom_categorie = ? WHERE id_categorie = ?";
    await connection.query(sql, [nom_categorie, req.params.id]);
    res.json({ message: "Catégorie mise à jour" });
  });

  app.delete("/categories/:id", async (req, res) => {
    await connection.query("DELETE FROM categories WHERE id_categorie = ?", [
      req.params.id,
    ]);
    res.json({ message: "Catégorie supprimée" });
  });

  // Commandes CRUD
  app.post("/commandes", async (req, res) => {
    const { id_client, statut } = req.body;
    const sql = "INSERT INTO commandes (id_client, statut) VALUES (?, ?)";
    await connection.query(sql, [id_client, statut]);
    res.status(201).json({ message: "Commande ajoutée avec succès" });
  });

  app.get("/commandes", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM commandes");
    res.json(result);
  });

  app.put("/commandes/:id", async (req, res) => {
    const { statut } = req.body;
    const sql = "UPDATE commandes SET statut = ? WHERE id_commande = ?";
    await connection.query(sql, [statut, req.params.id]);
    res.json({ message: "Commande mise à jour" });
  });

  app.delete("/commandes/:id", async (req, res) => {
    await connection.query("DELETE FROM commandes WHERE id_commande = ?", [
      req.params.id,
    ]);
    res.json({ message: "Commande supprimée" });
  });

  // Lignes de commande CRUD
  app.post("/lignes_commande", async (req, res) => {
    const { id_commande, id_produit, quantite, prix_unitaire } = req.body;
    const sql =
      "INSERT INTO lignes_commande (id_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)";
    await connection.query(sql, [
      id_commande,
      id_produit,
      quantite,
      prix_unitaire,
    ]);
    res.status(201).json({ message: "Ligne de commande ajoutée avec succès" });
  });

  app.get("/lignes_commande", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM lignes_commande");
    res.json(result);
  });

  app.put("/lignes_commande/:id", async (req, res) => {
    const { id_commande, id_produit, quantite, prix_unitaire } = req.body;
    const sql =
      "UPDATE lignes_commande SET id_commande = ?, id_produit = ?, quantite = ?, prix_unitaire = ? WHERE id_ligne = ?";
    await connection.query(sql, [
      id_commande,
      id_produit,
      quantite,
      prix_unitaire,
      req.params.id,
    ]);
    res.json({ message: "Ligne de commande mise à jour" });
  });

  app.delete("/lignes_commande/:id", async (req, res) => {
    await connection.query("DELETE FROM lignes_commande WHERE id_ligne = ?", [
      req.params.id,
    ]);
    res.json({ message: "Ligne de commande supprimée" });
  });

  // CRUD Produits
  app.post("/produits", async (req, res) => {
    const { error, value } = produitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const sql = "INSERT INTO produits SET ?";
    await connection.query(sql, value);
    res.status(201).json({ message: "Produit ajouté avec succès" });
  });

  app.get("/produits", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM produits");
    res.json(result);
  });

  app.delete("/produits/:id", async (req, res) => {
    await connection.query("DELETE FROM produits WHERE id_ligne = ?", [
      req.params.id,
    ]);
    res.json({ message: "Produits supprimée" });
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
});
