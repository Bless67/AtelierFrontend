import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { FaArrowCircleRight, FaExclamationCircle } from "react-icons/fa";

const NotFoundPage = () => {
  // Framer Motion variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between child animations
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center text-white p-4 font-sans"
    >
      <motion.div
        variants={numberVariants}
        className="text-9xl font-extrabold text-indigo-500 mb-4 drop-shadow-lg"
      >
        404
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center text-5xl font-bold mb-8 text-gray-100 text-center"
      >
        <FaExclamationCircle className="h-12 w-12 text-red-500 mr-4 flex-shrink-0" />
        <span className="leading-tight">Page Not Found</span>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-lg text-gray-400 mb-8 text-center max-w-lg leading-relaxed"
      >
        Oops! It seems like the page you were looking for has vanished into the
        digital abyss. It might have been moved, deleted, or perhaps it never
        existed!
      </motion.p>

      <motion.div variants={itemVariants}>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          Go to Homepage
          <FaArrowCircleRight className="ml-3 -mr-1 h-5 w-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;
