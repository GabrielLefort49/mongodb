const mongoose = require('mongoose');

const marchandSchema = new mongoose.Schema({
  nom: String,
});

module.exports = mongoose.model('marchand', marchandSchema);