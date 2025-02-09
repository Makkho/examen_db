const express = require("express");
const mysql = require("mysql2/promise");
const fs = require("fs");
const Joi = require("joi");
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
  // Schémas Joi
  const fournisseurSchema = Joi.object({
    nom: Joi.string().max(100).required(),
    adresse: Joi.string().optional(),
    telephone: Joi.string()
      .pattern(/^\d{10}$/)
      .optional(),
    email: Joi.string().email().optional(),
  });

  const produitSchema = Joi.object({
    reference: Joi.string().max(50).required(),
    nom_produit: Joi.string().max(100).required(),
    description: Joi.string().optional(),
    prix_unitaire: Joi.number().positive().required(),
    quantite_stock: Joi.number().integer().min(0).required(),
    id_categorie: Joi.number().integer().optional(),
  });

  const clientSchema = Joi.object({
    nom: Joi.string().max(100).required(),
    adresse: Joi.string().optional(),
    telephone: Joi.string()
      .pattern(/^\d{10}$/)
      .optional(),
    email: Joi.string().email().optional(),
  });

  const commandeSchema = Joi.object({
    id_client: Joi.number().integer().required(),
    statut: Joi.string()
      .valid("En cours", "Livrée", "Annulée")
      .default("En cours"),
  });

  // CRUD Produits
  app.post("/produits", async (req, res) => {
    const { error, value } = produitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await connection.query("INSERT INTO produits SET ?", value);
    res.status(201).json({ message: "Produit ajouté avec succès" });
  });

  app.get("/produits", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM produits");
    res.json(result);
  });

  app.get("/produits/:id", async (req, res) => {
    const [result] = await connection.query(
      "SELECT * FROM produits WHERE id = ?",
      [req.params.id]
    );
    if (result.length === 0)
      return res.status(404).json({ error: "Produit non trouvé" });
    res.json(result[0]);
  });

  app.put("/produits/:id", async (req, res) => {
    const { error, value } = produitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await connection.query("UPDATE produits SET ? WHERE id = ?", [
      value,
      req.params.id,
    ]);
    res.json({ message: "Produit mis à jour avec succès" });
  });

  app.delete("/produits/:id", async (req, res) => {
    await connection.query("DELETE FROM produits WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ message: "Produit supprimé avec succès" });
  });

  // CRUD Fournisseurs
  app.post("/fournisseurs", async (req, res) => {
    const { error, value } = fournisseurSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await connection.query("INSERT INTO fournisseurs SET ?", value);
    res.status(201).json({ message: "Fournisseur ajouté avec succès" });
  });

  app.get("/fournisseurs", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM fournisseurs");
    res.json(result);
  });

  // CRUD Clients
  app.post("/clients", async (req, res) => {
    const { error, value } = clientSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await connection.query("INSERT INTO clients SET ?", value);
    res.status(201).json({ message: "Client ajouté avec succès" });
  });

  app.get("/clients", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM clients");
    res.json(result);
  });

  // CRUD Commandes
  app.post("/commandes", async (req, res) => {
    const { error, value } = commandeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await connection.query("INSERT INTO commandes SET ?", value);
    res.status(201).json({ message: "Commande ajoutée avec succès" });
  });

  app.get("/commandes", async (_req, res) => {
    const [result] = await connection.query("SELECT * FROM commandes");
    res.json(result);
  });

  app.get("/commandes", async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Les paramètres start et end sont requis" });
    }
    try {
      const [result] = await connection.query(
        "SELECT * FROM commandes WHERE date_commande BETWEEN ? AND ?",
        [start, end]
      );
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des commandes" });
    }
  });

  app.get("/clients/:id/commandes", async (req, res) => {
    try {
      const [result] = await connection.query(
        "SELECT * FROM commandes WHERE id_client = ?",
        [req.params.id]
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Erreur lors de la récupération des commandes du client",
      });
    }
  });

  // Lister les commandes contenant un produit spécifique
  app.get("/produits/:id/commandes", async (req, res) => {
    try {
      const [result] = await connection.query(
        "SELECT c.* FROM commandes c JOIN details_commandes dc ON c.id = dc.id_commande WHERE dc.id_produit = ?",
        [req.params.id]
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Erreur lors de la récupération des commandes du produit",
      });
    }
  });

  // Recherche multi-critères
  app.get("/commandes/recherche", async (req, res) => {
    try {
      let query =
        "SELECT DISTINCT c.* FROM commandes c LEFT JOIN details_commandes dc ON c.id = dc.id_commande WHERE 1=1";
      const params = [];

      if (req.query.id_client) {
        query += " AND c.id_client = ?";
        params.push(req.query.id_client);
      }
      if (req.query.start_date && req.query.end_date) {
        query += " AND c.date_commande BETWEEN ? AND ?";
        params.push(req.query.start_date, req.query.end_date);
      }
      if (req.query.statut) {
        query += " AND c.statut = ?";
        params.push(req.query.statut);
      }
      if (req.query.id_produit) {
        query += " AND dc.id_produit = ?";
        params.push(req.query.id_produit);
      }

      const [result] = await connection.query(query, params);
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche des commandes" });
    }
  });

  // Statistiques simples
  app.get("/statistiques/produits-plus-vendus", async (_req, res) => {
    try {
      const query = `
        SELECT p.nom_produit, SUM(dc.quantite) AS total_vendu
        FROM details_commandes dc
        JOIN produits p ON dc.id_produit = p.id
        GROUP BY dc.id_produit
        ORDER BY total_vendu DESC
        LIMIT 10;
      `;
      const [result] = await connection.query(query);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Erreur lors de la récupération des produits les plus vendus",
      });
    }
  });

  app.get("/statistiques/ventes", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      if (!start_date || !end_date) {
        return res
          .status(400)
          .json({ error: "Les dates de début et de fin sont requises" });
      }
      const query = `
        SELECT SUM(dc.quantite * p.prix_unitaire) AS total_ventes
        FROM details_commandes dc
        JOIN produits p ON dc.id_produit = p.id
        JOIN commandes c ON dc.id_commande = c.id
        WHERE c.date_commande BETWEEN ? AND ?;
      `;
      const [result] = await connection.query(query, [start_date, end_date]);
      res.json(result[0]);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération du total des ventes" });
    }
  });

  // Gestion fine du stock
  app.post("/commandes", async (req, res) => {
    try {
      const { id_client, produits } = req.body;

      // Vérification de la disponibilité des produits
      for (const produit of produits) {
        const [stock] = await connection.query(
          "SELECT quantite_stock FROM produits WHERE id = ?",
          [produit.id_produit]
        );
        if (!stock.length || stock[0].quantite_stock < produit.quantite) {
          return res.status(400).json({
            error: `Stock insuffisant pour le produit ${produit.id_produit}`,
          });
        }
      }

      // Création de la commande
      const [result] = await connection.query(
        "INSERT INTO commandes (id_client, statut) VALUES (?, 'En cours')",
        [id_client]
      );
      const id_commande = result.insertId;

      // Décrémentation du stock et ajout des détails de commande
      for (const produit of produits) {
        await connection.query(
          "INSERT INTO details_commandes (id_commande, id_produit, quantite) VALUES (?, ?, ?)",
          [id_commande, produit.id_produit, produit.quantite]
        );
        await connection.query(
          "UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ?",
          [produit.quantite, produit.id_produit]
        );
      }

      res
        .status(201)
        .json({ message: "Commande créée avec succès", id_commande });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la création de la commande" });
    }
  });

  // Notification de stock faible
  app.get("/produits/stock-faible", async (req, res) => {
    try {
      const seuil = parseInt(req.query.seuil) || 10;
      const [produits] = await connection.query(
        "SELECT * FROM produits WHERE quantite_stock <= ?",
        [seuil]
      );
      res.json(produits);
    } catch (error) {
      res.status(500).json({
        error: "Erreur lors de la récupération des produits en stock faible",
      });
    }
  });

  app.listen(3000, () => {
    console.log("Serveur démarré sur le port 3000");
  });
});
