require('dotenv').config();

const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  exphbs = require('express-handlebars'),
  BigCommerce = require('node-bigcommerce');
  mongoose = require('mongoose');
  (app = express()),
  (hbs = exphbs.create({
    /* config */
  }));

  const productRoute = require('./routes/product');
  const Product = require('./models/Product.js');  
  const storeRoute = require('./routes/store');
  const Store = require('./models/Store.js');
  

const server = app.listen(process.env.PORT, () => {
  console.log('Express listening at ', server.address().port);
});

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', err => {
  console.log(`MongoDB Connection Error: ${err}`);
});

const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.BIGC_CLIENT_ID,
  accessToken: process.env.BIGC_ACCESS_TOKEN,
  secret: process.env.BIGC_CLIENT_SECRET,
  storeHash: process.env.BIGC_STORE_HASH,
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});

app.engine(
  '.hbs',
  exphbs({
    extname: '.hbs',
    helpers: {
      toJSON: function(object) {
        return JSON.stringify(object);
      },
      link: function(thisStore, thisProduct) {
        let Store = thisStore,
            Product = thisProduct;
            
       return("http://store-" + Store + ".mybigcommerce.com/cart.php?action=add&product_id=" + Product);
    },
    linkSku: function(thisStore, thisProduct) {
      let Store = thisStore,
          Product = thisProduct;
          
     return("<a href='http://store-" + Store + ".mybigcommerce.com/cart.php?action=add&sku=" + Product + "'>");
  }
    }
  })
);
mongoose.set('debug', true);
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');
app.use(express.static('views/images')); 
app.use(bodyParser.json());
app.use(productRoute);
app.use(storeRoute);

// ROUTES
app.get('/', async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const allStores = await Store.find({});
    res.render('index', {
      title: 'MVC Example',
      Products: allProducts,
      Stores: allStores
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

// logger middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

app.use(logger);

router.get('/auth', (req, res, next) => {
  bigCommerce
    .authorize(req.query)
    .then(data =>
      res
        .render('integrations/auth', { title: 'Authorized!', data: data })
        .catch(next)
    );
});

router.get('/load', (req, res, next) => {
  try {
    const data = bigCommerce.verify(req.query['signed_payload']);
    res.render('integrations/welcome', { title: 'Welcome!', data: data });
  } catch (err) {
    next(err);
  }
});
