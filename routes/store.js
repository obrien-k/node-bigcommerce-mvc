require('dotenv').config();
const express = require('express');
const router = express.Router();
const Store = require('../models/Store.js');
BigCommerce = require('node-bigcommerce');


const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.BIGC_CLIENT_ID,
  accessToken: process.env.BIGC_ACCESS_TOKEN,
  secret: process.env.BIGC_CLIENT_SECRET,
  storeHash: process.env.BIGC_STORE_HASH,
  responseType: 'json',
  apiVersion: 'v2' // Default is v2
});
router.get('/store', (req, res) => {
  Store.find({}).lean().exec((err, allStores) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('index', {
        title: 'MVC Example | View Store Info',
        Stores: allStores
      });
    }
  });
});

router.get('/store/update', async (req, res) => {
  try {
    res.render('index', { message: 'Updating' });

    const data = await bigCommerce.get('/store');

    const newStore = {
      hash: data.id,
      domain: data.domain,
      secure_url: data.secure_url,
      status: data.status,
      name: data.name
    };

    const existingStore = await Store.collection.findOne({ hash: newStore.hash });

    if (!existingStore) {
      const result = await Store.collection.insertOne(newStore);

      console.log(`Number of documents inserted: ${result.insertedCount}`);
    } else {
      console.log(`${newStore.name} is already inserted`);
    }
  } catch (err) {
    console.log(`${err} line 71 Store.js`);
    return err;
  }
});

router.get('/store/:storeId', (req, res) => {
  const storeId = req.params.storeId;

  Store.findOne({hash: storeId}, {_id:0}).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render('store', {
      title: 'Store Details',
      Store: ret,
      storeId,
      message: ''
    });
  });
})



module.exports = router;
