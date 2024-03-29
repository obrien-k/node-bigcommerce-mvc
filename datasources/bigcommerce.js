const BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.BIGC_CLIENT_ID,
  accessToken: process.env.BIGC_ACCESS_TOKEN,
  secret: process.env.BIGC_CLIENT_SECRET,
  storeHash: process.env.BIGC_STORE_HASH,
  callback: process.env.REDIRECT_URI,
  responseType: 'json',
  headers: { 'Accept-Encoding': '*' },
  apiVersion: 'v3' // Default is v2
});

module.exports = bigCommerce;