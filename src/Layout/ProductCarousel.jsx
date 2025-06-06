// ProductCarousel.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { baseUrl } from "../utils/CartUtils";

const swipeThreshold = 10000;

const ProductCarousel = ({ images }) => {
  const [[index, direction], setIndex] = useState([0, 0]);

  const paginate = (dir) => {
    setIndex([(index + dir + images.length) % images.length, dir]);
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <div className="relative flex flex-col justify-center items-center w-full  overflow-hidden rounded-xl">
      <AnimatePresence custom={direction}>
        <div className="aspect-square   w-[90%] flex justify-center">
          <motion.img
            key={index}
            src={`${baseUrl}${images[index].image}`}
            variants={variants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -swipeThreshold) paginate(1);
              else if (swipe > swipeThreshold) paginate(-1);
            }}
            className="w-full h-full object-contain absolute"
          />
        </div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
      >
        <FaChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
export default ProductCarousel;
