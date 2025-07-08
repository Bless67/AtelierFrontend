import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-black via-gray-800 to-black text-white py-16  flex  justify-center relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-indigo-500 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-indigo-500 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-indigo-500 rounded-full"></div>
      </div>

      <motion.div
        className="text-center mb-10 md:mb-0 z-10 max-w-4xl mx-auto px-4"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 flex flex-col"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-indigo-500 text-shadow-lg">FASHION</span>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            FOR EVERYONE
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl font-semibold mb-4 text-indigo-300"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Discover trendy high fashion that suits your style.
        </motion.p>

        <motion.p
          className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          From bold looks to timeless styles, redefine your wardrobe with our
          curated collection designed for confidence and comfort.
        </motion.p>
      </motion.div>

      {/* Animated accent elements */}
      <motion.div
        className="absolute bottom-10 left-10 w-2 h-20 bg-gradient-to-t from-indigo-500 to-transparent"
        initial={{ height: 0 }}
        animate={{ height: 80 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      />
      <motion.div
        className="absolute top-10 right-10 w-20 h-2 bg-gradient-to-r from-indigo-500 to-transparent"
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      />
    </section>
  );
};

export default Hero;
