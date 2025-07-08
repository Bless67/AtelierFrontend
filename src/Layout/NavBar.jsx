import { FaCartShopping } from "react-icons/fa6";
import { FaBars, FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../utils/CartProvider";
import { useState } from "react";
import SideBar from "./SideBar";
import { motion } from "framer-motion";

const NavBar = ({ showSearchbtn }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartQuantity } = useCart();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Orders", path: "/orders" },
    { name: "About", path: "/about" },

    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="shadow text-white bg-gray-900 shadow-gray-300">
      <SideBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Sidebar toggle (mobile) */}
        <button
          className="cursor-pointer text-2xl md:hidden"
          onClick={() => setSideBarOpen(true)}
        >
          <FaBars />
        </button>

        {/* Logo */}

        <Link to={"/"}>
          <div className=" flex justify-center items-center gap-x-2">
            <img src="/logo_cleanup_1.png" alt="logo" className="h-[40px]" />
          
          </div>
        </Link>

        {/* Nav Links */}
        <ul className="hidden text-xl md:flex space-x-8 font-medium">
          {menuItems.map(({ name, path }) => (
            <motion.li
              key={path}
              onClick={() => navigate(path)}
              className={`cursor-pointer transition-colors ${
                location.pathname === path
                  ? "text-indigo-500 font-bold"
                  : "hover:text-indigo-300"
              }`}
            >
              {name}
            </motion.li>
          ))}
        </ul>

        {/* Search + Cart */}
        <div className="flex gap-x-6 text-2xl px-3 md:px-0">
          {showSearchbtn && (
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer transition-colors ${
                location.pathname === "/search"
                  ? "text-indigo-500 font-bold"
                  : "hover:text-indigo-400"
              }`}
              onClick={() => navigate("/search")}
            >
              <FaSearch />
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <FaCartShopping
              className={`cursor-pointer transition-colors ${
                location.pathname === "/cart"
                  ? "text-indigo-500 font-bold"
                  : "hover:text-indigo-400"
              }`}
            />
            {parseInt(cartQuantity) > 0 && (
              <motion.span
                className="absolute -top-2 -right-5 bg-red-600 px-2 rounded-full py-0.5 font-black text-xs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {cartQuantity}
              </motion.span>
            )}
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
