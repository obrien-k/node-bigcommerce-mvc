# Pre-requisities

Node-Gyp's NAN package dependency causes the node-hashtable dependency within this package to remain locked in <v12 of Node, I recommend targeting v10.22.1.

2022 update: Investigating.

# Setup

After running `npm i`, you'll need to supply credentials for a [BigCommerce](https://bigcommerce.com) store and [MongoDB](https://mongodb.com) server. This app assumes usage of dotenv and a .env file or similar. An example of what this might look like:

```
MONGO=mongodb+srv://user:pass@domain/database
BIGC_CLIENT_ID=
BIGC_ACCESS_TOKEN=
BIGC_CLIENT_SECRET=
BIGC_STORE_HASH=
PORT=
BIGC_STENCIL_TOKEN=
STORE_CANONICAL_URL=
STORE_DOMAIN=
```

You should be able to run `node index.js` successfully, but when reaching the localhost:PORT your console might show errors when trying to access the database.

# Errors

I started running into an error which caused me to enable a dev dependency for v4.5.0 of the Handlebars NPM package, see https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details. For this to work as expected, you need to install the app with developer dependencies, this can be done with the command `npm i -D`. 

# Developer Branch

If you're on the dev branch, installing devDependencies also installs the node-hashtable and nan Node packages to enable use of variants in future iterations.
