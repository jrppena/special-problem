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
      workbook.creator = 'GSHS Acadbridge';
      workbook.lastModifiedBy = 'GSHS Acadbridge';
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
    const worksheet = workbook.addWorksheet(`Grade ${section?.gradeLevel}-${section?.name}`);
    worksheet.columns = [
      { width: 5 },    // Column A - narrow for row numbers
      { width: 20 },   // Column B
      { width: 20 },   // Column C
      { width: 20 },   // Column D
      { width: 20 },   // Column E
      { width: 20 },   // Column F
      { width: 20 },   // Column G - Added for Complete/Incomplete & Remarks
    ];

    // Header rows
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'Department of Education';

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = 'Region V';

    worksheet.mergeCells('A3:G3');
    worksheet.getCell('A3').value = 'Division of Camarines Sur';

    worksheet.mergeCells('A4:G4');
    worksheet.getCell('A4').value = 'Goa District';

    worksheet.mergeCells('A5:G5');
    worksheet.getCell('A5').value = 'GOA SCIENCE HIGH SCHOOL';

    worksheet.mergeCells('A6:G6');
    worksheet.getCell('A6').value = section?.schoolYear;

    worksheet.mergeCells('A7:G7');
    // Add empty row
    worksheet.addRow([]);

    // Title row
    worksheet.mergeCells('A8:G8');
    worksheet.getCell('A8').value = 'Summary of Quarterly Average Grades';

    worksheet.mergeCells('A9:G9');
    worksheet.getCell('A9').value = `Grade ${section?.gradeLevel} - ${section?.name}`;

    worksheet.addRow([]);

    // Style the cells - alignment and fonts only, no borders
    for (let i = 1; i <= 9; i++) {
      const cell = worksheet.getCell(`A${i}`);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Special styling for the school name (bold)
      if (i === 5) {
        cell.font = { bold: true };
      }

      // Special styling for the title (bold and size 14)
      if (i === 8) {
        cell.font = { bold: true, size: 14 };
      }
    }

    // Add headers at row 4
    const headerRow = worksheet.addRow([
      'Student Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Final Average', 'Status/Remarks'
    ]);

    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

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
      { width: 25 }, // Status/Remarks
    ];

    const parseGrade = (gradeString) => {
      const num = parseFloat(gradeString);
      if (isNaN(num)) {
        return 'N/A'; // If parsing results in NaN, return 'N/A'
      } else {
        return parseFloat(num.toFixed(2)); // Otherwise, round to 2 decimal places and return as a number
      }
    };

    // Check if student has complete grades
    const hasCompleteGrades = (student) => {
      if (!student.classes || student.classes.length === 0) return false;
      
      return QUARTERS.every(quarter => {
        return student.classes.every(cls => 
          cls.grades && 
          cls.grades[quarter] !== undefined && 
          cls.grades[quarter] !== null && 
          !isNaN(parseFloat(cls.grades[quarter]))
        );
      });
    };

    // Determine remarks based on final average
    const getRemarks = (finalAverage, isComplete) => {
      if (!isComplete) return 'Incomplete Grades';
      
      if (finalAverage === 'N/A') return 'Incomplete Grades';
      
      const numAverage = parseFloat(finalAverage);
      if (isNaN(numAverage)) return 'Incomplete Grades';
      
      return numAverage >= 85 ? 'PASSED' : 'FAILED';
    };

    let counter = 1;
    // Add student data
    grades.forEach(student => {
      const finalAverage = parseGrade(calculateFinalAverage(student.quarterAverages));
      const isComplete = hasCompleteGrades(student);
      const remarks = getRemarks(finalAverage, isComplete);
      
      const dataRow = worksheet.addRow([
        `${counter}. ${student.studentName}`,
        parseGrade(student.quarterAverages.Q1),
        parseGrade(student.quarterAverages.Q2),
        parseGrade(student.quarterAverages.Q3),
        parseGrade(student.quarterAverages.Q4),
        finalAverage,
        remarks
      ]);
      counter++;

      dataRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
        if (colNumber === 1) { // For the first column (Student Name with counter)
          const nameParts = cell.value.split('. ');
          if (nameParts.length === 2) {
            cell.value = {
              richText: [
                { text: nameParts[0] + '. ', font: { bold: true }, alignment: { horizontal: 'left' } },
                { text: nameParts[1], alignment: { horizontal: 'center' } }
              ]
            };
          }
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });

      // Apply conditional formatting to final average
      applyGradeColorFormatting(dataRow.getCell(6), finalAverage);
      
      // Apply conditional formatting to status/remarks cell
      applyRemarksFormatting(dataRow.getCell(7), remarks);

      // Add light borders to data cells
      applyDataRowStyles(dataRow);
    });
    const generatedRow = worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    generatedRow.eachCell((cell) => {
      cell.font = { italic: true };
    });
  };

  // Add this new helper function for remarks formatting
  const applyRemarksFormatting = (cell, remarks) => {
    if (remarks === 'PASSED') {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD4EDDA' } // Light green
      };
      cell.font = { bold: true, color: { argb: 'FF28A745' } };
    } else if (remarks === 'FAILED') {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8D7DA' } // Light red
      };
      cell.font = { bold: true, color: { argb: 'FFDC3545' } };
    } else if (remarks === 'Incomplete Grades') {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF3CD' } // Light yellow
      };
      cell.font = { color: { argb: 'FFD6B327' } };
    }
  };

  // Create honors worksheet
  const createHonorsWorksheet = (workbook, grades, section, selectedFilter) => {
    const honorsWorksheet = workbook.addWorksheet('Honors List');

    honorsWorksheet.columns = [
      { width: 5 },    // Column A - narrow for row numbers
      { width: 20 },   // Column B
      { width: 20 },   // Column C
      { width: 20 },   // Column D
    ];

    // Header rows
    honorsWorksheet.mergeCells('A1:D1');
    honorsWorksheet.getCell('A1').value = 'Department of Education';

    honorsWorksheet.mergeCells('A2:D2');
    honorsWorksheet.getCell('A2').value = 'Region V';

    honorsWorksheet.mergeCells('A3:D3');
    honorsWorksheet.getCell('A3').value = 'Division of Camarines Sur';

    honorsWorksheet.mergeCells('A4:D4');
    honorsWorksheet.getCell('A4').value = 'Goa District';

    honorsWorksheet.mergeCells('A5:D5');
    honorsWorksheet.getCell('A5').value = 'GOA SCIENCE HIGH SCHOOL';

    honorsWorksheet.mergeCells('A6:D6');
    honorsWorksheet.getCell('A6').value = section?.schoolYear;

    honorsWorksheet.mergeCells('A7:D7');
    // Add empty row
    honorsWorksheet.addRow([]);

    // Title row
    honorsWorksheet.mergeCells('A8:D8');
    honorsWorksheet.getCell('A8').value = `${selectedFilter === 'overall' ? 'Overall' : selectedFilter} Period Honors List`;

    honorsWorksheet.mergeCells('A9:D9');
    honorsWorksheet.getCell('A9').value = `Grade ${section?.gradeLevel} - ${section?.name} `;

    honorsWorksheet.addRow([]);


    // Style the cells - alignment and fonts only, no borders
    for (let i = 1; i <= 9; i++) {
      const cell = honorsWorksheet.getCell(`A${i}`);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Special styling for the school name (bold)
      if (i === 5) {
        cell.font = { bold: true };
      }

      // Special styling for the title (bold and size 14)
      if (i === 8) {
        cell.font = { bold: true, size: 14 };
      }
    }

    // Add headers
    const honorsHeaderRow = honorsWorksheet.addRow([
      'Honor Category', 'Student Name', 'Average', 'Complete Grades'
    ]);

    honorsHeaderRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Style the header row for honors
    applyHeaderStyles(honorsHeaderRow);

    // Set column widths
    honorsWorksheet.columns = [
      { width: 25 }, // Honor Category
      { width: 30 }, // Student Name
      { width: 15 }, // Average
      { width: 15 }, // Complete Grades
    ];

    const parseGrade = (gradeString) => {
      const num = parseFloat(gradeString);
      if (isNaN(num)) {
        return 'N/A'; // If parsing results in NaN, return 'N/A'
      } else {
        return parseFloat(num.toFixed(2)); // Otherwise, round to 2 decimal places and return as a number
      }
    };

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
          parseGrade(average),
          isComplete ? 'Yes' : 'No'
        ]);

        // Iterate over each cell in the new row and apply centering
        dataRow.eachCell({ includeEmpty: true }, function (cell) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Apply honor category color
        applyHonorCategoryColor(dataRow.getCell(1), honor);

        // Add light borders to data cells
        applyDataRowStyles(dataRow);

        rowCount++;
      });
    });
    const generatedRow = honorsWorksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    generatedRow.eachCell((cell) => {
      cell.font = { italic: true };
    });
  };

  // Create details worksheet with subjects as columns
  const createDetailsWorksheet = (workbook, grades, section) => {
    const detailsWorksheet = workbook.addWorksheet('Student Details');

    // Get all unique subjects across all students
    const allSubjects = new Set();
    grades.forEach(student => {
      if (student.classes && student.classes.length > 0) {
        student.classes.forEach(cls => {
          allSubjects.add(cls.className);
        });
      }
    });

    // Convert Set to sorted Array
    const subjectList = Array.from(allSubjects).sort();

    // Calculate total columns needed: 1 for names + (5 columns per subject)
    const totalColumns = 1 + (subjectList.length * 5);

    // Create column letter for the last column (e.g., A, B, ..., Z, AA, AB, etc.)
    const getColumnLetter = (columnIndex) => {
      let temp, letter = '';
      while (columnIndex > 0) {
        temp = (columnIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        columnIndex = (columnIndex - temp - 1) / 26;
      }
      return letter;
    };

    const lastColumnLetter = getColumnLetter(totalColumns);

    // Set up column widths
    const columnWidths = [{ width: 30 }]; // First column for student names
    for (let i = 0; i < subjectList.length; i++) {
      // For each subject: Q1, Q2, Q3, Q4, Final Grade - all with same width
      for (let j = 0; j < 5; j++) {
        columnWidths.push({ width: 8 });
      }
    }
    detailsWorksheet.columns = columnWidths;

    // Header rows - now dynamically spanning to the last column
    detailsWorksheet.mergeCells(`A1:${lastColumnLetter}1`);
    detailsWorksheet.getCell('A1').value = 'Department of Education';

    detailsWorksheet.mergeCells(`A2:${lastColumnLetter}2`);
    detailsWorksheet.getCell('A2').value = 'Region V';

    detailsWorksheet.mergeCells(`A3:${lastColumnLetter}3`);
    detailsWorksheet.getCell('A3').value = 'Division of Camarines Sur';

    detailsWorksheet.mergeCells(`A4:${lastColumnLetter}4`);
    detailsWorksheet.getCell('A4').value = 'Goa District';

    detailsWorksheet.mergeCells(`A5:${lastColumnLetter}5`);
    detailsWorksheet.getCell('A5').value = 'GOA SCIENCE HIGH SCHOOL';

    detailsWorksheet.mergeCells(`A6:${lastColumnLetter}6`);
    detailsWorksheet.getCell('A6').value = section?.schoolYear;

    detailsWorksheet.mergeCells(`A7:${lastColumnLetter}7`);
    // Add empty row
    detailsWorksheet.addRow([]);

    // Title row - now dynamically spanning to the last column
    detailsWorksheet.mergeCells(`A8:${lastColumnLetter}8`);
    detailsWorksheet.getCell('A8').value = `Summary of Grades`;

    detailsWorksheet.mergeCells(`A9:${lastColumnLetter}9`);
    detailsWorksheet.getCell('A9').value = `Grade ${section?.gradeLevel} - ${section?.name} `;

    detailsWorksheet.addRow([]);

    // Style the cells - alignment and fonts only, no borders
    for (let i = 1; i <= 9; i++) {
      const cell = detailsWorksheet.getCell(`A${i}`);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Special styling for the school name (bold)
      if (i === 5) {
        cell.font = { bold: true };
      }

      // Special styling for the title (bold and size 14)
      if (i === 8) {
        cell.font = { bold: true, size: 14 };
      }
    }

    // Create header row for subjects (first level header)
    const subjectHeaderRow = ['NAMES OF STUDENTS'];
    subjectList.forEach(subject => {
      // Add subject name and merge 5 cells
      subjectHeaderRow.push(subject, '', '', '', '');
    });

    detailsWorksheet.addRow(subjectHeaderRow);

    // Merge cells for each subject header
    let colIndex = 2; // Start from column B (index 2 in Excel)
    subjectList.forEach(() => {
      const startCol = colIndex;
      const endCol = colIndex + 4;
      detailsWorksheet.mergeCells(11, startCol, 11, endCol); // Row 11, columns startCol to endCol
      colIndex = endCol + 1;
    });

    // Create header row for QUARTER and FINAL GRADE
    const quarterHeaderRow = [''];
    subjectList.forEach(() => {
      quarterHeaderRow.push('QUARTER', '', '', '', 'AVG');
    });
    detailsWorksheet.addRow(quarterHeaderRow);

    // Merge cells for QUARTER header
    colIndex = 2;
    subjectList.forEach(() => {
      detailsWorksheet.mergeCells(12, colIndex, 12, colIndex + 3); // Merge QUARTER cells
      colIndex += 5; // Move to next subject
    });

    // Create header row for quarter numbers
    const quarterNumRow = [''];
    subjectList.forEach(() => {
      quarterNumRow.push(1, 2, 3, 4, '');
    });
    detailsWorksheet.addRow(quarterNumRow);

    // Merge FINAL GRADE cells vertically with the empty cell below
    colIndex = 6; // Start at column F (assuming first subject FINAL GRADE is here)
    subjectList.forEach(() => {
      detailsWorksheet.mergeCells(12, colIndex, 13, colIndex); // Merge FINAL GRADE cell with cell below it
      colIndex += 5; // Move to next subject's FINAL GRADE column
    });

    // Merge the "NAMES OF STUDENTS" cell vertically to span all three header rows
    detailsWorksheet.mergeCells(11, 1, 13, 1);

    // Style all header rows
    for (let row = 11; row <= 13; row++) {
      const headerRow = detailsWorksheet.getRow(row);
      headerRow.eachCell({ includeEmpty: true }, cell => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6E6' }
        };
      });
    }

    const parseGrade = (gradeString) => {
      const num = parseFloat(gradeString);
      if (isNaN(num)) {
        return '-'; // If parsing results in NaN, return '-'
      } else {
        return parseFloat(num.toFixed(2)); // Otherwise, round to 2 decimal places and return as a number
      }
    };

    let counter = 1;
    // Add student data rows
    grades.forEach(student => {
      const rowData = [`${counter}. ${student.studentName}`];
      counter++;

      // For each subject in our list
      subjectList.forEach(subjectName => {
        // Find if this student has this subject
        const subjectClass = student.classes?.find(cls => cls.className === subjectName);

        if (subjectClass) {
          // Add grades for this subject
          rowData.push(
            parseGrade(subjectClass.grades.Q1) || '',
            parseGrade(subjectClass.grades.Q2) || '',
            parseGrade(subjectClass.grades.Q3) || '',
            parseGrade(subjectClass.grades.Q4) || '',
            parseGrade(subjectClass.average) || ''
          );
        } else {
          // Student doesn't take this subject
          rowData.push('', '', '', '', '');
        }
      });

      const dataRow = detailsWorksheet.addRow(rowData);

      // Style data row
      dataRow.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        // Center-align grade cells, but left-align the name
        if (cell.col > 1) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
    });

    const generatedRow = detailsWorksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
    generatedRow.eachCell((cell) => {
      cell.font = { italic: true };
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