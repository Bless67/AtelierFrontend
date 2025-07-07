import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiSearch,
  BiFilter,
  BiGridAlt,
  BiListUl,
  BiErrorCircle,
  BiRefresh,
} from "react-icons/bi";
import { AiOutlineSearch } from "react-icons/ai";
import { MdFilterList, MdGridView, MdViewList } from "react-icons/md";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoRefreshOutline } from "react-icons/io5";
import api from "../utils/api";
import ListCard from "../Layout/ListCard";

const ListItems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchData = async () => {
    const response = await api.get(`products/`);

    return response.data;
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data?.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data?.length / itemsPerPage);

  const handleRetry = () => {
    refetch();
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="my-8 mx-auto container px-4">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="inline-block h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 mb-4"
            role="status"
            aria-label="Loading products"
          />
          <p className="text-lg text-gray-600">Loading amazing products...</p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-20 mx-auto max-w-md"
      >
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <HiOutlineExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6">
            {error?.message ||
              "There was an error fetching products. Please try again."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            disabled={isFetching}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <IoRefreshOutline
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Retrying..." : "Try Again"}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="my-40 text-center"
      >
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AiOutlineSearch className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We're working hard to stock our shelves. Check back soon for amazing
            products!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="my-8 mx-auto container px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Featured Products
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our carefully curated collection of premium products
        </p>
      </motion.div>

      {/* No results found */}
      {data.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center my-20"
        >
          <AiOutlineSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* Products Grid */}
      {data.length > 0 && (
        <>
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, index) => (
                <motion.div
                  key={`${item.id}-${currentPage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                  layout
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl"
                    aria-label={`View details for ${item.name}`}
                  >
                    <ListCard
                      item={item}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                      onWishlist={handleWishlist}
                    />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex justify-center"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

// Skeleton component for loading states
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse border border-gray-100">
    <div className="w-full aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export default ListItems;
