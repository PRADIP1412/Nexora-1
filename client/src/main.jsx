import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";


import "./assets/clash-display.css";

import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { ProfileProvider } from "./context/ProfileContext.jsx";
import { AccountProvider } from "./context/AccountContext.jsx";
import { AddressProvider } from "./context/AddressContext";
import { OrderProvider } from "./context/OrderContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import { PaymentProvider } from "./context/PaymentContext";
import { CouponProvider } from "./context/CouponContext";
import { OfferProvider } from "./context/OfferContext";

// Product Catalog Context Providers
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { BrandProvider } from "./context/BrandContext";
import { CatalogProvider } from "./context/CatalogContext";
import { AttributeProvider } from "./context/AttributeContext.jsx";

// Import MediaProvider
import { MediaProvider } from "./context/MediaContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <ProfileProvider>
          <AccountProvider>
            <CartProvider>
              <CouponProvider>
                <OfferProvider>
                  <WishlistProvider>
                    <AddressProvider>
                      <OrderProvider>
                        <CheckoutProvider>
                          <PaymentProvider>
                            {/* Product Catalog Providers */}
                            <ProductProvider>
                              <CategoryProvider>
                                <BrandProvider>
                                  <AttributeProvider>
                                    <CatalogProvider>
                                      {/* Add MediaProvider here if you want it globally available */}
                                      {/* Or keep it scoped to the MediaPage route only */}
                                      <App />
                                    </CatalogProvider>
                                  </AttributeProvider>
                                </BrandProvider>
                              </CategoryProvider>
                            </ProductProvider>
                          </PaymentProvider>
                        </CheckoutProvider>
                      </OrderProvider>
                    </AddressProvider>
                  </WishlistProvider>
                </OfferProvider>
              </CouponProvider>
            </CartProvider>
          </AccountProvider>
        </ProfileProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);