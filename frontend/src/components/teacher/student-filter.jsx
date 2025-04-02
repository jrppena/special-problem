import React, { useState, useEffect } from "react";
import Select from "react-select";

const StudentFilter = ({
  students,
  selectedStudents,
  setSelectedStudents,
  isEnabled,
  filterEnabled,
  setFilterEnabled,
  setHasFilterError
}) => {
  const [error, setError] = useState("");
  
  if (!isEnabled || !students || students.length === 0) return null;

  // Format students for react-select
  const studentOptions = students.map(student => ({
    value: student._id,
    label: `${student.lastName}, ${student.firstName}`
  }));

  // Handle toggle change - separated from the rendering logic
  const handleToggleChange = () => {
    const newFilterEnabled = !filterEnabled;
    setFilterEnabled(newFilterEnabled);
    
    if (!newFilterEnabled) {
      // Select all students when filter is disabled
      setSelectedStudents(students.map(student => student._id));
      setError("");
      setHasFilterError(false);
    } else {
      // Empty selection when filter is enabled
      setSelectedStudents([]);
      setError("Please select at least one student");
      setHasFilterError(true);
    }
  };

  // Handle selection changes
  const handleChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map(option => option.value);
    setSelectedStudents(selectedIds);
    
    if (selectedIds.length === 0) {
      setError("Please select at least one student");
      setHasFilterError(true);
    } else {
      setError("");
      setHasFilterError(false);
    }
  };

  // Calculate selected options once for use in the component
  const selectedOptions = filterEnabled ? 
    studentOptions.filter(option => selectedStudents.includes(option.value)) : 
    [];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-2">
        <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={filterEnabled}
            onChange={handleToggleChange}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">Enable student filtering</span>
        </label>
      </div>
      
      {filterEnabled && (
        <>
          <Select
            isMulti
            name="students"
            options={studentOptions}
            value={selectedOptions}
            onChange={handleChange}
            className={`basic-multi-select ${error ? 'border-red-500' : ''}`}
            classNamePrefix="select"
            placeholder="Select students..."
            noOptionsMessage={() => "No students found"}
            closeMenuOnSelect={false}
            isClearable={false}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </>
      )}
      
      {!filterEnabled && (
        <p className="text-sm text-gray-500 italic">All students selected ({students.length})</p>
      )}
    </div>
  );
};

export default StudentFilter;