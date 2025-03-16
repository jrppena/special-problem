import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import ChartFilters from "../../components/teacher/chart-filters";
import GradeChart from "../../components/teacher/grade-chart"; // Reusing student chart component
import NoDataDisplay from "../../components/student/no-data-display"; // Reusing no data component

import { useTeacherStore } from "../../store/useTeacherStore";
import { useAuthStore } from "../../store/useAuthStore";
import { schoolYears } from "../../constants";

const TeacherGradeTrendsPage = () => {
  // Store data
  const { 
    assignedClasses, 
    getAssignedClasses, 
    getClassGrades,
    classGrades
  } = useTeacherStore();
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

  // Fetch assigned classes on component mount or school year change
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

  // Generate chart data
  const generateChartData = async () => {
    if (!isDataLoaded || !selectedSubject) {
      return;
    }
    
    // First, fetch the latest grade data for the selected subject/section
    if (dataType === "singleSectionPerformance" && selectedSubject && selectedSection) {
      await getClassGrades(selectedSubject._id, selectedQuarter, selectedSection);
    } else if (dataType === "sectionsPerformance" && selectedSubject) {
      // For sections performance, we might need to fetch data for all sections
      const fetchPromises = selectedSubject.sections.map(section => 
        getClassGrades(selectedSubject._id, selectedQuarter, section)
      );
      await Promise.all(fetchPromises);
    }

    if (!classGrades || Object.keys(classGrades).length === 0) {
      setChartData([]);
      return;
    }

    let processedData = [];

    switch (dataType) {
      case "singleSectionPerformance":
        if (!selectedSection) {
          console.warn("No section selected for single section view");
          setChartData([]);
          return;
        }

        if (selectedQuarter === "all") {
          // Create data for all students across quarters
          const studentScores = {};
          const quarterData = { Q1: {}, Q2: {}, Q3: {}, Q4: {} };

          // Group grades by student
          selectedSection.students.forEach(student => {
            const studentName = `${student.lastName}, ${student.firstName}`;
            const grades = classGrades[student._id] || {};
            
            ["Q1", "Q2", "Q3", "Q4"].forEach(quarter => {
              const score = parseFloat(grades[quarter]) || 0;
              if (quarterData[quarter]) {
                quarterData[quarter][studentName] = score;
              }
            });
          });

          // Transform to chart data format
          processedData = [
            {
              name: "Q1",
              ...quarterData.Q1
            },
            {
              name: "Q2",
              ...quarterData.Q2
            },
            {
              name: "Q3",
              ...quarterData.Q3
            },
            {
              name: "Q4",
              ...quarterData.Q4
            }
          ];
        } else {
          // Create data for specific quarter across students
          processedData = selectedSection.students.map(student => {
            const studentName = `${student.lastName}, ${student.firstName}`;
            const grade = parseFloat(classGrades[student._id]?.[selectedQuarter] || 0);
            
            return {
              name: studentName,
              Grade: grade
            };
          });
        }
        break;

      case "sectionsPerformance":
        if (!selectedSubject) {
          console.warn("No subject selected for sections performance view");
          setChartData([]);
          return;
        }

        // Calculate average grades per section
        const sectionAverages = {};
        
        // Process each section
        selectedSubject.sections.forEach(section => {
          const sectionName = `${section.gradeLevel}-${section.name}`;
          sectionAverages[sectionName] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, count: 0 };
          
          // Get grades for this section
          section.students.forEach(student => {
            const grades = classGrades[student._id] || {};
            
            ["Q1", "Q2", "Q3", "Q4"].forEach(quarter => {
              const score = parseFloat(grades[quarter]) || 0;
              if (score > 0) {
                sectionAverages[sectionName][quarter] += score;
                sectionAverages[sectionName].count++;
              }
            });
          });
          
          // Calculate averages
          ["Q1", "Q2", "Q3", "Q4"].forEach(quarter => {
            if (sectionAverages[sectionName].count > 0) {
              sectionAverages[sectionName][quarter] = 
                (sectionAverages[sectionName][quarter] / sectionAverages[sectionName].count).toFixed(1);
            }
          });
          
          delete sectionAverages[sectionName].count;
        });
        
        if (selectedQuarter === "all") {
          // Transform to chart data format for all quarters
          processedData = Object.keys(sectionAverages).map(sectionName => {
            return {
              name: sectionName,
              ...sectionAverages[sectionName]
            };
          });
        } else {
          // For specific quarter only
          processedData = Object.keys(sectionAverages).map(sectionName => {
            return {
              name: sectionName,
              Grade: parseFloat(sectionAverages[sectionName][selectedQuarter] || 0)
            };
          });
        }
        break;

      default:
        processedData = [];
    }

    setChartData(processedData);
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

        {isDataLoaded && assignedClasses.length === 0 ? (
          <NoDataDisplay message="You have no assigned classes for the selected school year." />
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

export default TeacherGradeTrendsPage;