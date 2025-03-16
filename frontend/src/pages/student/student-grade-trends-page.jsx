import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import ChartFilters from "../../components/student/chart-filters";
import GradeChart from "../../components/student/grade-chart";
import NoDataDisplay from "../../components/student/no-data-display";

import { useStudentStore } from "../../store/useStudentStore";
import { useAuthStore } from "../../store/useAuthStore";

const StudentGradeTrendsPage = () => {
  // Store data
  const { classes, getEnrolledClasses, getEnrolledClassesGrades, grades } = useStudentStore();
  const { authUser } = useAuthStore();

  // State variables
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2024-2025");
  const [chartType, setChartType] = useState("line");
  const [dataType, setDataType] = useState("subjectsAcrossQuarters");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [chartData, setChartData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // School year options
  const schoolYears = [
    { name: "2024-2025" },
    { name: "2023-2024" },
    { name: "2022-2023" },
    { name: "2021-2022" },
  ];

  // Chart type options
  const chartTypes = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "area", label: "Area Chart" },
    { value: "radar", label: "Radar Chart" },
  ];

  // Data type options
  const dataTypeOptions = [
    { value: "singleSubjectAcrossQuarters", label: "Single Subject Across 4 Quarters" },
    { value: "subjectsAcrossQuarters", label: "Different Subjects Across 4 Quarters" },
    { value: "subjectsInOneQuarter", label: "Different Subjects in 1 Quarter" },
  ];

  // Set default subject when classes are loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedSubject) {
      setSelectedSubject(classes[0]._id);
    }
  }, [classes, selectedSubject]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoaded(false);
        // First get enrolled classes
        const updatedClasses = await getEnrolledClasses(authUser._id, selectedSchoolYear);

        // Check if updatedClasses is valid (not null, undefined, or empty)
        if (updatedClasses && updatedClasses.length > 0) {
          // Then get grades using the updated classes
          await getEnrolledClassesGrades(updatedClasses, authUser._id, selectedSchoolYear);
        }
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [selectedSchoolYear, authUser._id, getEnrolledClasses, getEnrolledClassesGrades]);

  // Generate chart data based on filters
  const generateChartData = () => {
    if (!grades || grades.length === 0) return;

    let processedData = [];

    switch (dataType) {
      case "singleSubjectAcrossQuarters":
        // Check if we have a valid subject selected
        if (!selectedSubject) {
          console.warn("No subject selected for single subject view");
          return;
        }
        
        // Filter for the selected subject
        const subjectData = grades.filter(grade => grade.classId === selectedSubject);
        
        if (subjectData.length === 0) {
          console.warn("No data found for selected subject");
          return;
        }
        
        // Create data for the selected subject across all quarters
        processedData = [
          {
            name: "Q1",
            [subjectData[0].className]: parseFloat(subjectData[0].grades.Q1 || 0)
          },
          {
            name: "Q2",
            [subjectData[0].className]: parseFloat(subjectData[0].grades.Q2 || 0)
          },
          {
            name: "Q3",
            [subjectData[0].className]: parseFloat(subjectData[0].grades.Q3 || 0)
          },
          {
            name: "Q4",
            [subjectData[0].className]: parseFloat(subjectData[0].grades.Q4 || 0)
          }
        ];
        break;

      case "subjectsAcrossQuarters":
        // For each subject, show all quarters
        processedData = grades.map(subject => {
          return {
            name: subject.className,
            Q1: parseFloat(subject.grades.Q1 || 0),
            Q2: parseFloat(subject.grades.Q2 || 0),
            Q3: parseFloat(subject.grades.Q3 || 0),
            Q4: parseFloat(subject.grades.Q4 || 0),
            Average: parseFloat(subject.average || 0)
          };
        });
        break;

      case "subjectsInOneQuarter":
        // For the selected quarter, show all subjects
        processedData = grades.map(subject => {
          return {
            name: subject.className,
            Grade: parseFloat(subject.grades[selectedQuarter] || 0)
          };
        });
        break;

      default:
        processedData = [];
    }

    setChartData(processedData);
  };

  // Generate chart data on component mount
  useEffect(() => {
    if (grades && grades.length > 0 && isDataLoaded) {
      generateChartData();
    }
  }, [isDataLoaded, grades]);

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
          classes={classes}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          generateChartData={generateChartData}
        />

        {isDataLoaded && classes.length === 0 ? (
          <NoDataDisplay message="You are not enrolled in any classes for the selected school year." />
        ) : (
          chartData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mt-5">
              <h3 className="text-xl font-semibold mb-4">Grade Trends Visualization</h3>
              <div className="h-96">
                <GradeChart 
                  chartType={chartType} 
                  data={chartData} 
                  dataType={dataType}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentGradeTrendsPage;