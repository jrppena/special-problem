import React, { useState } from "react";

const EnrolledStudentsFilter = ({ selected, setSelected }) => {
  const [minStudents, setMinStudents] = useState(0);
  const [maxStudents, setMaxStudents] = useState(100);

  const handleChange = (value) => {
    if (value === "No Filter") {
      setSelected(value); // Set "No Filter" as selected value
      setMinStudents("");  // Reset min and max
      setMaxStudents("");
    } else {
      setSelected(value); // Set the selected filter
    }
  };

  return (
    <div className="flex flex-col w-auto mb-4">
      <label className="text-sm font-medium text-gray-700 mb-1">Enrolled Students</label>

      {/* Dropdown for No Filter or Filter */}
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="No Filter">No Filter</option>
        <option value="Min-Max">Min-Max Range</option>
        {/* Add more filter options here if necessary */}
      </select>

      {/* Conditional Min and Max Inputs */}
      {selected === "Min-Max" && (
        <div className="mt-2">
          <div className="flex space-x-4">
            <input
              type="number"
              value={minStudents}
              onChange={(e) => setMinStudents(e.target.value)}
              placeholder="Min"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              placeholder="Max"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledStudentsFilter;
