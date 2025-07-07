const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  store: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('Demand', demandSchema);