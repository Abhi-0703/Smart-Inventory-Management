const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  location: String
});

module.exports = mongoose.model('Product', ProductSchema);
