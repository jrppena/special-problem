import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import ChartFilters from "../../components/teacher/chart-filters";
import GradeChart from "../../components/teacher/grade-chart";
import TeacherChartAnalysis from "../../components/teacher/chart-analysis";
import ChartToolTip from "../../components/teacher/chart-tool-tip";

import NoDataDisplay from "../../components/student/no-data-display";

import { useTeacherStore } from "../../store/useTeacherStore";
import { useAuthStore } from "../../store/useAuthStore";
import { schoolYears } from "../../constants";

const TeacherGradeTrendsPage = () => {
  // Store functions and state
  const { assignedClasses, getAssignedClasses, getChartData } = useTeacherStore();
  const { authUser } = useAuthStore();

  // State variables for filters
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(schoolYears[0].name);
  const [chartType, setChartType] = useState("line"); // Default chart type
  const [dataType, setDataType] = useState("singleSectionPerformance");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  
  // State variables for display data - these will only update after Generate Chart is clicked
  const [displayChartType, setDisplayChartType] = useState("line");
  const [displayDataType, setDisplayDataType] = useState("singleSectionPerformance");
  const [displaySubject, setDisplaySubject] = useState(null);
  const [displaySection, setDisplaySection] = useState(null);
  const [displayQuarter, setDisplayQuarter] = useState("all");
  
  const [chartData, setChartData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isChartGenerating, setIsChartGenerating] = useState(false);

  // Data type options
  const dataTypeOptions = [
    { value: "singleSectionPerformance", label: "Single Section Performance" },
    { value: "sectionsPerformance", label: "All Sections Performance" },
  ];

  // Quarter options
  const quarterOptions = [
    { value: "all", label: "All Quarters" },
    { value: "Q1", label: "Quarter 1" },
    { value: "Q2", label: "Quarter 2" },
    { value: "Q3", label: "Quarter 3" },
    { value: "Q4", label: "Quarter 4" },
  ];

  // Fetch assigned classes on mount or when school year changes
  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        setIsDataLoaded(false);
        await getAssignedClasses(authUser._id, selectedSchoolYear);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching assigned classes: ", error);
        setIsDataLoaded(true);
      }
    };

    fetchAssignedClasses();
  }, [selectedSchoolYear, authUser._id, getAssignedClasses]);

  // Update subject and section when assigned classes change
  useEffect(() => {
    if (assignedClasses.length > 0) {
      const defaultClass = assignedClasses[0];
      setSelectedSubject(defaultClass);
      if (defaultClass.sections && defaultClass.sections.length > 0) {
        setSelectedSection(defaultClass.sections[0]);
      } else {
        setSelectedSection(null);
      }
    } else {
      setSelectedSubject(null);
      setSelectedSection(null);
    }
  }, [assignedClasses]);

  // Auto-select best chart type based on data selection
  // This only affects the filter state, not what's displayed
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
  }, [dataType, selectedQuarter]);

  // Generate chart data using the backend
  const generateChartData = async () => {
    setChartData([]);
    setIsChartGenerating(true);

    if (!isDataLoaded || !selectedSubject) {
      setIsChartGenerating(false);
      return;
    }
    
    try {
      let response;
      if (dataType === "singleSectionPerformance") {
        if (!selectedSection) {
          console.warn("No section selected for single section view");
          setChartData([]);
          setIsChartGenerating(false);
          return;
        }
        response = await getChartData(
          selectedSubject._id,
          selectedQuarter,
          selectedSection,
          dataType
        );
      } else if (dataType === "sectionsPerformance") {
        response = await getChartData(
          selectedSubject._id,
          selectedQuarter,
          null,
          dataType
        );
      }
  
      if (!response || response.length === 0) {
        setChartData([]);
        setIsChartGenerating(false);
        return;
      }
  
      setChartData(response);
      
      // Update display states only after successful data fetch
      setDisplayChartType(chartType);
      setDisplayDataType(dataType);
      setDisplaySubject(selectedSubject);
      setDisplaySection(selectedSection);
      setDisplayQuarter(selectedQuarter);
      
    } catch (error) {
      console.error("Error generating chart data: ", error);
      setChartData([]);
    } finally {
      setIsChartGenerating(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <PageHeader title="Grade Trends" />
        
        <ChartFilters 
          schoolYears={schoolYears}
          selectedSchoolYear={selectedSchoolYear}
          setSelectedSchoolYear={setSelectedSchoolYear}
          setChartType={setChartType}
          dataTypeOptions={dataTypeOptions}
          dataType={dataType}
          setDataType={setDataType}
          assignedClasses={assignedClasses}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          quarterOptions={quarterOptions}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          generateChartData={generateChartData}
        />

        {isChartGenerating ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 flex justify-center items-center h-96">
            <div className="text-lg font-medium">Generating Chart...</div>
          </div>
        ) : isDataLoaded && assignedClasses.length === 0 ? (
          <NoDataDisplay message="You have no assigned classes for the selected school year." />
        ) : (
          chartData.length > 0 && (
            <>
            <div className="bg-white p-6 rounded-lg shadow mt-5">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {displaySubject?.subjectName} 
                  {displayDataType === "singleSectionPerformance" && displaySection && 
                    ` - ${displaySection.gradeLevel}-${displaySection.name}`
                  }
                  {displayQuarter !== "all" && ` (${quarterOptions.find(q => q.value === displayQuarter)?.label})`}
                </h3>
              </div>
              
              <ChartToolTip 
                chartType={displayChartType}
                dataType={displayDataType}
                selectedQuarter={displayQuarter}
              />
              
              <div className="h-96">
                <GradeChart 
                  chartType={displayChartType} 
                  data={chartData} 
                  dataType={displayDataType}
                />
              </div>
            </div>
            
            <TeacherChartAnalysis 
              chartData={chartData}
              dataType={displayDataType}
              selectedQuarter={displayQuarter}
              chartType={displayChartType}
            />
          </>
          )
        )}
      </div>
    </div>
  );
};

export default TeacherGradeTrendsPage;