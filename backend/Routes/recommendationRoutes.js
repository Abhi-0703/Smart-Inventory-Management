const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const Demand = require('../Models/Demand');

const LOW_STOCK_THRESHOLD = 100;
const HIGH_STOCK_THRESHOLD = 200;
const LOWER_STOCK_THRESHOLD = 50; // Warning if below this

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const demands = await Demand.find().populate('product');

    const recommendations = [];
    const warnings = [];

    // Build demand map
    const demandMap = {};
    for (const d of demands) {
      if (!d.product || !d.product.name || !d.store) {
        console.warn('Skipping demand entry due to missing product or store:', d);
        continue;
      }
      const store = d.store;
      const productName = d.product.name;

      if (!demandMap[store]) demandMap[store] = {};
      demandMap[store][productName] = d.level;
    }

    // Group products
    const productGroups = {};
    for (const p of products) {
      if (!productGroups[p.name]) productGroups[p.name] = [];
      productGroups[p.name].push(p);
    }

    for (const [productName, entries] of Object.entries(productGroups)) {
      const receivers = entries.filter((p) => {
        const demand = demandMap[p.location]?.[productName] ?? 0;
        return p.quantity < LOW_STOCK_THRESHOLD && (demand === 2 || demand === 1);
      });

      const donors = entries.filter((p) => {
        const demand = demandMap[p.location]?.[productName] ?? 0;
        return p.quantity > HIGH_STOCK_THRESHOLD && demand === 0;
      });

      for (const receiver of receivers) {
        let foundDonor = false;

        for (const donor of donors) {
          if (receiver.location === donor.location) continue;

          const suggestedAmount = Math.min(
            donor.quantity - HIGH_STOCK_THRESHOLD,
            LOW_STOCK_THRESHOLD - receiver.quantity
          );

          if (suggestedAmount > 0) {
            recommendations.push({
              product: productName,
              from: donor.location,
              to: receiver.location,
              suggestedAmount
            });
            foundDonor = true;
            break;
          }
        }

        if (!foundDonor) {
          recommendations.push({
            product: productName,
            from: 'Warehouse/Factory',
            to: receiver.location,
            suggestedAmount: LOW_STOCK_THRESHOLD - receiver.quantity
          });
        }
      }

      // Only show "stock about to finish" warning
      for (const entry of entries) {
        if (entry.quantity < LOWER_STOCK_THRESHOLD) {
          warnings.push({
            product: productName,
            store: entry.location,
            issue: 'Stock about to finish'
          });
        }
      }
    }

    res.json({
      recommendations,
      warnings
    });

  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
