-- Insertion des catégories
INSERT INTO Categories (nom_categorie) VALUES
    ('Avions Civils'),
    ('Avions Militaires'),
    ('Avions Vintage'),
    ('Jets Privés'),
    ('Planeurs');

-- Insertion des fournisseurs
INSERT INTO Fournisseurs (nom, adresse, telephone, email) VALUES
    ('PaperCraft Pro', '123 rue des Artisans, Paris', '0123456789', 'contact@papercraft.fr'),
    ('AirModel', '45 avenue de l''Aviation, Lyon', '0234567890', 'info@airmodel.fr'),
    ('ModelSupply', '78 rue du Commerce, Bordeaux', '0345678901', 'ventes@modelsupply.fr'),
    ('CraftMaster', '15 rue de la Creation, Nantes', '0456789012', 'service@craftmaster.fr');

-- Insertion des produits
INSERT INTO Produits (reference, nom_produit, description, prix_unitaire, quantite_stock, id_categorie) VALUES
    ('AV001', 'Airbus A320', 'Maquette d''Airbus A320 échelle 1:50', 24.99, 50, 1),
    ('AV002', 'Boeing 747', 'Maquette de Boeing 747 échelle 1:50', 29.99, 40, 1),
    ('AV003', 'Spitfire', 'Maquette de Spitfire WWII', 19.99, 30, 2),
    ('AV004', 'F-16', 'Maquette de F-16 Fighting Falcon', 22.99, 25, 2),
    ('AV005', 'DC-3 Vintage', 'Maquette classique DC-3', 27.99, 20, 3),
    ('AV006', 'Gulfstream G650', 'Maquette de jet privé de luxe', 34.99, 15, 4),
    ('AV007', 'Planeur Alpha', 'Planeur simple et élégant', 14.99, 60, 5),
    ('AV008', 'Concorde', 'Maquette du légendaire Concorde', 39.99, 10, 3);

-- Liaison produits-fournisseurs
INSERT INTO Produits_Fournisseurs (id_produit, id_fournisseur) VALUES
    (1, 1), (1, 2),  -- Airbus A320 disponible chez PaperCraft et AirModel
    (2, 1), (2, 3),  -- Boeing 747 disponible chez PaperCraft et ModelSupply
    (3, 2), (3, 4),  -- Spitfire disponible chez AirModel et CraftMaster
    (4, 2),          -- F-16 disponible uniquement chez AirModel
    (5, 1), (5, 4),  -- DC-3 disponible chez PaperCraft et CraftMaster
    (6, 3),          -- Gulfstream disponible uniquement chez ModelSupply
    (7, 1), (7, 2), (7, 3),  -- Planeur disponible chez trois fournisseurs
    (8, 4);          -- Concorde disponible uniquement chez CraftMaster

-- Insertion des clients
INSERT INTO Clients (nom, adresse, telephone, email) VALUES
    ('Marie Dupont', '12 rue des Fleurs, Paris', '0611223344', 'marie.d@email.fr'),
    ('Jean Martin', '34 avenue Victor Hugo, Lyon', '0622334455', 'jean.m@email.fr'),
    ('Sophie Bernard', '56 boulevard des Arts, Marseille', '0633445566', 'sophie.b@email.fr'),
    ('Lucas Petit', '78 rue de la Paix, Lille', '0644556677', 'lucas.p@email.fr');

-- Insertion des commandes
INSERT INTO Commandes (id_client, date_commande, statut) VALUES
    (1, '2024-01-15 10:30:00', 'Livré'),
    (2, '2024-01-20 14:45:00', 'En cours'),
    (3, '2024-01-25 16:20:00', 'En préparation'),
    (1, '2024-01-28 09:15:00', 'En cours');

-- Insertion des lignes de commande
INSERT INTO Lignes_Commande (id_commande, id_produit, quantite, prix_unitaire) VALUES
    (1, 1, 2, 24.99),  -- Marie commande 2 Airbus A320
    (1, 7, 1, 14.99),  -- et 1 Planeur
    (2, 3, 1, 19.99),  -- Jean commande 1 Spitfire
    (2, 4, 1, 22.99),  -- et 1 F-16
    (3, 8, 1, 39.99),  -- Sophie commande 1 Concorde
    (4, 6, 2, 34.99),  -- Marie commande 2 Gulfstream
    (4, 5, 1, 27.99);  -- et 1 DC-3