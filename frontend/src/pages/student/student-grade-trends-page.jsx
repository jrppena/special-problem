import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import ChartFilters from "../../components/student/student-chart-filters";
import GradeChart from "../../components/student/student-grade-chart";
import NoDataDisplay from "../../components/student/no-data-display";
import StudentChartAnalysis from "../../components/student/student-chart-analysis";
import { useStudentStore } from "../../store/useStudentStore";
import { useAuthStore } from "../../store/useAuthStore";

const StudentGradeTrendsPage = () => {
  // Store data
  const { classes, getEnrolledClasses, getChartData, chartData, isChartDataLoading } = useStudentStore();
  const { authUser } = useAuthStore();

  // State variables
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2024-2025");
  const [chartType, setChartType] = useState("line");
  const [dataType, setDataType] = useState("subjectsAcrossQuarters");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // School year options
  const schoolYears = [
    { name: "2024-2025" },
    { name: "2023-2024" },
    { name: "2022-2023" },
    { name: "2021-2022" },
  ];

  // Data type options with clearer labels
  const dataTypeOptions = [
    { value: "singleSubjectAcrossQuarters", label: "Single Subject Performance Over Time" },
    { value: "subjectsAcrossQuarters", label: "Compare Subjects Across All Quarters" },
    { value: "subjectsInOneQuarter", label: "Compare Subjects in One Quarter" },
  ];

  // Set default subject when classes are loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedSubject) {
      setSelectedSubject(classes[0]._id);
    }
  }, [classes, selectedSubject]);

  // Fetch initial classes data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsDataLoaded(false);
        await getEnrolledClasses(authUser._id, selectedSchoolYear);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching classes: ", error);
        setIsDataLoaded(true);
      }
    };

    fetchClasses();
  }, [selectedSchoolYear, authUser._id, getEnrolledClasses]);

  // Fetch chart data whenever filters change
  useEffect(() => {
    fetchChartData();
  }, [selectedSchoolYear, dataType, selectedSubject, selectedQuarter, classes]);

  // Function to fetch chart data from backend
  const fetchChartData = async () => {
    if (!authUser._id || classes.length === 0) return;
    
    await getChartData(
      authUser._id,
      selectedSchoolYear,
      dataType,
      selectedSubject,
      selectedQuarter
    );
  };

  // Function to handle filter changes and reload data
  const handleFilterChange = () => {
    fetchChartData();
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
          chartType={chartType}
          setChartType={setChartType}
          dataTypeOptions={dataTypeOptions}
          dataType={dataType}
          setDataType={setDataType}
          classes={classes}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          generateChartData={handleFilterChange}
        />

        {isDataLoaded && classes.length === 0 ? (
          <NoDataDisplay message="You are not enrolled in any classes for the selected school year." />
        ) : isChartDataLoading ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 flex justify-center items-center h-96">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          chartData.length > 0 && (
            <div className="space-y-5">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">
                  {dataType === "singleSubjectAcrossQuarters" 
                    ? "Subject Performance Over Time" 
                    : dataType === "subjectsAcrossQuarters" 
                      ? "Comparing All Subjects Across Quarters" 
                      : `Subject Comparison for ${selectedQuarter}`}
                </h3>
                <div className="h-96">
                  <GradeChart 
                    chartType={chartType} 
                    data={chartData} 
                    dataType={dataType}
                  />
                </div>
              </div>
              <StudentChartAnalysis 
                chartData={chartData}
                dataType={dataType}
                selectedQuarter={selectedQuarter}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentGradeTrendsPage;