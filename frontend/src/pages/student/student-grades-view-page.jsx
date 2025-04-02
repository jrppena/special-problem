import React, { useState, useEffect } from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";
import Dropdown from "../../components/drop-down";
import HonorsList from "./honors-list"; // Import the new HonorsList component

import { useStudentStore } from "../../store/useStudentStore";
import { useAuthStore } from "../../store/useAuthStore";

const StudentGradesViewPage = () => {
  // Dummy data constants
  const schoolYears = [
    { name: "2024-2025" },
    { name: "2023-2024" },
    { name: "2022-2023" },
    { name: "2021-2022" },
  ];

  const quarterOptions = [
    { value: "all", label: "All Quarters" },
    { value: "Q1", label: "Quarter 1" },
    { value: "Q2", label: "Quarter 2" },
    { value: "Q3", label: "Quarter 3" },
    { value: "Q4", label: "Quarter 4" },
  ];

  const [selectedSchoolYear, setSelectedSchoolYear] = useState(schoolYears[0].name);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [enrolledClasses, setEnrolledClasses] = useState({});
  const [gradesData, setGradesData] = useState({});

  const { classes, getEnrolledClasses, getEnrolledClassesGrades, grades, isGettingGrades } = useStudentStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get enrolled classes
        const updatedClasses = await getEnrolledClasses(authUser._id, selectedSchoolYear);

        // Check if updatedClasses is valid (not null, undefined, or empty)
        if (updatedClasses && updatedClasses.length > 0) {
          // Then get grades using the updated classes
          await getEnrolledClassesGrades(updatedClasses, authUser._id, selectedSchoolYear);
        } else {
          setGradesData([]);
        }
      } catch (error) {
        // Handle any errors from either request
        console.error("Error fetching data: ", error);
        toast.error("Failed to load student data");
      }
    };

    fetchData();
  }, [selectedSchoolYear, authUser._id]); // All dependencies included

  const dynamicClassOptions =
    classes.length > 0
      ? [{ value: "all", label: "All Classes" }, ...classes.map((c) => ({ value: c._id, label: c.subjectName }))]
      : [];

  // Filter the grades data based on the selected class
  const filteredGradesData =
    selectedClass === "all" ? grades : [grades.find((g) => g.classId === selectedClass)];

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
              options={schoolYears.map((year) => year.name)}
              selected={selectedSchoolYear}
              setSelected={setSelectedSchoolYear}
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

        {classes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 text-center text-gray-500">
            You are not enrolled in any classes for the selected school year.
          </div>
        ) : isGettingGrades ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 flex justify-center items-center h-96">
            <p className="text-gray-500">Loading grades...</p>
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
                      </tr>
                    ))}
                  </tbody>
                  {/* Add footer with averages */}
                  {selectedClass === "all" && (
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

                     
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

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