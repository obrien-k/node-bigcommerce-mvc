require('dotenv').config();

const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
const Store = require('../models/Store.js');
const bigCommerce = require('../datasources/bigcommerce.js');

// Get all products from the database and render the index page
router.get('/products', async (req, res, next) => {
  try {
    const allProducts = await Product.find({}).exec();
    res.render('index', {
      title: 'MVC Example | View Products',
      Products: allProducts
    });
  } catch (err) {
    next(err);
  }
});

/* From memory, these are required to work even though the models are broken

// Get a specific product from the database and render the product details page
const getStoreInfo = async (req, res, next) => {
  try {
    const store = await Store.findOne({}).exec();
    req.store = store;
    next();
  } catch (err) {
    next(err);
  }
};

// Get the logged in store's information from the database
router.get('/:id', getStoreInfo, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).exec();
    const store = req.store;
    res.render('product_details', {
      title: 'Product Details',
      Product: product,
      Store: store
    });
  } catch (err) {
    next(err);
  }
});
*/

// Update the products in the database based on data from BigCommerce
router.get('/products/update', async (req, res, next) => {
  try {
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
    res.render('index', { message: 'Updated', Products: productData });
  } catch (err) {
    next(err);
  }
});

// Edit a specific product in the database
router.post('/products/edit/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    // Validate input data
    if (!productData.name || !productData.type || !productData.sku) {
      throw new Error('Invalid input data');
    }

    await Product.findByIdAndUpdate(productId, productData).exec();
    console.log(`Product ${productId} updated successfully`);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Delete a specific product from the database
router.get('/products/delete/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndRemove(productId).exec();
    console.log(`Product ${productId} deleted successfully`);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;