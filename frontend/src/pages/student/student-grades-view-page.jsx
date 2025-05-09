import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import Dropdown from "../../components/drop-down";
import HonorsList from "./honors-list";
import toast from "react-hot-toast";

import { useStudentStore } from "../../store/useStudentStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useConfigStore } from "../../store/useConfigStore";
import { Loader } from "lucide-react";

const StudentGradesViewPage = () => {
  // Add ConfigStore for school years
  const { fetchSchoolYears, isGettingSchoolYears } = useConfigStore();
  
  // States for school years and loading
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [isLoadingSchoolYears, setIsLoadingSchoolYears] = useState(true);

  const quarterOptions = [
    { value: "all", label: "All Quarters" },
    { value: "Q1", label: "Quarter 1" },
    { value: "Q2", label: "Quarter 2" },
    { value: "Q3", label: "Quarter 3" },
    { value: "Q4", label: "Quarter 4" },
  ];

  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const { 
    classes, 
    getEnrolledClasses, 
    getEnrolledClassesGrades, 
    grades, 
    isGettingGrades,
    clearGrades,
    clearClasses,
  } = useStudentStore();
  const { authUser } = useAuthStore();

  // Fetch school years on component mount
  useEffect(() => {
    const getSchoolYears = async () => {
      try {
        const years = await fetchSchoolYears();
        if (years && years.length > 0) {
          setSchoolYears(years);
          setSelectedSchoolYear(years[0]); // Set first school year as default
          setIsLoadingSchoolYears(false);
        }
      } catch (error) {
        console.error("Error fetching school years:", error);
        toast.error("Failed to load school years");
        setIsLoadingSchoolYears(false);
      }
    };
    
    getSchoolYears();
  }, [fetchSchoolYears]);

  // Clear grades when component mounts and unmounts
  useEffect(() => {
    // Clear grades data when component mounts to avoid seeing stale data
    clearGrades();
    clearClasses();
    
    return () => {
      // Also clear grades when component unmounts
      clearGrades();
      clearClasses();

    };
  }, [clearGrades, clearClasses,selectedSchoolYear]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSchoolYear || !authUser?._id) return;
      
      setIsLoading(true);
      try {
        // First get enrolled classes
        const updatedClasses = await getEnrolledClasses(authUser._id, selectedSchoolYear);

        // Check if updatedClasses is valid (not null, undefined, or empty)
        if (updatedClasses && updatedClasses.length > 0) {
          // Then get grades using the updated classes
          await getEnrolledClassesGrades(updatedClasses, authUser._id, selectedSchoolYear);
        } 
      } catch (error) {
        // Handle any errors from either request
        console.error("Error fetching data: ", error);
        toast.error("Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSchoolYear, authUser?._id, getEnrolledClasses, getEnrolledClassesGrades]);

  const dynamicClassOptions =
    classes.length > 0
      ? [{ value: "all", label: "All Classes" }, ...classes.map((c) => ({ value: c._id, label: c.subjectName }))]
      : [];

  // Filter the grades data based on the selected class
  const filteredGradesData =
    selectedClass === "all" ? grades : grades.filter(g => g.classId === selectedClass);

  useEffect(() => {
    // Reset the quarter filter when selecting a single class
    if (selectedClass !== "all") {
      setSelectedQuarter("all");
    }
  }, [selectedClass]);

  const calculateQuarterAverage = (quarter) => {
    const validGrades = filteredGradesData
      .map((classGrade) => {
        const grade = classGrade.grades[quarter];
        return grade === "-" ? null : parseFloat(grade);
      })
      .filter((grade) => grade !== null && !isNaN(grade));

    if (validGrades.length === 0) return "-";
    const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
    return average.toFixed(2);
  };

  // Check if all quarters have grades for a class
  const hasCompleteQuarterGrades = (classGrade) => {
    return ["Q1", "Q2", "Q3", "Q4"].every(quarter => 
      classGrade.grades[quarter] !== undefined && 
      classGrade.grades[quarter] !== null &&
      classGrade.grades[quarter] !== "-" &&
      !isNaN(parseFloat(classGrade.grades[quarter]))
    );
  };

  // Determine if a class is passed (85% or higher)
  const getClassRemarks = (classGrade) => {
    if (!hasCompleteQuarterGrades(classGrade)) {
      return "Incomplete";
    }
    
    const average = parseFloat(classGrade.average);
    return !isNaN(average) && average >= 85 ? "Passed" : "Failed";
  };

  // Get overall remarks
  const getOverallRemarks = () => {
    // Check if all classes have complete grades
    const hasAllCompleteGrades = filteredGradesData.every(classGrade => 
      hasCompleteQuarterGrades(classGrade)
    );
    
    if (!hasAllCompleteGrades) {
      return "Incomplete";
    }
    
    // Check if all classes are passed
    const allPassed = filteredGradesData.every(classGrade => {
      const average = parseFloat(classGrade.average);
      return !isNaN(average) && average >= 85;
    });
    
    return allPassed ? "Passed" : "Failed";
  };

  // Combined loading state
  const showLoading = isLoadingSchoolYears || isGettingSchoolYears || isLoading || isGettingGrades;

  // If loading school years, show loader
  if (isGettingSchoolYears || isLoadingSchoolYears) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <PageHeader title="View Grades" />
        <div className="bg-white p-6 rounded-lg shadow mt-5">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Dropdown
              label="School Year"
              options={schoolYears}
              selected={selectedSchoolYear || ""}
              setSelected={(year) => {
                setSelectedSchoolYear(year);
              }}
            />

            {classes.length > 0 && (
              <Dropdown
                label="Class"
                options={dynamicClassOptions.map((c) => c.label)}
                selected={dynamicClassOptions.find((c) => c.value === selectedClass)?.label || "All Classes"}
                setSelected={(label) => {
                  const selected = dynamicClassOptions.find((c) => c.label === label);
                  setSelectedClass(selected?.value || "all");
                }}
              />
            )}

            {classes.length > 0 && (
              <Dropdown
                label="Quarter"
                options={selectedClass === "all" ? quarterOptions.map((q) => q.label) : quarterOptions.slice(0, 1).map((q) => q.label)}
                selected={quarterOptions.find((q) => q.value === selectedQuarter)?.label || "All Quarters"}
                setSelected={(label) => {
                  const selected = quarterOptions.find((q) => q.label === label);
                  setSelectedQuarter(selected?.value || "all");
                }}
                disabled={selectedClass !== "all"}
              />
            )}
          </div>
        </div>

        {/* Content Rendering Section - Fixed Logic */}
        {showLoading ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 flex justify-center items-center h-96">
            <Loader className="size-10 animate-spin" />
            <p className="ml-3 text-gray-500">Loading grades...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 text-center text-gray-500">
            You are not enrolled in any classes for the selected school year.
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow mt-5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedClass === "all" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Class Name
                        </th>
                      )}
                      {selectedQuarter === "all" ? (
                        ["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                          <th key={quarter} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {quarter}
                          </th>
                        ))
                      ) : (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {selectedQuarter}
                        </th>
                      )}
                      {selectedQuarter === "all" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                      )}
                      {selectedQuarter === "all" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                      )}
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGradesData.map((classGrade) => (
                      <tr key={classGrade.classId}>
                        {selectedClass === "all" && (
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {classGrade.className}
                          </td>
                        )}
                        {selectedQuarter === "all" ? (
                          ["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                            <td key={quarter} className="px-6 py-4 whitespace-nowrap">
                              {classGrade.grades[quarter] || "-"}
                            </td>
                          ))
                        ) : (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {classGrade.grades[selectedQuarter] || "-"}
                          </td>
                        )}
                        {selectedQuarter === "all" && (
                          <td className="px-6 py-4 whitespace-nowrap">{classGrade.average || "-"}</td>
                        )}
                        {selectedQuarter === "all" && (
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                            getClassRemarks(classGrade) === "Passed" 
                              ? "text-green-600" 
                              : getClassRemarks(classGrade) === "Failed" 
                                ? "text-red-600" 
                                : "text-yellow-600"
                          }`}>
                            {getClassRemarks(classGrade)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {/* Add footer with averages */}
                  {selectedClass === "all" && filteredGradesData.length > 0 && (
                    <tfoot>
                      <tr className="bg-gray-50">
                        {selectedClass === "all" && (
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            Average
                          </td>
                        )}
                        {selectedQuarter === "all" ? (
                          ["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                            <td
                              key={quarter}
                              className="px-6 py-4 whitespace-nowrap font-semibold"
                            >
                              {calculateQuarterAverage(quarter)}
                            </td>
                          ))
                        ) : (
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            {calculateQuarterAverage(selectedQuarter)}
                          </td>
                        )}
                        {selectedQuarter === "all" && (
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            {filteredGradesData.length > 0
                              ? (
                                  (filteredGradesData.reduce(
                                    (sum, classGrade) => sum + parseFloat(classGrade.average || 0),
                                    0
                                  ) / filteredGradesData.length).toFixed(2)
                                )
                              : "-"}
                          </td>
                        )}
                        {selectedQuarter === "all" && (
                          <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                            getOverallRemarks() === "Passed" 
                              ? "text-green-600" 
                              : getOverallRemarks() === "Failed" 
                                ? "text-red-600" 
                                : "text-yellow-600"
                          }`}>
                            {getOverallRemarks()}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Overall Status Card */}
            {filteredGradesData.length > 0 && selectedClass === "all" && selectedQuarter === "all" && (
              <div className={`mt-5 p-4 rounded-lg shadow border-l-4 ${
                getOverallRemarks() === "Passed" 
                  ? "bg-green-50 border-green-500" 
                  : getOverallRemarks() === "Failed" 
                    ? "bg-red-50 border-red-500" 
                    : "bg-yellow-50 border-yellow-500"
              }`}>
                <h3 className="text-lg font-semibold mb-2">
                  {getOverallRemarks() === "Passed" 
                    ? "Congratulations!" 
                    : getOverallRemarks() === "Failed" 
                      ? "Attention Required" 
                      : "Grades Incomplete"}
                </h3>
                <p>
                  {getOverallRemarks() === "Passed" 
                    ? "You have passed all your subjects. Keep up the good work!" 
                    : getOverallRemarks() === "Failed" 
                      ? "You need to improve in one or more subjects. Please consult with your teacher." 
                      : "Some of your grades are not yet complete. Check back later for full results."}
                </p>
              </div>
            )}

            {/* Honors List component */}
            {filteredGradesData.length > 0 && selectedClass === "all" && (
              <HonorsList 
                grades={filteredGradesData} 
                selectedQuarter={selectedQuarter}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentGradesViewPage;