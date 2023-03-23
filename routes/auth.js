
const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Store = require('../models/Store.js');
const User = require('../models/User.js');
const bigCommerce = require('../datasources/bigcommerce.js');

router.get('/auth', (req, res, next) => {
  bigCommerce.authorize(req.query)
  .then(data => console.log(data))
  .then(data => res.render('integrations/auth', { title: 'Authorized!' }))
  .catch((err) => {console.error(err)});
  });

// Handle the callback from BigCommerce after the user has granted authorization
router.get('/auth/callback', async (req, res, next) => {
  const clientId = process.env.BIGC_CLIENT_ID;
  const clientSecret = process.env.BIGC_CLIENT_SECRET;
  const context = req.query.context;
  const authCode = req.query.code;
  const scopes = req.query.scope || 'store_v2_default';

  const tokenUrl = 'https://login.bigcommerce.com/oauth2/token';
  const tokenPayload = {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: 'authorization_code',
    context: context,
    code: authCode,
    scope: scopes
  };

  try {
    const tokenResponse = await axios.post(tokenUrl, tokenPayload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const accessToken = tokenResponse.data.access_token;
    
    // Hash and save the access token to the database
    if (!accessToken) {
      const err = new Error('Access token is null or undefined');
      err.statusCode = 400;
      return next(err);
    }
  
    // Hash and save the access token to the database
    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
  
    if (!hashedAccessToken) {
      const err = new Error('Access token is null or undefined');
      err.statusCode = 400;
      return next(err);
    }

    const storeData = await getStoreData(storeHash, hashedAccessToken);
    const existingStore = await Store.findOne({ hash: storeData.hash });

    if (!existingStore) {
      const result = await Store.create(storeData);
      console.log(`Number of documents inserted: ${result.insertedCount}`);
    } else {
      console.log(`${storeData.name} is already inserted`);
    }

    // Create a new user with the email address from the BigCommerce store data
    const newUser = await createUser(storeData.adminEmail, storeData._id);

    // Store the new user's _id in the session
    req.session.userId = newUser._id;

    // Redirect the user to the dashboard
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

async function getStoreData(storeHash, accessToken) {
  const headers = { 'X-Auth-Token': accessToken, 'Accept': 'application/json' };
  const storeUrl = `https://api.bigcommerce.com/stores/${storeHash}/v2/store`;

  try {
    const storeResponse = await axios.get(storeUrl, { headers });
    const storeData = storeResponse.data;

    return {
      hash: storeData.id,
      domain: storeData.domain,
      secureUrl: storeData.secure_url,
      status: storeData.status,
      name: storeData.name,
      adminEmail: storeData.admin_email,
      accessToken
    };
  } catch (err) {
    console.log(err);
    throw new Error('Error getting store data');
  }
}

async function createUser(email, storeId) {
  const hashedPassword = await bcrypt.hash('', 10);

  const existingUser = await User.findOne({ email, storeId });

  if (existingUser) {
    console.log(`User with email ${email} already exists for store ${storeId}`);
    return existingUser;
  }

  const newUser = new User({ email, password: hashedPassword, storeId });

  try {
    const savedUser = await newUser.save();
    console.log(`Created new user with email ${email} for store ${storeId}`);
    return savedUser;
  } catch (err) {
    console.log(err);
    throw new Error('Error creating new user');
  }
}

router.get('/load', async (req, res, next) => {
  try {
    const signedPayload = req.query.signed_payload_jwt;
    const decodedPayload = jwt.decode(signedPayload, { complete: true }).payload;
    const storeHash = decodedPayload.sub.split('/')[1];
    const storeData = await Store.findOne({ hash: storeHash });

    if (!storeData) {
      // This is a new store
      // Add store to database
    } else {
      const user = decodedPayload.user;
      if (storeData.adminEmail === user.email) {
        // The store owner has initiated the load callback
        // Proceed with normal flow
      } else {
        const existingUser = await User.findOne({ email: user.email, storeId: storeData._id });

        if (!existingUser) {
          // This is a new user
          await createUser(user.email, storeData._id);
        } else {
          // User already exists
          // Update user data as needed
        }
      }
    }

    res.render('integrations/welcome', { title: 'Welcome!', data: decodedPayload });
  } catch (err) {
    next(err);
  }
});

router.get('/uninstall', async (req, res, next) => {
  try {
    const signedPayload = req.query.signed_payload_jwt;
    const decodedPayload = jwt.decode(signedPayload, { complete: true }).payload;
    const storeHash = decodedPayload.sub.split('/')[1];
    const storeData = await Store.findOne({ hash: storeHash });

    if (!storeData) {
      // Store not found
      // Handle error
    } else {
      const user = decodedPayload.user;
      if (storeData.adminEmail === user.email) {
        // Store owner has uninstalled the app
        // Proceed with normal flow
      } else {
        const existingUser = await User.findOne({ email: user.email, storeId: storeData._id });

        if (existingUser) {
          await existingUser.remove();
          console.log(`User with email ${user.email} removed from store ${storeData.name}`);
        }
      }
    }
  } catch (err) {
    next(err);
  }
});

router.get('/remove_user', async (req, res, next) => {
  try {
    const signedPayload = req.query.signed_payload_jwt;
    const decodedPayload = jwt.decode(signedPayload, { complete: true }).payload;
    const storeHash = decodedPayload.sub.split('/')[1];
    const storeData = await Store.findOne({ hash: storeHash });

    if (!storeData) {
      // Store not found
      // Handle error
    } else {
      const existingUser = await User.findOne({ email: decodedPayload.user.email, storeId: storeData._id });

      if (existingUser) {
        await existingUser.remove();
        console.log(`User with email ${existingUser.email} removed from store ${storeData.name}`);
      } else {
        console.log(`User with email ${decodedPayload.user.email} not found in store ${storeData.name}`);
      }
    }

    res.status(200).send('User removed successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;