require('dotenv').config();

const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
const Store = require('../models/Store.js');
BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.CLIENT,
  accessToken: process.env.TOKEN,
  secret: process.env.SECRET,
  storeHash: process.env.HASH,
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});
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
router.get('/:id', (req, res) => {
  let productId = req.params.id;
  let r = JSON.stringify(req.params);
  console.log(r + 'requestVal');
  Product.findOne({_id: productId}).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      Store.findOne({}, (err, Store) => {
        if(err){
          console.log(err);
        } else {
          res.render('product_details', {
            title: 'Product Details',
            Product: ret,
            Store: Store
          });
        }
      })
      
    }
  });
})
router.get('/products/update', (req, res) => {
  res.render('index', { message: 'Updating' });
  const getProducts = new Promise(async function(resolve) {
    try{
     bigCommerce.get('/catalog/products').then(data => {
        console.log('RUNNING...')
        /* Retrieves the Catalog API Products Endpoint and assigns each of the returned objects' IDs to 
        the array 'pArr' */
        Arr = data.data;
        let pArr = [];
        for ([key, value] of Object.entries(Arr)) {
          if (value.id) {
            pArr.push(value.id);
          }
        }
        // A nested asynchronous function, run for the length of pArr
        e();
        async function e(res) {
          for (i = 0; i < pArr.length; i++) {
            s = [];
            await bigCommerce.get('/catalog/products/' + pArr[i] + "/?include=variants").then(data => {
              prodArr = data.data;
              v = [prodArr];
              v.forEach(element => s.push(element))
              return res;
            });
            
            try {
                const context = {}
                context.data = s;
                const newProduct = {}
                newProduct.name = context.data.name;
                newProduct.product_id = context.data.id;
                newProduct.type = context.data.type;
                newProduct.sku = context.data.sku;
                newProduct.slug = context.data.custom_url.url;
                newProduct.variants = context.data.variants;
                newProduct.date_modified = context.data.date_modified;

                console.log(newProduct);
                Product.collection.findOne({ name: newProduct.name }, null, function(
                  err,
                  docs
                ) {
                  if (docs === null) {
                    Product.collection.insertOne(newProduct , function(err, res) {
                      if (err) throw err;
                      console.log(
                        'Number of documents inserted: ' + res.insertedCount
                      );
                      });
                    if (err) throw err;
                  } else {
                    console.log(newProduct.name + " is already inserted");
                  }
                });
            }
            catch(err) {
              return err;
            }
            
            console.log('DONE with for loop from line 73')
            }
           
      }
     });
     console.log('log before try close line 58')

    }

      catch(err){
        console.log(err + 'line 100');
        return err;
      }
  });
  getProducts;
});


router.get('/products/:id', (req, res) => {
  let productId = req.params.id;

  Product.findById(productId).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render('index', {
      title: 'Edit Product',
      Product: ret,
      message: ''
    });
  });
});

// These routes are placeholders but could be used in future iterations.

router.post('/products/add', (req, res) => {
  let message = '';
  let id = req.body.id;
  let name = req.body.name;
  let sku = req.body.sku;

  let newProduct = { id: id, name: name, sku: sku };
  Product.create(newProduct, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyCreated);
      res.redirect('/');
    }
  });
});
router.post('/products/edit/:id', (req, res) => {
  let productId = req.params.id;

  Product.findByIdAndUpdate(productId, req.body).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});
router.get('/products/delete/:id', (req, res) => {
  let productId = req.params.product_id;

  Product.findByIdAndRemove(productId, req.body).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});
module.exports = router;
