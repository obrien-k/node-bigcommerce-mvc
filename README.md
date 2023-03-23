# Installation

Tested with Node.js v14.20.10

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

# Developer Branch

If you're on the dev branch, installing devDependencies also installs the node-hashtable and nan Node packages to enable use of variants in future iterations.
