require('dotenv').config();

const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
const Store = require('../models/Store.js');
const BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.CLIENT,
  accessToken: process.env.TOKEN,
  secret: process.env.SECRET,
  storeHash: process.env.HASH,
  responseType: 'json',
  apiVersion: 'v3'
});

// Get all products from the database and render the index page
router.get('/products', (req, res) => {
  Product.find({}, (err, allProducts) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('index', {
        title: 'MVC Example | View Products',
        Products: allProducts
      });
    }
  });
});

// Get a specific product from the database and render the product details page
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).exec();
  const store = await Store.findOne({}).exec();
  res.render('product_details', {
    title: 'Product Details',
    Product: product,
    Store: store
  });
});

// Update the products in the database based on data from BigCommerce
router.get('/products/update', async (req, res) => {
  try {
    res.render('index', { message: 'Updating' });
    const response = await bigCommerce.get('/catalog/products');
    const products = response.data;
    const productIds = products.map(product => product.id);
    const productData = await Promise.all(productIds.map(async id => {
      const response = await bigCommerce.get(`/catalog/products/${id}/?include=variants`);
      const product = response.data;
      return {
        id: product.id,
        name: product.name,
        type: product.type,
        sku: product.sku,
        slug: product.custom_url.url,
        variants: product.variants,
        date_modified: product.date_modified
      };
    }));
    await Product.collection.insertMany(productData, { ordered: false });
    console.log('Products updated successfully');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('index', { message: 'Error updating products' });
  }
});

// Edit a specific product in the database
router.post('/products/edit/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    await Product.findByIdAndUpdate(productId, productData).exec();
    console.log(`Product ${productId} updated successfully`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('index', { message: 'Error updating product' });
  }
});

// Delete a specific product from the database
router.get('/products/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndRemove(productId).exec();
    console.log(`Product ${productId} deleted successfully`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('index', { message: 'Error deleting product' });
  }
});

module.exports = router;
