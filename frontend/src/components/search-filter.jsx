import React from 'react';

const SearchFilter = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col w-auto mb-4">
      {/* Label */}
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}

      {/* Search Input */}
      <input
        type="text"
        className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
      />
    </div>
  );
};

export default SearchFilter;
