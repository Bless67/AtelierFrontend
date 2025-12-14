import { Routes, Route } from "react-router-dom";
import Catalog from "./Pages/Catalog";
import SingleProduct from "./Pages/SingleProduct";
import SearchPage from "./Pages/SearchPage";
import CartItem from "./Pages/CartItem";
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import NotFoundPage from "./Pages/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./Layout/Footer";
import { useLocation } from "react-router-dom";
import { getTemporaryUserId } from "./utils/CartUtils";
import { useEffect } from "react";

const App = () => {
  const location = useLocation();
  const hideFooterRoutes = [
    "/success",
    "/checkout",
    "/failure",
    "/payment-success",
    "*",
  ];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);
  useEffect(() => {
    getTemporaryUserId();
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <ScrollToTop />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/cart" element={<CartItem />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<SingleProduct />} />
          <Route path="/catalog" element={<Catalog />} />

          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      {shouldShowFooter && <Footer />}
    </main>
  );
};

export default App;
