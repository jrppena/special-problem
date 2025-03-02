import React from "react";

const Dropdown = ({ label, options, selected, setSelected }) => {
  return (
    <div className="flex flex-col w-auto">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Dropdown */}
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
