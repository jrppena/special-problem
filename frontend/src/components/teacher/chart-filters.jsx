import React, { useEffect, useState } from "react";
import Dropdown from "../drop-down";
import StudentFilter from "./student-filter";

const ChartFilters = ({
  schoolYears,
  selectedSchoolYear,
  setSelectedSchoolYear,
  setChartType,
  dataTypeOptions,
  dataType,
  setDataType,
  assignedClasses,
  selectedSubject,
  setSelectedSubject,
  selectedSection,
  setSelectedSection,
  quarterOptions,
  selectedQuarter,
  setSelectedQuarter,
  selectedStudents,
  setSelectedStudents,
  generateChartData
}) => {
  const [studentFilterEnabled, setStudentFilterEnabled] = useState(false);
  const [hasFilterError, setHasFilterError] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (assignedClasses.length > 0 && !selectedSubject) {
      setSelectedSubject(assignedClasses[0]);
    }
  }, [assignedClasses, selectedSubject, setSelectedSubject]);

  useEffect(() => {
    if (selectedSubject?.sections && selectedSubject.sections.length > 0 && !selectedSection) {
      setSelectedSection(selectedSubject.sections[0]);
    }
  }, [selectedSubject, selectedSection, setSelectedSection]);

  // Auto-select best chart type based on data selection
  useEffect(() => {
    if (dataType && selectedQuarter) {
      // Choose the best chart type based on data type and quarter selection
      if (dataType === "singleSectionPerformance" && selectedQuarter === "all") {
        // Line chart is best for showing performance trends over time for a single section
        setChartType("line");
      } else if (dataType === "sectionsPerformance" && selectedQuarter === "all") {
        // Area chart is good for comparing multiple sections across all quarters
        setChartType("area");
      } else if (dataType === "sectionsPerformance" && selectedQuarter !== "all") {
        // Bar chart is best for comparing sections in a specific quarter
        setChartType("bar");
      } else if (dataType === "singleSectionPerformance" && selectedQuarter !== "all") {
        // For single section in a specific quarter, bar chart works well
        setChartType("bar");
      }
    }
  }, [dataType, selectedQuarter, setChartType]);

  const handleDataTypeChange = (newDataType) => {
    const selected = dataTypeOptions.find((option) => option.label === newDataType);
    if (selected) {
      setDataType(selected.value);
      if (selected.value === "sectionsPerformance") {
        setSelectedSection(null);
        setStudentFilterEnabled(false);
      } else if (selected.value === "singleSectionPerformance" && selectedSubject?.sections?.length > 0) {
        setSelectedSection(selectedSubject.sections[0]);
      }
    }
  };

  // Handle chart generation with validation
  const handleGenerateChart = () => {
    setValidationError("");
    
    // Validate that students are selected if student filtering is enabled
    if (dataType === "singleSectionPerformance" && 
        selectedQuarter === "all" && 
        studentFilterEnabled && 
        (!selectedStudents || selectedStudents.length === 0)) {
      setValidationError("Please select at least one student before generating chart");
      return;
    }
    
    // Call the actual generate chart function
    generateChartData();
  };

  // Check if student filter should be displayed
  const showStudentFilter = dataType === "singleSectionPerformance" && 
                           selectedQuarter === "all" && 
                           selectedSection && 
                           selectedSection.students && 
                           selectedSection.students.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-5">
      <h3 className="text-xl font-semibold mb-4">Chart Options</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Dropdown
          label="School Year"
          options={schoolYears.map((year) => year.name)}
          selected={selectedSchoolYear}
          setSelected={setSelectedSchoolYear}
        />
        <Dropdown
          label="Data Visualization"
          options={dataTypeOptions.map((option) => option.label)}
          selected={dataTypeOptions.find((option) => option.value === dataType)?.label}
          setSelected={handleDataTypeChange}
        />
        <Dropdown
          label="Subject"
          options={assignedClasses.map((c) => `${c.subjectName} - Grade ${c.gradeLevel}`)}
          selected={selectedSubject ? `${selectedSubject.subjectName} - Grade ${selectedSubject.gradeLevel}` : ""}
          setSelected={(label) => {
            const selected = assignedClasses.find(
              (c) => `${c.subjectName} - Grade ${c.gradeLevel}` === label
            );
            if (selected) {
              setSelectedSubject(selected);
              if (dataType === "singleSectionPerformance" && selected.sections && selected.sections.length > 0) {
                setSelectedSection(selected.sections[0]);
              }
            }
          }}
        />
        {dataType === "singleSectionPerformance" && selectedSubject && selectedSubject.sections && (
          <Dropdown
            label="Section"
            options={selectedSubject.sections.map((s) => `${s.gradeLevel}-${s.name}`)}
            selected={selectedSection ? `${selectedSection.gradeLevel}-${selectedSection.name}` : ""}
            setSelected={(formattedName) => {
              const [gradeLevel, sectionName] = formattedName.split("-");
              const selected = selectedSubject.sections.find(
                (s) => s.gradeLevel == gradeLevel && s.name === sectionName
              );
              if (selected) {
                setSelectedSection(selected);
              }
            }}
          />
        )}
        <Dropdown
          label="Quarter"
          options={quarterOptions.map((q) => q.label)}
          selected={quarterOptions.find((q) => q.value === selectedQuarter)?.label}
          setSelected={(label) => {
            const selected = quarterOptions.find((q) => q.label === label);
            if (selected) setSelectedQuarter(selected.value);
          }}
        />
        
        {/* Show student filter only when appropriate */}
        {showStudentFilter && (
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Students
            </label>
            <StudentFilter
              students={selectedSection.students}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              isEnabled={true}
              filterEnabled={studentFilterEnabled}
              setFilterEnabled={setStudentFilterEnabled}
              setHasFilterError={setHasFilterError}
            />
          </div>
        )}
      </div>
      
      {validationError && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
          {validationError}
        </div>
      )}
      
      <button
        onClick={handleGenerateChart}
        disabled={hasFilterError}
        className={`font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${
          hasFilterError 
            ? 'bg-gray-400 cursor-not-allowed text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Generate Chart
      </button>
    </div>
  );
};

export default ChartFilters;