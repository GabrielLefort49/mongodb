const mongoose = require('mongoose');

const potionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  ingredients: [mongoose.Schema.Types.Mixed],
  effets: { 
    strength: { type: Number, required: true },
    flavor: { type: Number, required: true }
  },
  categories: [String],
  prix: { type: Number, required: true },
  score: { type: Number, default: 0 },
  marchand_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'marchand', // Référence au modèle marchand
    required: true 
  }
});

module.exports = mongoose.model('Potion', potionSchema);