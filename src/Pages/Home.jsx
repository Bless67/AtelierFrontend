import React from "react";
import { motion } from "framer-motion";
import NavBar from "../Layout/NavBar"; // Adjust path as needed
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const About = () => {
  const navigate = useNavigate();
  return (
    <>
      <NavBar showSearchbtn={true} />

      <motion.div
        className="bg-white text-gray-800 px-4 sm:px-6 lg:px-12 py-12 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-6 text-center"
          variants={fadeUp}
        >
          Yabuwat Atelier
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg mb-8 text-center font-medium text-pink-600"
          variants={fadeUp}
          custom={1}
        >
          For those who dress with intention
        </motion.p>

        <motion.p
          className="mb-6 text-sm sm:text-base leading-relaxed text-justify"
          variants={fadeUp}
          custom={2}
        >
          Born from a passion for culture, craftsmanship, and timeless style,
          Yabuwat Atelier was created to redefine how people express elegance.
          What began as a vision to elevate traditional Nigerian fashion has
          evolved into a brand that celebrates heritage through modern design.
        </motion.p>

        <motion.div
          className="mb-8 flex justify-center"
          variants={fadeUp}
          custom={3}
        >
          <img
            src="/IMG-20251111-WA0008.jpg"
            alt="Heritage and Craftsmanship"
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </motion.div>

        <motion.p
          className="mb-6 text-sm sm:text-base leading-relaxed text-justify"
          variants={fadeUp}
          custom={4}
        >
          At Yabuwat Atelier, every stitch tells a story — a story of precision,
          pride, and purpose. Our creations merge the richness of native wear
          with the sophistication of contemporary tailoring, offering pieces
          that embody confidence, individuality, and prestige.
        </motion.p>

        <motion.div
          className="mb-8 flex justify-center"
          variants={fadeUp}
          custom={5}
        >
          <img
            src="/IMG-20251111-WA0007.jpg"
            alt="Modern Tailoring"
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </motion.div>

        <motion.p
          className="mb-6 text-sm sm:text-base leading-relaxed text-justify"
          variants={fadeUp}
          custom={6}
        >
          Each collection is more than fashion; it is an artistic expression of
          culture reimagined for the modern man. We believe true style lies in
          authenticity — and that's what every Yabuwat piece represents: culture
          refined, confidence defined.
        </motion.p>

        <motion.div
          className="mb-8 flex justify-center"
          variants={fadeUp}
          custom={7}
        >
          <img
            src="/IMG-20251111-WA0011.jpg"
            alt="Culture Refined"
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </motion.div>

        <motion.button
          onClick={() => navigate("/catalog")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative overflow-hidden 
                    w-full flex items-center justify-center gap-3 text-lg font-semibold py-4 px-6 rounded-xl
                   bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

          <span className="relative z-10">View catalog</span>
          <FaArrowRight className="text-xl relative z-10" />
        </motion.button>
      </motion.div>
    </>
  );
};

export default About;
