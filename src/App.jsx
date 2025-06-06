import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SingleProduct from "./Pages/SingleProduct";
import SearchPage from "./Pages/SearchPage";
import CartItem from "./Pages/CartItem";
import CheckOut from "./Pages/CheckOut";
import PaymentVerification from "./Pages/PaymentVerification";
import CheckOrders from "./Pages/CheckOrders";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFailed from "./components/PaymentFailed";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./Layout/Footer";
import { useLocation } from "react-router-dom";
import { getTemporaryUserId } from "./utils/CartUtils";
import { useEffect } from "react";

const App = () => {
  const location = useLocation();
  const hideFooterRoutes = [
    "/sucess",
    "/checkout",
    "/failure",
    "/payment-success",
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
          <Route path="/product/:id" element={<SingleProduct />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartItem />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/payment-success" element={<PaymentVerification />} />
          <Route path="/orders" element={<CheckOrders />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/failure" element={<PaymentFailed />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      {shouldShowFooter && <Footer />}
    </main>
  );
};

export default App;
