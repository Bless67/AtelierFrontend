import { FaSearch, FaFilter } from "react-icons/fa";
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

  useEffect(() => {
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const fetchData = async () => {
    const response = await api.get(`products/`);
    return response.data;
  };

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000,
  });

  // Memoized filter logic for better performance
  const filteredProducts = useMemo(() => {
    if (
      !searchValue.trim() &&
      categoryFilter === "All" &&
      !minPrice &&
      !maxPrice
    ) {
      return []; // Show nothing when no filters are active
    }

    return products.filter((product) => {
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
  }, [products, searchValue, categoryFilter, minPrice, maxPrice]);

  const filtersActive =
    searchValue.trim() || categoryFilter !== "All" || minPrice || maxPrice;

  const reset = () => {
    setCategoryFilter("All");
    setMinPrice("");
    setMaxPrice("");
    // Update URL to remove category parameter
    if (categoryFromUrl) {
      setSearchParams({});
    }
  };

  const handleModalClose = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    // Update URL with current category filter
    if (categoryFilter !== "All") {
      setSearchParams({ category: categoryFilter });
    } else {
      setSearchParams({});
    }
  };

  const handleClearAllFilters = () => {
    setSearchValue("");
    reset();
  };

  // Input validation for price fields
  const handlePriceChange = (value, setter) => {
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <ErrorComponent />;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <NavBar showSearchbtn={true} />

      {/* Search Input */}
      <div className="flex justify-center mt-6 px-4">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
        </div>
      </div>

      {/* Active Filters Display */}
      {filtersActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mt-4 px-4"
        >
          {searchValue.trim() && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Search: "{searchValue}"
            </span>
          )}
          {categoryFilter !== "All" && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Category: {categoryFilter}
            </span>
          )}
          {minPrice && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Min: ₦{minPrice}
            </span>
          )}
          {maxPrice && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              Max: ₦{maxPrice}
            </span>
          )}
          <button
            onClick={handleClearAllFilters}
            className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition"
          >
            Clear All
          </button>
        </motion.div>
      )}

      {/* Results Count */}
      {filtersActive && (
        <div className="text-center mt-4 text-gray-600">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* Products Grid */}
      {filtersActive && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6 px-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow group"
              >
                <Link to={`/product/${product.id}`} className="block">
                  {product.image && (
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-900 font-bold text-lg">
                    ₦{parseFloat(product.price).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {product.category}
                  </p>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Results */}
      {filtersActive && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400 text-sm mb-6">
            Try adjusting your search criteria
          </p>
          <button
            onClick={handleClearAllFilters}
            className="bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-900 transition"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Empty State - Show when no filters are active */}
      {!filtersActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-500 text-lg mb-2">
            Start searching for products
          </p>
          <p className="text-gray-400 text-sm">
            Use the search bar or filters to find what you're looking for
          </p>
        </motion.div>
      )}

      {/* Floating Filter Button */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-900 hover:scale-105 transition-all cursor-pointer z-10"
        aria-label="Open filters"
      >
        <FaFilter />
      </button>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={handleModalClose}
        showCloseButton={true}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Filter Products
          </h2>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="All">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) =>
                    handlePriceChange(e.target.value, setMaxPrice)
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={reset}
              className="text-red-600 font-medium hover:text-red-700 transition"
            >
              Reset Filters
            </button>
            <button
              onClick={handleApplyFilters}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition cursor-pointer"
            >
              Apply Filters
            </button>
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
        className="flex justify-center items-center py-16"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-gray-700"
        />
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="ml-3 text-gray-600"
        >
          Loading products...
        </motion.span>
      </motion.div>
    </AnimatePresence>
  </div>
);

// Error Display
const ErrorComponent = () => {
  const queryClient = useQueryClient();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar showSearchbtn={true} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[80vh]"
      >
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="font-bold text-xl text-red-600 mb-2">
            Oops! Something went wrong
          </p>
          <p className="text-gray-500">
            Unable to load products. Please try again later.
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["products"] })
            }
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 mt-2"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchPage;
