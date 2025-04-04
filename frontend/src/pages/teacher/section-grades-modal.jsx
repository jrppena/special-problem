import React, { useState } from "react";
import Pagination from "../../components/pagination"; // Import the Pagination component

const SectionGradesModal = ({ isOpen, onClose, section, grades }) => {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Q1");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const itemsPerPage = 10;

  const calculateFinalAverage = (quarterAverages) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const validAverages = quarters.filter(q => !isNaN(parseFloat(quarterAverages[q])));
    
    if (validAverages.length === 0) return 'N/A';
    
    const total = validAverages.reduce((sum, q) => 
      sum + parseFloat(quarterAverages[q]), 0);
    return (total / validAverages.length).toFixed(2);
  };

  // Check if all required classes have grades for a specific quarter
  const hasCompleteQuarterGrades = (student, quarter) => {
    // If there are no classes, return false
    if (!student.classes || student.classes.length === 0) return false;
    
    // Check if all classes have grades for this quarter
    return student.classes.every(cls => 
      cls.grades && 
      cls.grades[quarter] !== undefined && 
      cls.grades[quarter] !== null && 
      !isNaN(parseFloat(cls.grades[quarter]))
    );
  };

  // Check if student has complete overall grades
  const hasCompleteOverallGrades = (student) => {
    // For overall, we'll require all quarters to be complete
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters.every(quarter => hasCompleteQuarterGrades(student, quarter));
  };

  const getHonorAndAverage = (student, filter) => {
    let average;
    let isComplete = false;
    
    if (filter === "overall") {
      // Calculate average from available quarters
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const validAverages = quarters
        .map(q => parseFloat(student.quarterAverages[q]))
        .filter(q => !isNaN(q));
      
      if (validAverages.length === 0) return { honor: null, average: null, isComplete: false };
      
      const total = validAverages.reduce((sum, q) => sum + q, 0);
      average = total / validAverages.length;
      
      // Check if all quarters are complete
      isComplete = hasCompleteOverallGrades(student);
    } else {
      // For specific quarter filter
      average = parseFloat(student.quarterAverages[filter]);
      
      // Check if this specific quarter is complete
      isComplete = hasCompleteQuarterGrades(student, filter);
      
      if (isNaN(average) || student.quarterAverages[filter] === undefined) {
        return { honor: null, average: null, isComplete: false };
      }
    }
    
    let honor = null;
    if (average >= 98) honor = "With Highest Honors";
    else if (average >= 95) honor = "With High Honors";
    else if (average >= 90) honor = "With Honors";
    
    return { honor, average, isComplete };
  };

  const honorOrder = ["With Highest Honors", "With High Honors", "With Honors"];
  const honorsList = (grades || []).reduce((acc, student) => {
    const { honor, average, isComplete } = getHonorAndAverage(student, selectedFilter);
    if (honor && average !== null) {
      if (!acc[honor]) acc[honor] = [];
      acc[honor].push({ student, average, isComplete });
    }
    return acc;
  }, {});

  // Get paginated student data
  const getPaginatedData = () => {
    if (!grades) return [];
    if (isShowingAll) return grades;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return grades.slice(startIndex, startIndex + itemsPerPage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-3/4 max-h-[80vh] overflow-auto">
        <h3 className="text-xl font-semibold mb-4">
          Section Grades - {section?.gradeLevel}-{section?.name}
        </h3>

        {/* Pagination Controls */}
        <Pagination
          totalItems={grades?.length || 0}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isShowingAll={isShowingAll}
          setIsShowingAll={setIsShowingAll}
        />
      
        {/* Table for Student Grades */}
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Q1
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Q2
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Q3
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Q4
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final Average
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getPaginatedData().map((student) => (
              <React.Fragment key={student.studentId}>
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedStudentId(
                    expandedStudentId === student.studentId ? null : student.studentId
                  )}
                >
                  <td className="px-6 py-4">{student.studentName}</td>
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                    <td key={q} className="px-6 py-4 text-center">
                      {student.quarterAverages[q] || 'N/A'}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center font-semibold">
                    {calculateFinalAverage(student.quarterAverages)}
                  </td>
                </tr>

                {expandedStudentId === student.studentId && (
                  <tr className="bg-gray-50">
                    <td colSpan="6" className="px-6 py-4">
                      <div className="ml-4">
                        <h4 className="font-semibold mb-2">Subject Grades</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {student.classes.map((cls) => (
                            <div key={cls.classId} className="bg-white p-4 rounded shadow">
                              <h5 className="font-medium mb-2">{cls.className}</h5>
                              <div className="grid grid-cols-4 gap-2">
                                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                  <div key={q} className="text-center">
                                    <div className="text-xs text-gray-500">{q}</div>
                                    <div>{cls.grades[q] || 'N/A'}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-center">
                                Average: {cls.average}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Honors List */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Honors List</h4>
          {/* Honors List Filter */}
          <div className="mb-4">
            <label className="mr-2">Filter by:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="overall">Overall</option>
              <option value="Q1">First Quarter</option>
              <option value="Q2">Second Quarter</option>
              <option value="Q3">Third Quarter</option>
              <option value="Q4">Fourth Quarter</option>
            </select>
          </div>
          {Object.keys(honorsList).length === 0 ? (
              <div className="text-gray-500 text-center">No honors for the selected period</div>
          ) : (
            honorOrder.map((honor) => {
              const students = honorsList[honor] || [];
              if (students.length === 0) return null;

              const sortedStudents = [...students].sort((a, b) => {
                  if (b.average !== a.average) return b.average - a.average;
                  return a.student.studentName.localeCompare(b.student.studentName);
              });

              return (
                  <div key={honor} className="mb-8">
                    <h5 className="font-medium text-lg text-gray-900 mb-4">{honor}</h5>
                    <div className="space-y-4">
                        {sortedStudents.map(({ student, average, isComplete }) => (
                        <div
                            key={student.studentId}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center">
                              <span className="font-semibold text-gray-700">{student.studentName}</span>
                              {!isComplete && (
                                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                  Incomplete Grades
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500">{average.toFixed(2)}</span>
                        </div>
                        ))}
                    </div>
                  </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionGradesModal;