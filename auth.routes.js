const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = 'demo_node+mongo_token';


// POST /auth/register  toujours passer les inputs user au sanitize()
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom d'utilisateur (3 à 30 caractères)
 *                 example: harrypotter
 *               password:
 *                 type: string
 *                 description: Mot de passe (au moins 6 caractères)
 *                 example: azkaban123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur créé
 *       400:
 *         description: Données invalides ou incomplètes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Le nom d’utilisateur est requis.
 *                       param:
 *                         type: string
 *                         example: name
 *                       location:
 *                         type: string
 *                         example: body
 *       500:
 *         description: Erreur système ou utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur système
 */
router.post('/register', [
  body('name')
    .notEmpty().withMessage('Le nom d’utilisateur est requis.')
    .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
  body('password').trim().escape()
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
], async (req, res) => {

  const errors = validationResult(req);
  console.log(errors)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, password } = req.body;
  console.log( name, password)
  try {
    const user = new User({ name, password });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (err) {
    if (err.code === 11000) return res.status(500).json({ error: 'Erreur système' });
    res.status(400).json({ error: err.message });
  }
});

 // POST /auth/login  toujours passer les inputs user au sanitize()
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom d'utilisateur (3 à 30 caractères)
 *                 example: harrypotter
 *               password:
 *                 type: string
 *                 description: Mot de passe (au moins 6 caractères)
 *                 example: azkaban123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connecté avec succès
 *       400:
 *         description: Données invalides ou incomplètes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Le nom d’utilisateur est requis.
 *                       param:
 *                         type: string
 *                         example: username
 *                       location:
 *                         type: string
 *                         example: body
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Identifiants invalides
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur interne du serveur
 */
router.post('/login', [
    body('name').trim().escape()
      .notEmpty().withMessage('Le nom d’utilisateur est requis.')
      .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
      .notEmpty().withMessage('Le mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, password } = req.body;
  
    const user = await User.findOne({ name });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
  
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // à mettre sur true en prod (https)
      maxAge: 24 * 60 * 60 * 1000 // durée de vie 24h
    });
  
    res.json({ message: 'Connecté avec succès' });
  });
  ;
  
  // GET /auth/logout
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Déconnecter un utilisateur
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnecté
 */
  router.get('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Déconnecté' });
  });
  
  module.exports = router;
