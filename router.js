const express = require('express');
const router = express.Router();
const Potion = require('./potion.model');
require('./auth.routes');


/**
 * @swagger
 * /potions/names:
 *   get:
 *     summary: Récupérer uniquement les noms de toutes les potions
 *     tags: [Potions]
 *     description: Récupérer uniquement les noms de toutes les potions disponibles dans la base de données
 *     responses:
 *       200:
 *         description: Liste des noms des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/names', async (req, res) => {
    try {
        const names = await Potion.find({}, 'nom');
        res.json(names.map(p => p.nom));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/vendor/{vendorId}:
 *   get:
 *     summary: Récupérer toutes les potions d’un vendeur
 *     tags: [Potions]
 *     description: Récupérer toutes les potions d’un vendeur spécifique
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du vendeur
 *     responses:
 *       200:
 *         description: Liste des potions du vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const marchand_potions = await Potion.find({ marchand_id: req.params.vendorId });
        res.json(marchand_potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupérer toutes les potions
 *     tags: [Potions]
 *     description: Récupérer toutes les potions disponibles dans la base de données
 *     responses:
 *       200:
 *         description: Liste de toutes les potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */
router.get('/', async (req, res) => {
    try {
        const potions = await Potion.find(); // Récupère toutes les potions
        res.json(potions); // Retourne les potions sous forme de JSON
    } catch (err) {
        res.status(500).json({ error: err.message }); // Gestion des erreurs
    }
});

/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Créer une nouvelle potion
 *     tags: [Potions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - ingredients
 *               - effets
 *               - categories
 *               - prix
 *               - marchand_id
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la potion
 *                 example: "Potion de soin"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des ingrédients de la potion
 *                 example: ["Herbe magique", "Eau pure"]
 *               effets:
 *                 type: object
 *                 properties:
 *                   strength:
 *                     type: number
 *                     description: Puissance de l'effet
 *                     example: 10
 *                   flavor:
 *                     type: number
 *                     description: Saveur de la potion
 *                     example: 5
 *                 description: Effets de la potion
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Catégories de la potion
 *                 example: ["Soin", "Magie"]
 *               prix:
 *                 type: number
 *                 description: Prix de la potion
 *                 example: 50
 *               score:
 *                 type: number
 *                 description: Score de la potion
 *                 example: 4.5
 *               marchand_id:
 *                 type: string
 *                 description: Identifiant du marchand associé
 *                 example: "642c1f1e1c4a4b001c8e4d1b"
 *     responses:
 *       201:
 *         description: Potion créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Potion créée avec succès"
 *                 potion:
 *                   $ref: '#/components/schemas/Potion'
 *       400:
 *         description: Erreur de validation ou données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur de validation des données"
 */
router.post('/', async (req, res) => {
    try {
        const { nom, ingredients, effets, categories, prix, score, marchand_id } = req.body;
        const newPotion = new Potion({ nom, ingredients, effets, categories, prix, score, marchand_id });
        await newPotion.save();
        res.status(201).json({ message: 'Potion créée avec succès', potion: newPotion });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/{id}:
 *   put:
 *     summary: Mettre à jour une potion existante
 *     tags: [Potions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la potion à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la potion
 *                 example: "Potion de mana"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des ingrédients de la potion
 *                 example: ["Cristal bleu", "Eau pure"]
 *               effets:
 *                 type: object
 *                 properties:
 *                   strength:
 *                     type: number
 *                     description: Puissance de l'effet
 *                     example: 15
 *                   flavor:
 *                     type: number
 *                     description: Saveur de la potion
 *                     example: 7
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Catégories de la potion
 *                 example: ["Magie", "Mana"]
 *               prix:
 *                 type: number
 *                 description: Prix de la potion
 *                 example: 100
 *               score:
 *                 type: number
 *                 description: Score de la potion
 *                 example: 4.8
 *     responses:
 *       200:
 *         description: Potion mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Potion mise à jour avec succès"
 *                 potion:
 *                   $ref: '#/components/schemas/Potion'
 *       404:
 *         description: Potion non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Potion non trouvée"
 */
router.put('/:id', async (req, res) => {
    try {
        const updatedPotion = await Potion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedPotion) {
            return res.status(404).json({ error: 'Potion non trouvée' });
        }
        res.json({ message: 'Potion mise à jour avec succès', potion: updatedPotion });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     summary: Supprimer une potion
 *     tags: [Potions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la potion à supprimer
 *     responses:
 *       200:
 *         description: Potion supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Potion supprimée avec succès"
 *       404:
 *         description: Potion non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Potion non trouvée"
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedPotion = await Potion.findByIdAndDelete(req.params.id);
        if (!deletedPotion) {
            return res.status(404).json({ error: 'Potion non trouvée' });
        }
        res.json({ message: 'Potion supprimée avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




/**
 * @swagger
 * /potions/analytics/average-score:
 *   get:
 *     summary: Récupérer le score moyen de toutes les potions
 *     tags: [Analytics]
 *     description: Récupérer le score moyen de toutes les potions
 *     responses:
 *       200:
 *         description: Score moyen des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 */
router.get('/analytics/average-score', async (req, res) => {
    try {
        const averageScore = await Potion.aggregate([
            { $group: { _id: null, averageScore: { $avg: "$score" } } }
        ]);
        res.json(averageScore[0].averageScore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/analytics/total-price:
 *   get:
 *     summary: Récupérer le prix total de toutes les potions
 *     tags: [Analytics]
 *     description: Récupérer le prix total de toutes les potions
 *     responses:
 *       200:
 *         description: Prix total des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 */
router.get('/analytics/total-price', async (req, res) => {
    try {
        const totalPrice = await Potion.aggregate([
            { $group: { _id: null, totalPrice: { $sum: "$prix" } } }
        ]);
        res.json(totalPrice[0].totalPrice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/analytics/total-potions:
 *   get:
 *     summary: Récupérer le nombre total de potions
 *     tags: [Analytics]
 *     description: Récupérer le nombre total de potions dans la base de données
 *     responses:
 *       200:
 *         description: Nombre total de potions
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 */
router.get('/analytics/total-potions', async (req, res) => {
    try {
        const totalPotions = await Potion.countDocuments();
        res.json(totalPotions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * @swagger
 * /potions/analytics/distinct-categories:
 *   get:
 *     summary: Récupérer le nombre total de catégories différentes
 *     tags: [Analytics]
 *     description: Récupérer le nombre total de catégories différentes dans les potions
 *     responses:
 *       200:
 *         description: Liste des catégories distinctes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/analytics/distinct-categories', async (req, res) => {
    try {
        const categories = await Potion.distinct('categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/analytics/average-score-by-vendor:
 *   get:
 *     summary: Récupérer le score moyen par vendeur
 *     tags: [Analytics]
 *     description: Récupérer le score moyen par vendeur pour toutes les potions
 *     responses:
 *       200:
 *         description: Score moyen par vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   averageScore:
 *                     type: number
 */
router.get('/analytics/average-score-by-vendor', async (req, res) => {
    try {
        const scores = await Potion.aggregate([
            { $group: { _id: "$marchand_id", averageScore: { $avg: "$score" } } }
        ]);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
