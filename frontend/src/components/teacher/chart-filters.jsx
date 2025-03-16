import React, { useEffect } from "react";
import Dropdown from "../drop-down";

const ChartFilters = ({
  schoolYears,
  selectedSchoolYear,
  setSelectedSchoolYear,
  chartTypes,
  chartType,
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
  generateChartData
}) => {
  // Set default subject when assigned classes change
  useEffect(() => {
    if (assignedClasses.length > 0 && !selectedSubject) {
      setSelectedSubject(assignedClasses[0]);
    }
  }, [assignedClasses, selectedSubject, setSelectedSubject]);

  // Set default section when subject changes
  useEffect(() => {
    if (selectedSubject?.sections && selectedSubject.sections.length > 0 && !selectedSection) {
      setSelectedSection(selectedSubject.sections[0]);
    }
  }, [selectedSubject, selectedSection, setSelectedSection]);

  // Handle data type change
  const handleDataTypeChange = (newDataType) => {
    const selected = dataTypeOptions.find((option) => option.label === newDataType);
    if (selected) {
      setDataType(selected.value);
      
      // Reset section if switching to sections performance
      if (selected.value === "sectionsPerformance") {
        setSelectedSection(null);
      } else if (selected.value === "singleSectionPerformance" && selectedSubject?.sections?.length > 0) {
        // Set default section when switching to single section
        setSelectedSection(selectedSubject.sections[0]);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-5">
      <h3 className="text-xl font-semibold mb-4">Chart Options</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* School Year Filter */}
        <Dropdown
          label="School Year"
          options={schoolYears.map((year) => year.name)}
          selected={selectedSchoolYear}
          setSelected={setSelectedSchoolYear}
        />

        {/* Chart Type Filter */}
        <Dropdown
          label="Chart Type"
          options={chartTypes.map((type) => type.label)}
          selected={chartTypes.find((type) => type.value === chartType)?.label}
          setSelected={(label) => {
            const selected = chartTypes.find((type) => type.label === label);
            if (selected) setChartType(selected.value);
          }}
        />

        {/* Data Visualization Type Filter */}
        <Dropdown
          label="Data Visualization"
          options={dataTypeOptions.map((option) => option.label)}
          selected={dataTypeOptions.find((option) => option.value === dataType)?.label}
          setSelected={handleDataTypeChange}
        />

        {/* Subject Filter - Always visible */}
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
              
              // Update section when subject changes
              if (dataType === "singleSectionPerformance" && selected.sections && selected.sections.length > 0) {
                setSelectedSection(selected.sections[0]);
              }
            }
          }}
        />

        {/* Section Filter - Only visible for single section performance */}
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

        {/* Quarter Filter */}
        <Dropdown
          label="Quarter"
          options={quarterOptions.map((q) => q.label)}
          selected={quarterOptions.find((q) => q.value === selectedQuarter)?.label}
          setSelected={(label) => {
            const selected = quarterOptions.find((q) => q.label === label);
            if (selected) setSelectedQuarter(selected.value);
          }}
        />
      </div>
      
      <button
        onClick={generateChartData}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
      >
        Generate Chart
      </button>
    </div>
  );
};

export default ChartFilters;