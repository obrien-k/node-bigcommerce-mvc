router.get('/authorize', (req, res) => {
  const authUrl = bigCommerce.getAuthorizeUrl({
    callback: process.env.APP_URL + '/auth/callback',
    scope: 'store_v2_information'
  });

  req.session.state = Math.random().toString(36).substring(7);
  res.redirect(authUrl);
});

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

    // Create a new user with the email address from the BigCommerce store data
    const newUser = await User.create({
      email: storeData.admin_email,
      password: '', // Set a default password for now
      hasSynced: false
    });

    // Store the new user's _id in the session
    req.session.userId = newUser._id;

    // Redirect the user to the dashboard
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});
