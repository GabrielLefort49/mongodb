require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const routes = require('./router');
const authRoutes = require('./auth.routes'); // Importation des routes d'authentification


const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors())

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.use('/potions', routes);
app.use('/auth', authRoutes); // Utilisation des routes d'authentification
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

const swaggerOptions = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Potions Magiques',
            version: '1.0.0',
            description: 'Documentation de l\'API de potions magiques'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ],
        components: {
            schemas: {
                Potion: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Identifiant unique de la potion'
                        },
                        nom: {
                            type: 'string',
                            description: 'Nom de la potion'
                        },
                        ingredients: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Liste des ingrédients de la potion'
                        },
                        effets: {
                            type: 'object',
                            properties: {
                                strength: { type: 'number', description: 'Puissance de l\'effet' },
                                flavor: { type: 'number', description: 'Saveur de la potion' }
                            },
                            description: 'Effets de la potion'
                        },
                        categories: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Catégories de la potion'
                        },
                        prix: {
                            type: 'number',
                            description: 'Prix de la potion'
                        },
                        score: {
                            type: 'number',
                            description: 'Score de la potion'
                        },
                        marchand_id: {
                            type: 'string',
                            description: 'Identifiant du marchand associé'
                        }
                    }
                },
                Auth: { // Correction de la définition Auth
                    type: 'object',
                    properties: {
                        username: {
                            type: 'string',
                            description: 'Nom d\'utilisateur',
                            example: 'utilisateur123'
                        },
                        password: {
                            type: 'string',
                            description: 'Mot de passe',
                            example: 'motdepasse123'
                        }
                    },
                    required: ['username', 'password'] // Champs obligatoires
                }
            }
        }
    },
    apis: ['./router.js', './auth.routes.js'] // Inclure les fichiers contenant les routes
});

const swaggerDocument = swaggerOptions; // Utilisez swaggerOptions directement
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));