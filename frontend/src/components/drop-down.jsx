import React from "react";

const Dropdown = ({ label, options, selected, setSelected, getOptionValue, getOptionLabel }) => {

  return (
    <div className="flex flex-col w-auto">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Dropdown */}
      <select
        value={getOptionValue ? getOptionValue(selected) : selected}
        onChange={(e) => {
          const selectedOption = options.find(option =>
            getOptionValue ? getOptionValue(option) === e.target.value : option === e.target.value
          );
          setSelected(selectedOption);
        }}
        className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => {
          const value = getOptionValue ? getOptionValue(option) : option;
          const label = getOptionLabel ? getOptionLabel(option) : option;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

    </div>
  );
};

export default Dropdown;
