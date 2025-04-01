import React from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

const Pagination = ({ 
  totalItems,
  itemsPerPage,
  currentPage, 
  setCurrentPage,
  showAllOption = true,
  isShowingAll,
  setIsShowingAll
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleShowAll = () => {
    setIsShowingAll(!isShowingAll);
    // Reset to page 1 when toggling show all
    if (isShowingAll) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Create page number buttons
  const renderPageNumbers = () => {
    // Create array of page numbers to show
    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate which page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if end is at max
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          disabled={isShowingAll}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // If there's no data or only 1 page, don't show pagination control (but still render children)
  if (totalItems === 0 || (totalPages <= 1 && !showAllOption)) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-white rounded-lg shadow">
      <div className="text-sm text-gray-600 mb-2 sm:mb-0">
        Showing {isShowingAll ? 
          `all ${totalItems}` : 
          `${Math.min(itemsPerPage, totalItems - (currentPage - 1) * itemsPerPage)} of ${totalItems}`
        } items
      </div>
      
      <div className="flex items-center space-x-1">
        {showAllOption && (
          <button
            onClick={handleShowAll}
            className="flex items-center gap-1 px-4 py-1 mr-4 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
          >
            <List className="w-4 h-4" />
            {isShowingAll ? "Show Paged" : "Show All"}
          </button>
        )}
        
        {!isShowingAll && totalPages > 1 && (
          <>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {renderPageNumbers()}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagination;