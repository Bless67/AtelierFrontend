import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center">
        {/* Left Text Section */}
        <motion.div
          className="md:w-1/2 text-center md:text-left mb-10 md:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            <span className="text-orange-500">FASHION</span> FOR EVERYONE
          </h1>
          <p className="text-xl font-semibold mb-3">
            Discover trendy high fashion that suits your style.
          </p>
          <p className="text-gray-300 text-md md:text-lg mb-6">
            From bold looks to timeless styles, redefine your wardrobe with our
            curated collection designed for confidence and comfort.
          </p>
        </motion.div>

        {/* Right Image Section */}
        {/* <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <img
            src="https://via.placeholder.com/400x500?text=Fashion+Model"
            alt="Placeholder model"
            className="w-full max-w-[400px] md:max-w-[500px] h-auto rounded-xl shadow-lg object-contain"
          />
        </motion.div> */}
      </div>
    </section>
  );
};

export default Hero;
