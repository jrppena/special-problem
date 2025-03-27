import React, { useState } from "react";

const SectionGradesModal = ({ isOpen, onClose, section, grades }) => {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("overall");

  const calculateFinalAverage = (quarterAverages) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const validAverages = quarters.filter(q => !isNaN(parseFloat(quarterAverages[q])));
    
    if (validAverages.length === 0) return 'N/A';
    
    const total = validAverages.reduce((sum, q) => 
      sum + parseFloat(quarterAverages[q]), 0);
    return (total / validAverages.length).toFixed(2);
  };

  const getHonorAndAverage = (student, filter) => {
    let average;
    if (filter === "overall") {
      // Calculate exact average for honor determination
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const validAverages = quarters
        .map(q => parseFloat(student.quarterAverages[q]))
        .filter(q => !isNaN(q));
      
      if (validAverages.length === 0) return { honor: null, average: null };
      
      const total = validAverages.reduce((sum, q) => sum + q, 0);
      average = total / validAverages.length;
    } else {
      average = parseFloat(student.quarterAverages[filter]);
    }
    
    if (isNaN(average)) return { honor: null, average: null };
    
    let honor = null;
    if (average >= 98) honor = "with highest honors";
    else if (average >= 95) honor = "with high honors";
    else if (average >= 90) honor = "with honors";
    
    return { honor, average };
  };

  const honorOrder = ["with highest honors", "with high honors", "with honors"];
  const honorsList = (grades || []).reduce((acc, student) => {
    const { honor, average } = getHonorAndAverage(student, selectedFilter);
    if (honor) {
      if (!acc[honor]) acc[honor] = [];
      acc[honor].push({ student, average });
    }
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-3/4 max-h-[80vh] overflow-auto">
        <h3 className="text-xl font-semibold mb-4">
          Section Grades - {section?.gradeLevel}-{section?.name}
        </h3>

      

        <table className="min-w-full divide-y divide-gray-200">
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
            {grades?.map((student) => (
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
                    {sortedStudents.map(({ student, average }) => (
                    <div
                        key={student.studentId}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center">
                        <span className="font-semibold text-gray-700">{student.studentName}</span>
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