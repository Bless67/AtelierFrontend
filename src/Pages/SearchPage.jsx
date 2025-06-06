import { FaSearch, FaFilter } from "react-icons/fa";
import NavBar from "../Layout/NavBar";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import Modal from "../Layout/Modal";
import { Link, useSearchParams } from "react-router-dom";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
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

  const filtersActive =
    searchValue.trim() || categoryFilter !== "All" || minPrice || maxPrice;

  const filteredProducts =
    filtersActive &&
    products.filter((product) => {
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

  const reset = () => {
    setCategoryFilter("All");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleModalClose = () => {
    reset();
    setShowFilterModal(false);
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
            className="w-full pl-12 pr-4 py-3 border rounded-full shadow-sm"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
        </div>
      </div>

      {/* Clear Filters Button */}
      {filtersActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-4"
        >
          <button
            onClick={() => {
              setSearchValue("");
              reset();
            }}
            className="text-sm px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}

      {/* Products Grid */}
      {filtersActive && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10 px-6">
          <AnimatePresence>
            {filteredProducts?.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
              >
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-500">₦{product.price}</p>
                  <p className="text-sm text-blue-500">{product.category}</p>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Results */}
      {filtersActive && filteredProducts?.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No products found.</p>
      )}

      {/* Floating Filter Button */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition cursor-pointer"
      >
        <FaFilter />
      </button>

      {/* Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={handleModalClose}
        showCloseButton={true}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Filter Products</h2>

          <div className="space-y-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 rounded-lg border"
            >
              <option value="All">All Categories</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2 rounded-lg border"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2 rounded-lg border"
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={reset} className="text-red-500 font-medium">
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Loading Spinner
const Loading = () => (
  <div className="flex justify-center items-center min-h-[300px]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700"></div>
  </div>
);

// Error Display
const ErrorComponent = () => (
  <div className="text-center font-bold text-2xl text-red-500 mt-20">
    Error fetching products.
  </div>
);

export default SearchPage;
