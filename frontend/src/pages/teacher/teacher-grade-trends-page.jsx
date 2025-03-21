import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import ChartFilters from "../../components/teacher/chart-filters";
import GradeChart from "../../components/teacher/grade-chart";
import TeacherChartAnalysis from "../../components/teacher/chart-analysis";
import NoDataDisplay from "../../components/student/no-data-display";

import { useTeacherStore } from "../../store/useTeacherStore";
import { useAuthStore } from "../../store/useAuthStore";
import { schoolYears } from "../../constants";

const TeacherGradeTrendsPage = () => {
  // Store functions and state
  const { assignedClasses, getAssignedClasses, getChartData } = useTeacherStore();
  const { authUser } = useAuthStore();

  // State variables
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(schoolYears[0].name);
  const [chartType, setChartType] = useState("line");
  const [dataType, setDataType] = useState("singleSectionPerformance");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [chartData, setChartData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isChartGenerating, setIsChartGenerating] = useState(false);
  const [showChartGuide, setShowChartGuide] = useState(false); // New state to toggle chart guide

  // Chart type options
  const chartTypes = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "area", label: "Area Chart" },
    { value: "radar", label: "Radar Chart" },
  ];

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

  // Show chart guide when chart type changes
  useEffect(() => {
    if (chartData.length > 0) {
      setShowChartGuide(true);
    }
  }, [chartType, chartData]);

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
    } catch (error) {
      console.error("Error generating chart data: ", error);
      setChartData([]);
    } finally {
      setIsChartGenerating(false);
    }
  };

  // Toggle chart guide
  const toggleChartGuide = () => {
    setShowChartGuide(!showChartGuide);
  };

  // Check if radar chart is compatible with the data
  const isRadarCompatible = () => {
    if (!chartData || chartData.length === 0) return true;
    
    if (chartType === "radar" && dataType === "sectionsPerformance") {
      // Get available quarters in the data
      const quarters = Object.keys(chartData[0]).filter(key => 
        key !== "name" && key.startsWith("Q")
      );
      if (quarters.length <= 1) {
        return false;
      }
    }else if(chartType === "radar" && dataType === "singleSectionPerformance"){
      // Simply check if we have more than one quarter in the data array
      if (chartData[0].name != "Q1" && chartData[1].name != "Q2" && chartData[2].name != "Q3" && chartData[3].name != "Q4")  {
        return false;
      }
    }

    return true;
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
          chartTypes={chartTypes}
          chartType={chartType}
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
              <div className="h-96 ">
                <GradeChart 
                  chartType={chartType} 
                  data={chartData} 
                  dataType={dataType}
                />
              </div>
              
              {/* Only show chart analysis if the radar chart is compatible or a different chart type is selected */}
              {isRadarCompatible() && (
                <TeacherChartAnalysis 
                  chartData={chartData}
                  dataType={dataType}
                  selectedQuarter={selectedQuarter}
                />
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default TeacherGradeTrendsPage;