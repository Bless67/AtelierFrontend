// SearchPage.jsx - IMPROVED VERSION
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSlidersH,
  FaExclamationTriangle,
  FaShoppingBag,
  FaSearchMinus,
  FaImage,
} from "react-icons/fa";
import { BiSort } from "react-icons/bi";
import { MdError } from "react-icons/md";
import NavBar from "../Layout/NavBar";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import Modal from "../Layout/Modal";
import { Link, useSearchParams } from "react-router-dom";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [imageErrors, setImageErrors] = useState({});

  // Sync URL params with state
  useEffect(() => {
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch all products with caching
  const fetchProducts = async () => {
    const response = await api.get(`products/`);
    return response.data;
  };

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  // Memoized filter and sort logic with optimized dependencies
  const filteredProducts = useMemo(() => {
    if (
      !searchValue.trim() &&
      categoryFilter === "All" &&
      !minPrice &&
      !maxPrice
    ) {
      return [];
    }

    // Early return if no products loaded yet
    if (!products || products.length === 0) {
      return [];
    }

    let filtered = products.filter((product) => {
      const search = searchValue.toLowerCase().replace(/\s/g, "");
      const name = product.name.toLowerCase().replace(/\s/g, "");
      const matchesSearch = !search || name.includes(search);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const price = parseFloat(product.price);
      const matchesMin = !minPrice || price >= parseFloat(minPrice);
      const matchesMax = !maxPrice || price <= parseFloat(maxPrice);

      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });

    // Sort products based on selected option
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep original order for 'default'
        break;
    }

    return filtered;
  }, [products, searchValue, categoryFilter, minPrice, maxPrice, sortBy]);

  const filtersActive =
    searchValue.trim() || categoryFilter !== "All" || minPrice || maxPrice;

  const reset = () => {
    setCategoryFilter("All");
    setMinPrice("");
    setMaxPrice("");
    if (categoryFromUrl) {
      setSearchParams({});
    }
  };

  const handleModalClose = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    // Update URL with current category filter for sharing/bookmarking
    if (categoryFilter !== "All") {
      setSearchParams({ category: categoryFilter });
    } else {
      setSearchParams({});
    }
  };

  const handleClearAllFilters = () => {
    setSearchValue("");
    setSortBy("default");
    reset();
  };

  const handlePriceChange = (value, setter) => {
    // Validate input is a positive number or empty
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProductImage = (product) => {
    // Handle different image structures
    if (product.images && product.images.length > 0) {
      return product.images[0].medium_url || product.images[0].image;
    }
    return product.image;
  };

  // Show loading state
  if (isLoading) return <Loading />;

  // Show error state
  if (isError) return <ErrorComponent error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <NavBar showSearchbtn={true} />

      {/* Search Header Section */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-20 pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Input */}
          <div className="relative w-full max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
            {searchValue && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchValue("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <FaTimes />
              </motion.button>
            )}
          </div>

          {/* Sort Options - Desktop */}
          {filtersActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden sm:flex justify-center items-center gap-4 mt-4"
            >
              <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                <BiSort className="text-lg" />
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-sm"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </motion.div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {filtersActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 mt-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              Active Filters:
            </span>
            {searchValue.trim() && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2"
              >
                Search: "{searchValue}"
                <button
                  onClick={() => setSearchValue("")}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <FaTimes className="text-xs" />
                </button>
              </motion.span>
            )}
            {categoryFilter !== "All" && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2"
              >
                {categoryFilter}
                <button
                  onClick={() => {
                    setCategoryFilter("All");
                    setSearchParams({});
                  }}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <FaTimes className="text-xs" />
                </button>
              </motion.span>
            )}
            {minPrice && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2"
              >
                Min: ₦{parseFloat(minPrice).toLocaleString()}
                <button
                  onClick={() => setMinPrice("")}
                  className="hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <FaTimes className="text-xs" />
                </button>
              </motion.span>
            )}
            {maxPrice && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2"
              >
                Max: ₦{parseFloat(maxPrice).toLocaleString()}
                <button
                  onClick={() => setMaxPrice("")}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <FaTimes className="text-xs" />
                </button>
              </motion.span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAllFilters}
              className="text-sm px-4 py-1.5 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition font-medium inline-flex items-center gap-1"
            >
              <FaTimes className="text-xs" />
              Clear All
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Results Count & Sort (Mobile) */}
      {filtersActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 mt-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-gray-700 font-medium">
              <span className="text-lg">{filteredProducts.length}</span>
              <span className="text-sm ml-1">
                product{filteredProducts.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {/* Mobile Sort */}
            <div className="sm:hidden flex items-center gap-2 w-full sm:w-auto">
              <BiSort className="text-gray-600 text-lg" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-sm"
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      {filtersActive && filteredProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 mt-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {imageErrors[product.id] ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                          <FaImage className="text-4xl sm:text-5xl mb-2" />
                          <span className="text-xs text-gray-500">
                            No image
                          </span>
                        </div>
                      ) : (
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={() => handleImageError(product.id)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}

                      {/* Discount Badge */}
                      {product.original_price &&
                        product.original_price > product.price && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round(
                              ((product.price - product.original_price) /
                                product.price) *
                                100
                            )}
                            % OFF
                          </div>
                        )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-gray-900 font-bold text-base sm:text-lg">
                            {formatCurrency(parseFloat(product.original_price))}
                          </p>
                          {product.original_price &&
                            product.original_price > product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatCurrency(parseFloat(product.price))}
                              </p>
                            )}
                        </div>

                        {product.category && (
                          <p className="text-xs text-blue-600 font-medium">
                            {product.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {filtersActive && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-20 px-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <FaSearchMinus className="text-7xl sm:text-8xl text-gray-300" />
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base mb-6">
            We couldn't find any products matching your criteria
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAllFilters}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Clear All Filters
          </motion.button>
        </motion.div>
      )}

      {/* Empty State */}
      {!filtersActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-20 px-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <FaShoppingBag className="text-7xl sm:text-8xl text-gray-300" />
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Start searching for products
          </h3>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Use the search bar above or apply filters to discover amazing
            products
          </p>
        </motion.div>
      )}

      {/* Floating Filter Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 sm:p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all z-30 group"
        aria-label="Open filters"
      >
        <div className="relative">
          <FaSlidersH className="text-lg sm:text-xl" />
          {(categoryFilter !== "All" || minPrice || maxPrice) && (
            <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </div>
      </motion.button>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={handleModalClose}
        showCloseButton={true}
      >
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FaFilter className="text-gray-600" />
            Filter Products
          </h2>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-base transition-all"
              >
                <option value="All">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Price Range (₦)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) =>
                    handlePriceChange(e.target.value, setMinPrice)
                  }
                  className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) =>
                    handlePriceChange(e.target.value, setMaxPrice)
                  }
                  className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                  min="0"
                />
              </div>
            </div>

            {/* Sort Options in Modal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-base transition-all"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="text-red-600 font-semibold hover:text-red-700 transition py-2 px-4 rounded-lg hover:bg-red-50"
            >
              Reset Filters
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Apply Filters
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Loading Spinner
const Loading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <NavBar showSearchbtn={true} />
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col justify-center items-center py-20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-200 rounded-full border-t-gray-700 mb-4"
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 font-medium text-lg"
        >
          Loading products...
        </motion.span>
      </motion.div>
    </AnimatePresence>
  </div>
);

// Error Display
const ErrorComponent = ({ error }) => {
  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar showSearchbtn={true} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[80vh] px-4"
      >
        <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-md w-full">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <MdError className="text-6xl sm:text-7xl text-red-500" />
          </motion.div>
          <h3 className="font-bold text-xl sm:text-2xl text-red-600 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {error?.message ||
              "Unable to load products. Please try again later."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["products"] })
            }
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium inline-flex items-center gap-2"
          >
            <FaSearch />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchPage;
