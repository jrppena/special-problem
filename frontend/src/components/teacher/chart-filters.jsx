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

  const handleDataTypeChange = (newDataType) => {
    const selected = dataTypeOptions.find((option) => option.label === newDataType);
    if (selected) {
      setDataType(selected.value);
      if (selected.value === "sectionsPerformance") {
        setSelectedSection(null);
      } else if (selected.value === "singleSectionPerformance" && selectedSubject?.sections?.length > 0) {
        setSelectedSection(selectedSubject.sections[0]);
      }
    }
  };

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
          label="Chart Type"
          options={chartTypes.map((type) => type.label)}
          selected={chartTypes.find((type) => type.value === chartType)?.label}
          setSelected={(label) => {
            const selected = chartTypes.find((type) => type.label === label);
            if (selected) setChartType(selected.value);
          }}
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
