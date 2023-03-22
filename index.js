require('dotenv').config();

const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  exphbs = require('express-handlebars'),
  mongoose = require('mongoose'),
  helmet = require('helmet'),
  bigCommerce = require('./datasources/bigcommerce.js');
  (app = express()),
  (hbs = exphbs.create({
    /* config */
  }));

  // Allow embedding the site within an iframe only from the same origin
  
  // Routes
  const productRoute = require('./routes/product'),
        Product = require('./models/Product.js'),
        storeRoute = require('./routes/store'),
        Store = require('./models/Store.js'),
        authRoute = require('./routes/auth');
  

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express listening at ', server.address().port);
});

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', err => {
  console.log(`MongoDB Connection Error: ${err}`);
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
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    frameAncestors: ["'self'", "https://store-bq4uczryb8.mybigcommerce.com/"]
  }
}));

app.use(productRoute, storeRoute, authRoute);

// logger middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

app.use(logger);

// ROUTES
/*
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

*/