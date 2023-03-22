const express = require('express');
const router = express.Router();
const BigCommerce = require('node-bigcommerce');
const querystring = require('querystring');
const axios = require('axios');
const bcrypt = require('bcrypt');
const Store = require('../models/Store.js');

// Initialize the BigCommerce API client
const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.BIGC_CLIENT_ID,
  accessToken: process.env.BIGC_ACCESS_TOKEN,
  secret: process.env.BIGC_CLIENT_SECRET,
  storeHash: process.env.BIGC_STORE_HASH,
  responseType: 'json',
  apiVersion: 'v3' // Use latest API version
});

// Redirect the user to the BigCommerce authorization page
router.get('/authorize', (req, res) => {
  const authUrl = bigCommerce.getAuthorizeUrl({
    callback: process.env.APP_URL + '/auth/callback',
    scope: 'store_v2_information'
  });

  res.redirect(authUrl);
});

// Handle the callback from BigCommerce and exchange the temporary code for a permanent access token
router.get('/auth/callback', async (req, res) => {
  try {
    const authCode = req.query.code;
    const payload = querystring.stringify({
      client_id: process.env.BIGC_CLIENT_ID,
      client_secret: process.env.BIGC_CLIENT_SECRET,
      redirect_uri: process.env.APP_URL + '/auth/callback',
      grant_type: 'authorization_code',
      code: authCode,
      scope: 'store_v2_information'
    });
    const response = await axios.post('https://login.bigcommerce.com/oauth2/token', payload);
    const accessToken = response.data.access_token;

    // Hash and save the access token to the database
    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
    const storeData = await bigCommerce.get('/store');
    const newStore = {
      hash: storeData.id,
      domain: storeData.domain,
      secure_url: storeData.secure_url,
      status: storeData.status,
      name: storeData.name,
      access_token: hashedAccessToken
    };
    const existingStore = await Store.collection.findOne({ hash: newStore.hash });

    if (!existingStore) {
      const result = await Store.collection.insertOne(newStore);
      console.log(`Number of documents inserted: ${result.insertedCount}`);
    } else {
      console.log(`${newStore.name} is already inserted`);
    }

    // Redirect the user to the dashboard
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
