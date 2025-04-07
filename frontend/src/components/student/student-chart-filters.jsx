import React, { useEffect } from "react";
import Dropdown from "../drop-down";
import ChartToolTip from "./student-chart-tooltip";

const ChartFilters = ({
  schoolYears,
  selectedSchoolYear,
  setSelectedSchoolYear,
  chartType,
  setChartType,
  dataTypeOptions,
  dataType,
  setDataType,
  classes,
  selectedSubject,
  setSelectedSubject,
  selectedQuarter,
  setSelectedQuarter,
  generateChartData
}) => {
  // Create class options for dropdown
  const classOptions = classes.length > 0
    ? classes.map((c) => ({ value: c._id, label: c.subjectName }))
    : [];
    
  // Quarter options
  const quarterOptions = [
    { value: "Q1", label: "Quarter 1" },
    { value: "Q2", label: "Quarter 2" },
    { value: "Q3", label: "Quarter 3" },
    { value: "Q4", label: "Quarter 4" },
  ];

  // Set default subject when classes change
  useEffect(() => {
    if (classes.length > 0 && (!selectedSubject || selectedSubject === "all")) {
      setSelectedSubject(classes[0]._id);
    }
  }, [classes, selectedSubject, setSelectedSubject]);

  // Auto-select the most appropriate chart type based on data visualization type
  useEffect(() => {
    if (dataType === "singleSubjectAcrossQuarters") {
      setChartType("line"); // Line chart is best for tracking a single subject over time
    } else if (dataType === "subjectsAcrossQuarters") {
      setChartType("line"); // Line chart works well for comparing multiple subjects over time
    } else if (dataType === "subjectsInOneQuarter") {
      setChartType("bar"); // Bar chart is ideal for comparing subjects in a single quarter
    }
  }, [dataType, setChartType]);

  // Handle data type change
  const handleDataTypeChange = (newDataType) => {
    const selected = dataTypeOptions.find((option) => option.label === newDataType);
    if (selected) {
      setDataType(selected.value);
      
      // Set appropriate defaults based on data type
      if (selected.value === "singleSubjectAcrossQuarters") {
        // Set first subject as default if none selected
        if (classes.length > 0 && (!selectedSubject || selectedSubject === "all")) {
          setSelectedSubject(classes[0]._id);
        }
      }
      
      if (selected.value === "subjectsInOneQuarter" && !selectedQuarter) {
        setSelectedQuarter("Q1");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-5">
      <h3 className="text-xl font-semibold mb-4">Chart Options</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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

        {dataType === "singleSubjectAcrossQuarters" && classes.length > 0 && (
          <Dropdown
            label="Subject"
            options={classOptions.map((c) => c.label)}
            selected={
              classOptions.find((c) => c.value === selectedSubject)?.label || 
              (classOptions.length > 0 ? classOptions[0].label : "")
            }
            setSelected={(label) => {
              const selected = classOptions.find((c) => c.label === label);
              if (selected) setSelectedSubject(selected.value);
            }}
          />
        )}

        {dataType === "subjectsInOneQuarter" && (
          <Dropdown
            label="Quarter"
            options={quarterOptions.map((q) => q.label)}
            selected={quarterOptions.find((q) => q.value === selectedQuarter)?.label}
            setSelected={(label) => {
              const selected = quarterOptions.find((q) => q.label === label);
              if (selected) setSelectedQuarter(selected.value);
            }}
          />
        )}
      </div>
      
      <ChartToolTip 
        chartType={chartType} 
        dataType={dataType} 
        selectedQuarter={selectedQuarter} 
      />
      
      <div className="mt-4">
        <button
          onClick={generateChartData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
        >
          Generate Chart
        </button>
      </div>
    </div>
  );
};

export default ChartFilters;