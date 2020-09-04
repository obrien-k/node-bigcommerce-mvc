# Setup

After running `npm i`, you'll need to supply credentials for a BC store and MongoDB server. This app assumes usage of dotenv and a .env file or similar. An example of what this might look like:

```
MONGO=mongodb+srv://user:pass@domain/database
CLIENT=BC CLIENT ID
TOKEN=BC TOKEN
SECRET=BC SECRET
HASH=BC HASH
PORT=3333
```

You should be able to run `node index.js` successfully, but when reaching the localhost:PORT your console might show errors when trying to access the database.

# Errors
I started running into an error which caused me to enable a dev dependency for v4.5.0 of the Handlebars NPM package, see https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details. For this to work as expected, you need to install the app with developer dependencies, this can be done with the command `npm i -D`. 
