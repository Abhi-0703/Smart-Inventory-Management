const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new product or update existing
router.post('/', async (req, res) => {
  const { name, quantity, location } = req.body;

  try {
    let existingProduct = await Product.findOne({ name, location });

    if (existingProduct) {
      existingProduct.quantity += quantity;
      await existingProduct.save();
      res.status(200).json(existingProduct);
    } else {
      const newProduct = new Product({ name, quantity, location });
      await newProduct.save();
      res.status(201).json(newProduct);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: update quantity (simulate stock transfer)
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
