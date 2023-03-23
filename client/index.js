import React, { useState, useEffect } from "react";
import { Grid, GridItem, Card, CardHeader, CardBody } from "@bigcommerce/big-design";

const IndexPage = () => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      const res = await fetch("/api/stores");
      const data = await res.json();
      setStores(data);
    };

    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    };

    fetchStores();
    fetchProducts();
  }, []);

  return (
    <Grid gridGap="medium">
      <GridItem>
        <h1 style={{ textAlign: "center" }}>Welcome to MVC Example</h1>
      </GridItem>
      <GridItem>
        {stores.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 style={{ margin: "0" }}>Connected Stores</h2>
            </CardHeader>
            <CardBody>
              {stores.map((store) => (
                <div key={store.hash}>
                  <h3>{store.name}</h3>
                  <p>
                    <strong>Store Domain:</strong> {store.domain}
                  </p>
                  <a href={`/store/${store.hash}`}>View Store Info</a>
                  <a href="/products/update">Sync Products from Store</a>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 style={{ margin: "0" }}>Connect Your Store</h2>
            </CardHeader>
            <CardBody>
              <p>
                To start syncing your store's products, you'll need to connect your store to this app.
              </p>
              <a href="/store/update">Connect Store Now</a>
            </CardBody>
          </Card>
        )}
      </GridItem>
      <GridItem>
        {products.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 style={{ margin: "0" }}>Synced Products</h2>
            </CardHeader>
            <CardBody>
              {products.map((product) => (
                <div key={product._id}>
                  <h3>{product.name}</h3>
                  <p>
                    <strong>Product Type:</strong> {product.type}
                  </p>
                  <p>
                    <strong>SKU:</strong> {product.sku}
                  </p>
                  {product.variants ? (
                    <div>
                      <h4>Product Options</h4>
                      <ul>
                        {product.variants.map((variant) => (
                          <li key={variant._id}>
                            {variant.option_values.map((option) => (
                              <div key={option._id}>
                                <strong>{option.option_display_name}:</strong> {option.label}
                              </div>
                            ))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 style={{ margin: "0" }}>Synced Products</h2>
            </CardHeader>
            <CardBody>
              <p>No products have been synced from your
              store yet.</p>
            </CardBody>
          </Card>
)}
      </GridItem>
    </Grid>
  );
};

export default IndexPage;