const express = require('express');
const router = express.Router();
const TransferRequest = require('../Models/TransferRequest');
const Product = require('../Models/Product');

// GET all transfer requests
router.get('/', async (req, res) => {
  try {
    const requests = await TransferRequest.find().populate('productId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new transfer request
router.post('/', async (req, res) => {
  const { productId, from, to, quantity } = req.body;
  try {
    const request = new TransferRequest({ productId, from, to, quantity });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Approve or reject a transfer
router.put('/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const request = await TransferRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = status;
    await request.save();

    if (status === 'approved') {
      // Subtract from source
      const fromProduct = await Product.findById(request.productId);
      if (!fromProduct) return res.status(404).json({ error: 'Source product not found' });

      fromProduct.quantity -= request.quantity;
      await fromProduct.save();

      // Add to destination
      let toProduct = await Product.findOne({
        name: fromProduct.name,
        location: request.to,
      });

      if (toProduct) {
        toProduct.quantity += request.quantity;
        await toProduct.save();
      } else {
        const newProduct = new Product({
          name: fromProduct.name,
          quantity: request.quantity,
          location: request.to,
        });
        await newProduct.save();
      }
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
