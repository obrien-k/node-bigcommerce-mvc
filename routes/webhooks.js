const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
const BigCommerce = require('node-bigcommerce');

// Initialize BigCommerce API client
const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.CLIENT,
  accessToken: process.env.TOKEN,
  secret: process.env.SECRET,
  storeHash: process.env.HASH,
  responseType: 'json',
  apiVersion: 'v3'
});

// Handle webhook events
router.post('/webhooks', async (req, res) => {
  const payload = req.body;
  const scope = payload.scope;
  const data = payload.data;
  const productId = data.id;

  try {
    if (scope === 'store/product/deleted') {
      await Product.findByIdAndRemove(productId).exec();
      console.log(`Product ${productId} deleted successfully`);
    } else {
      const response = await bigCommerce.get(`/catalog/products/${productId}/?include=variants`);
      const product = response.data;
      const productData = {
        id: product.id,
        name: product.name,
        type: product.type,
        sku: product.sku,
        slug: product.custom_url.url,
        variants: product.variants,
        date_modified: product.date_modified
      };

      if (scope === 'store/product/created') {
        await Product.create(productData);
        console.log(`Product ${productId} created successfully`);
      } else if (scope === 'store/product/updated') {
        await Product.findByIdAndUpdate(productId, productData).exec();
        console.log(`Product ${productId} updated successfully`);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;