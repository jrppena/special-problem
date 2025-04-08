import React, { useState } from "react";
import Pagination from "../../components/pagination";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Component-specific subcomponents
const StudentRow = ({ student, expandedStudentId, setExpandedStudentId, calculateFinalAverage }) => (
  <React.Fragment>
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
);

const HonorsList = ({ honorsList, honorOrder, selectedFilter, setSelectedFilter }) => (
  <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
    <h4 className="text-xl font-semibold text-gray-800 mb-6">Honors List</h4>
    
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
);

// Constants
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const HONOR_ORDER = ["With Highest Honors", "With High Honors", "With Honors"];
const ITEMS_PER_PAGE = 10;

// Helper functions moved outside component
const calculateQuarterAverage = (averages, quarters) => {
  const validAverages = quarters.filter(q => !isNaN(parseFloat(averages[q])));
  
  if (validAverages.length === 0) return 'N/A';
  
  const total = validAverages.reduce((sum, q) => sum + parseFloat(averages[q]), 0);
  return (total / validAverages.length).toFixed(2);
};

const getHonorFromAverage = (average) => {
  if (average >= 98) return "With Highest Honors";
  if (average >= 95) return "With High Honors";
  if (average >= 90) return "With Honors";
  return null;
};

// Main component
const SectionGradesModal = ({ isOpen, onClose, section, grades }) => {
  // State
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Q1");
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);

  // Skip rendering if modal is closed
  if (!isOpen) return null;

  // Check if all required classes have grades for a specific quarter
  const hasCompleteQuarterGrades = (student, quarter) => {
    if (!student.classes || student.classes.length === 0) return false;
    
    return student.classes.every(cls => 
      cls.grades && 
      cls.grades[quarter] !== undefined && 
      cls.grades[quarter] !== null && 
      !isNaN(parseFloat(cls.grades[quarter]))
    );
  };

  // Check if student has complete overall grades
  const hasCompleteOverallGrades = (student) => {
    return QUARTERS.every(quarter => hasCompleteQuarterGrades(student, quarter));
  };

  // Get honor status and average for a student
  const getHonorAndAverage = (student, filter) => {
    let average;
    let isComplete = false;
    
    if (filter === "overall") {
      const validAverages = QUARTERS
        .map(q => parseFloat(student.quarterAverages[q]))
        .filter(q => !isNaN(q));
      
      if (validAverages.length === 0) return { honor: null, average: null, isComplete: false };
      
      average = validAverages.reduce((sum, q) => sum + q, 0) / validAverages.length;
      isComplete = hasCompleteOverallGrades(student);
    } else {
      average = parseFloat(student.quarterAverages[filter]);
      isComplete = hasCompleteQuarterGrades(student, filter);
      
      if (isNaN(average) || student.quarterAverages[filter] === undefined) {
        return { honor: null, average: null, isComplete: false };
      }
    }
    
    const honor = getHonorFromAverage(average);
    return { honor, average, isComplete };
  };
  
  // Get paginated student data
  const getPaginatedData = () => {
    if (!grades) return [];
    if (isShowingAll) return grades;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return grades.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Calculate final average for a student
  const calculateFinalAverage = (quarterAverages) => {
    return calculateQuarterAverage(quarterAverages, QUARTERS);
  };

  // Generate honors list
  const honorsList = (grades || []).reduce((acc, student) => {
    const { honor, average, isComplete } = getHonorAndAverage(student, selectedFilter);
    if (honor && average !== null) {
      if (!acc[honor]) acc[honor] = [];
      acc[honor].push({ student, average, isComplete });
    }
    return acc;
  }, {});

  // Excel export functionality
  const downloadExcel = async () => {
    if (!grades || grades.length === 0) return;
    
    try {
      const workbook = new ExcelJS.Workbook();
      
      // Configure workbook properties
      workbook.creator = 'School Management System';
      workbook.lastModifiedBy = 'School Management System';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // Create and format main worksheet
      createMainWorksheet(workbook, grades, section);
      
      // Create honors worksheet
      createHonorsWorksheet(workbook, grades, section, selectedFilter);
      
      // Create details worksheet
      createDetailsWorksheet(workbook, grades, section);
      
      // Generate and save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Section_${section?.gradeLevel}-${section?.name}_Grades.xlsx`);
    } catch (error) {
      console.error("Error generating Excel file:", error);
      alert("There was an error generating the Excel file. Please try again.");
    }
  };

  // Create the main grades worksheet
  const createMainWorksheet = (workbook, grades, section) => {
    const worksheet = workbook.addWorksheet(`Section ${section?.gradeLevel}-${section?.name}`);
    
    // Add title and date rows
    worksheet.addRow([`Section ${section?.gradeLevel}-${section?.name} - Grades Report`]);
    worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    worksheet.addRow([]); // Empty row for spacing
    
    // Style the title
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(2).font = { italic: true };
    
    // Add headers at row 4
    const headerRow = worksheet.addRow([
      'Student Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Final Average'
    ]);
    
    // Style the header row
    applyHeaderStyles(headerRow);
    
    // Set column widths
    worksheet.columns = [
      { width: 30 }, // Student Name
      { width: 10 }, // Q1
      { width: 10 }, // Q2
      { width: 10 }, // Q3
      { width: 10 }, // Q4
      { width: 15 }, // Final Average
    ];
    
    // Add student data
    grades.forEach(student => {
      const finalAverage = calculateFinalAverage(student.quarterAverages);
      const dataRow = worksheet.addRow([
        student.studentName,
        student.quarterAverages.Q1 || 'N/A',
        student.quarterAverages.Q2 || 'N/A',
        student.quarterAverages.Q3 || 'N/A',
        student.quarterAverages.Q4 || 'N/A',
        finalAverage
      ]);
      
      // Apply conditional formatting to final average
      applyGradeColorFormatting(dataRow.getCell(6), finalAverage);
      
      // Add light borders to data cells
      applyDataRowStyles(dataRow);
    });
  };

  // Create honors worksheet
  const createHonorsWorksheet = (workbook, grades, section, selectedFilter) => {
    const honorsWorksheet = workbook.addWorksheet('Honors List');
    
    // Add title to honors worksheet
    honorsWorksheet.addRow([`${section?.gradeLevel}-${section?.name} - Honors List (${selectedFilter === 'overall' ? 'Overall' : selectedFilter} Period)`]);
    honorsWorksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    honorsWorksheet.addRow([]); // Empty row for spacing
    
    // Style the honors title
    honorsWorksheet.getRow(1).font = { bold: true, size: 16 };
    honorsWorksheet.getRow(2).font = { italic: true };
    
    // Add headers
    const honorsHeaderRow = honorsWorksheet.addRow([
      'Honor Category', 'Student Name', 'Average', 'Complete Grades'
    ]);
    
    // Style the header row for honors
    applyHeaderStyles(honorsHeaderRow);
    
    // Set column widths
    honorsWorksheet.columns = [
      { width: 25 }, // Honor Category
      { width: 30 }, // Student Name
      { width: 15 }, // Average
      { width: 15 }, // Complete Grades
    ];
    
    // Calculate honors for export
    const honorsList = (grades || []).reduce((acc, student) => {
      const { honor, average, isComplete } = getHonorAndAverage(student, selectedFilter);
      if (honor && average !== null) {
        if (!acc[honor]) acc[honor] = [];
        acc[honor].push({ student, average, isComplete });
      }
      return acc;
    }, {});
    
    // Add honors data
    let rowCount = 0;
    HONOR_ORDER.forEach(honor => {
      const students = honorsList[honor] || [];
      if (students.length === 0) return;
      
      // Add a category header
      if (rowCount > 0) {
        honorsWorksheet.addRow([]); // Add space between categories
      }
      
      const sortedStudents = [...students].sort((a, b) => {
        if (b.average !== a.average) return b.average - a.average;
        return a.student.studentName.localeCompare(b.student.studentName);
      });
      
      sortedStudents.forEach(({ student, average, isComplete }) => {
        const dataRow = honorsWorksheet.addRow([
          honor,
          student.studentName,
          average.toFixed(2),
          isComplete ? 'Yes' : 'No'
        ]);
        
        // Apply honor category color
        applyHonorCategoryColor(dataRow.getCell(1), honor);
        
        // Add light borders to data cells
        applyDataRowStyles(dataRow);
        
        rowCount++;
      });
    });
  };

  // Create details worksheet
  const createDetailsWorksheet = (workbook, grades, section) => {
    const detailsWorksheet = workbook.addWorksheet('Student Details');
    
    // Add title to details worksheet
    detailsWorksheet.addRow([`${section?.gradeLevel}-${section?.name} - Detailed Student Grades`]);
    detailsWorksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    detailsWorksheet.addRow([]); // Empty row for spacing
    
    // Style the details title
    detailsWorksheet.getRow(1).font = { bold: true, size: 16 };
    detailsWorksheet.getRow(2).font = { italic: true };
    
    // Set column widths for details worksheet
    detailsWorksheet.columns = [
      { width: 30 }, // Student Name
      { width: 30 }, // Subject
      { width: 10 }, // Q1
      { width: 10 }, // Q2
      { width: 10 }, // Q3
      { width: 10 }, // Q4
      { width: 15 }, // Subject Average
    ];
    
    // Add headers at row 4
    const detailsHeaderRow = detailsWorksheet.addRow([
      'Student Name', 'Subject', 'Q1', 'Q2', 'Q3', 'Q4', 'Subject Average'
    ]);
    
    // Style the header row for details
    applyHeaderStyles(detailsHeaderRow);
    
    // Add detailed student data
    let currentStudent = '';
    grades.forEach(student => {
      if (student.classes && student.classes.length > 0) {
        // Sort classes by name
        const sortedClasses = [...student.classes].sort((a, b) => 
          a.className.localeCompare(b.className)
        );
        
        sortedClasses.forEach(cls => {
          const dataRow = detailsWorksheet.addRow([
            student.studentName,
            cls.className,
            cls.grades.Q1 || 'N/A',
            cls.grades.Q2 || 'N/A',
            cls.grades.Q3 || 'N/A',
            cls.grades.Q4 || 'N/A',
            cls.average || 'N/A'
          ]);
          
          // Add light background if this is a new student (for readability)
          if (currentStudent !== student.studentName) {
            dataRow.eachCell({ includeEmpty: true }, (cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF9F9F9' }
              };
            });
            currentStudent = student.studentName;
          }
          
          // Add light borders to data cells
          applyDataRowStyles(dataRow);
        });
        
        // Add empty row after each student
        detailsWorksheet.addRow([]);
      }
    });
  };

  // Helper functions for Excel styling
  const applyHeaderStyles = (headerRow) => {
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  };

  const applyDataRowStyles = (dataRow) => {
    dataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  };

  const applyGradeColorFormatting = (cell, grade) => {
    const avgValue = parseFloat(grade);
    if (!isNaN(avgValue)) {
      if (avgValue >= 98) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD4EDDA' } // Light green
        };
      } else if (avgValue >= 95) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F4F8' } // Light blue
        };
      } else if (avgValue >= 90) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3CD' } // Light yellow
        };
      }
    }
  };

  const applyHonorCategoryColor = (cell, honor) => {
    let fillColor;
    if (honor === "With Highest Honors") {
      fillColor = { argb: 'FFD4EDDA' }; // Light green
    } else if (honor === "With High Honors") {
      fillColor = { argb: 'FFE8F4F8' }; // Light blue
    } else if (honor === "With Honors") {
      fillColor = { argb: 'FFFFF3CD' }; // Light yellow
    }
    
    if (fillColor) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: fillColor
      };
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-3/4 max-h-[80vh] overflow-auto">
        <h3 className="text-xl font-semibold mb-4">
          Section Grades - {section?.gradeLevel}-{section?.name}
        </h3>

        <div className="flex justify-between items-center mb-4">
          {/* Pagination Controls */}
          <Pagination
            totalItems={grades?.length || 0}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isShowingAll={isShowingAll}
            setIsShowingAll={setIsShowingAll}
          />
        </div>
      
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
              <StudentRow 
                key={student.studentId}
                student={student} 
                expandedStudentId={expandedStudentId}
                setExpandedStudentId={setExpandedStudentId}
                calculateFinalAverage={calculateFinalAverage}
              />
            ))}
          </tbody>
        </table>

        {/* Download Button */}
        <div className="mt-4 flex justify-start">
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            disabled={!grades || grades.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Section Grades
          </button>
        </div>

        {/* Honors List */}
        <HonorsList 
          honorsList={honorsList} 
          honorOrder={HONOR_ORDER} 
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      </div>
    </div>
  );
};

export default SectionGradesModal;  