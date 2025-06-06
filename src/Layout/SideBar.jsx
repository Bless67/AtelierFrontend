import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTimes,
  FaHome,
  FaClipboardList,
  FaInfoCircle,
  FaServicestack,
  FaPhone,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavigate = (path) => {
    if (path !== currentPath) {
      navigate(path);
    }
    setSideBarOpen(false);
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Orders", path: "/orders", icon: <FaClipboardList /> },
    { name: "About", path: "/about", icon: <FaInfoCircle /> },

    { name: "Contact", path: "/contact", icon: <FaPhone /> },
  ];

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const overlayVariants = {
    hidden: { opacity: 0, pointerEvents: "none" },
    visible: { opacity: 0.5, pointerEvents: "auto" },
  };

  return (
    <AnimatePresence>
      {sideBarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black z-90 md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={() => setSideBarOpen(false)}
          />

          {/* Sidebar */}
          <motion.aside
            className="fixed top-0 left-0 h-full w-[70%] bg-gray-800 text-white z-100 shadow-lg md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                aria-label="Close sidebar"
                onClick={() => setSideBarOpen(false)}
                className="text-2xl cursor-pointer "
              >
                <FaTimes />
              </button>
            </div>

            <nav className="flex flex-col p-4 space-y-4 text-lg">
              {menuItems.map(({ name, path, icon }) => (
                <motion.button
                  key={path}
                  onClick={() => handleNavigate(path)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 text-left transition-colors duration-300 ${
                    currentPath === path
                      ? "text-orange-400 font-bold"
                      : "hover:text-orange-300"
                  }`}
                >
                  <span className="text-xl">{icon}</span> {name}
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideBar;
