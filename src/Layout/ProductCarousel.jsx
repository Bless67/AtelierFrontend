import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaTimes,
} from "react-icons/fa";

const ProductCarousel = ({ images, productName = "Product" }) => {
  const [[index, direction], setIndex] = useState([0, 0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const paginate = useCallback(
    (dir) => {
      setIndex(([currentIndex]) => [
        (currentIndex + dir + images.length) % images.length,
        dir,
      ]);
    },
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isZoomed && e.key === "Escape") {
        setIsZoomed(false);
        return;
      }
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, isZoomed]);

  // Prevent body scroll when zoomed
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isZoomed]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  const handleImageLoad = (idx) => {
    setImageLoading((prev) => ({ ...prev, [idx]: false }));
  };

  const handleImageError = (idx) => {
    setImageErrors((prev) => ({ ...prev, [idx]: true }));
    setImageLoading((prev) => ({ ...prev, [idx]: false }));
  };

  // Preload next and previous images
  useEffect(() => {
    const nextIndex = (index + 1) % images.length;
    const prevIndex = (index - 1 + images.length) % images.length;

    [nextIndex, prevIndex].forEach((idx) => {
      if (!imageLoading[idx] && !imageErrors[idx]) {
        const img = new Image();
        img.src = images[idx].image_url;
      }
    });
  }, [index, images, imageLoading, imageErrors]);

  return (
    <>
      <div className="relative w-full bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
        {/* Main Image Container - Responsive aspect ratio */}
        <div className="relative w-full aspect-square">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -1000) paginate(1);
                else if (swipe > 1000) paginate(-1);
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              {/* Loading skeleton */}
              {imageLoading[index] !== false && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
              )}

              {/* Error state */}
              {imageErrors[index] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-500 text-sm">Image unavailable</p>
                  </div>
                </div>
              ) : (
                <img
                  src={images[index].image_url}
                  alt={`${productName} - View ${index + 1}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  className="w-full h-full object-contain p-2 sm:p-4"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Zoom button */}
          <motion.button
            onClick={() => setIsZoomed(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Zoom image"
          >
            <FaSearchPlus className="text-gray-700 text-sm sm:text-base" />
          </motion.button>

          {/* Navigation arrows - Hidden on mobile */}
          {images.length > 1 && (
            <>
              <motion.button
                onClick={() => paginate(-1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:flex absolute top-1/2 left-2 lg:left-4 -translate-y-1/2 p-2 lg:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-gray-700" />
              </motion.button>

              <motion.button
                onClick={() => paginate(1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:flex absolute top-1/2 right-2 lg:right-4 -translate-y-1/2 p-2 lg:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
                aria-label="Next image"
              >
                <FaChevronRight className="text-gray-700" />
              </motion.button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {index + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 sm:p-4 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setIndex([i, i > index ? 1 : -1])}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  i === index
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={images[i].image_url}
                  alt={`${productName} thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors z-10"
              aria-label="Close zoom"
            >
              <FaTimes className="text-xl" />
            </motion.button>

            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={images[index].image_url}
              alt={`${productName} - Zoomed view ${index + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation in zoom mode */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="text-xl" />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                  aria-label="Next image"
                >
                  <FaChevronRight className="text-xl" />
                </motion.button>
              </>
            )}

            {/* Image counter in zoom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {index + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCarousel;
