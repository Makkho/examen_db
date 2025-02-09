DROP DATABASE IF EXISTS boutique;
CREATE DATABASE IF NOT EXISTS boutique;
USE boutique;

CREATE TABLE Categories (
    id_categorie INT PRIMARY KEY AUTO_INCREMENT,
    nom_categorie VARCHAR(50) NOT NULL
);

CREATE TABLE Fournisseurs (
    id_fournisseur INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE Produits (
    id_produit INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) NOT NULL,
    nom_produit VARCHAR(100) NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    quantite_stock INT NOT NULL,
    id_categorie INT,
    FOREIGN KEY (id_categorie) REFERENCES Categories(id_categorie)
);

CREATE TABLE Produits_Fournisseurs (
    id_produit INT,
    id_fournisseur INT,
    PRIMARY KEY (id_produit, id_fournisseur),
    FOREIGN KEY (id_produit) REFERENCES Produits(id_produit),
    FOREIGN KEY (id_fournisseur) REFERENCES Fournisseurs(id_fournisseur)
);

CREATE TABLE Clients (
    id_client INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE Commandes (
    id_commande INT PRIMARY KEY AUTO_INCREMENT,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_client INT,
    statut VARCHAR(20) DEFAULT 'En cours',
    FOREIGN KEY (id_client) REFERENCES Clients(id_client)
);

CREATE TABLE Lignes_Commande (
    id_ligne INT PRIMARY KEY AUTO_INCREMENT,
    id_commande INT,
    id_produit INT,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_commande) REFERENCES Commandes(id_commande),
    FOREIGN KEY (id_produit) REFERENCES Produits(id_produit)
);