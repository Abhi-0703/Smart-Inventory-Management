const express = require('express');
const router = express.Router();
const Demand = require('../Models/Demand');

// GET all demand entries
router.get('/', async (req, res) => {
  try {
    const demands = await Demand.find().populate('product');
    const formatted = demands.map((d) => ({
      _id: d._id,
      productId: d.product._id,
      productName: d.product.name, // assumes 'name' field exists in Product
      store: d.store,
      level: d.level
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST or UPDATE demand level
router.post('/', async (req, res) => {
  const { productId, store, level } = req.body;

  try {
    const existing = await Demand.findOne({ product: productId, store });

    if (existing) {
      existing.level = level;
      await existing.save();
      res.json(existing);
    } else {
      const newDemand = new Demand({ product: productId, store, level });
      await newDemand.save();
      res.status(201).json(newDemand);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT to update demand level
router.put('/:id', async (req, res) => {
  try {
    const { level } = req.body;
    const updated = await Demand.findByIdAndUpdate(
      req.params.id,
      { level },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
