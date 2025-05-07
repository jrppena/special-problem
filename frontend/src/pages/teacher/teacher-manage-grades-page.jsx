import React, { useState, useEffect } from "react";
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import { useConfigStore } from "../../store/useConfigStore";
import { useSectionStore } from "../../store/useSectionStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useTeacherStore } from "../../store/useTeacherStore";
import { Edit2, Save, Download, Upload, FileDown, Loader, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Pagination from "../../components/pagination";

const TeacherManageGradesPage = () => {
  // Add ConfigStore for school years
  const { fetchSchoolYears, isGettingSchoolYears, fetchCurrentSchoolYear, currentSchoolYear } = useConfigStore();

  // States for school years and loading
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSchoolYearState, setCurrentSchoolYearState] = useState(currentSchoolYear);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});
  const [isSaveAllEnabled, setIsSaveAllEnabled] = useState(false);
  const [sectionsTeaching, setSectionsTeaching] = useState([]);

  // Sorting state
  const [sortByStudentLastName, setSortByStudentLastName] = useState("No Filter");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page
  const [isShowingAll, setIsShowingAll] = useState(false); // Show all toggle

  const { assignedClasses, getAssignedClasses, classGrades, getClassGrades, updateStudentGrades } = useTeacherStore();
  const { authUser } = useAuthStore();

  // Fetch school years on component mount
  useEffect(() => {
    const getSchoolYears = async () => {
      try {
        const years = await fetchSchoolYears();
        const currentSchoolYear = await fetchCurrentSchoolYear();// Default to first year if current year is not set
        if (years && years.length > 0) {
          setSchoolYears(years);
          setSelectedSchoolYear(years[0]); // Set first school year as default
          setIsLoading(false);
          setCurrentSchoolYearState(currentSchoolYear);
        }
      } catch (error) {
        console.error("Error fetching school years:", error);
        toast.error("Failed to load school years");
        setIsLoading(false);
      }
    };

    getSchoolYears();
  }, [fetchSchoolYears]);

  // Fetch assigned classes when school year changes
  useEffect(() => {
    if (selectedSchoolYear && authUser?._id) {
      getAssignedClasses(authUser._id, selectedSchoolYear);
      setSelectedClass(null);
      setSelectedSection(null);
    }
  }, [selectedSchoolYear, authUser?._id, getAssignedClasses]);

  useEffect(() => {
    if (assignedClasses.length > 0) {
      const defaultClass = assignedClasses[0];
      setSelectedClass(defaultClass);
      setSelectedSection(defaultClass.sections[0] || null);
    } else {
      setSelectedClass(null);
      setSelectedSection(null);
    }
  }, [assignedClasses]);

  useEffect(() => {
    if (selectedSection && selectedClass && selectedSchoolYear && assignedClasses.length > 0) {
      getClassGrades(selectedClass._id, "all", selectedSection._id, selectedSchoolYear);
    }
  }, [selectedClass, selectedSection, assignedClasses, getClassGrades]);

  useEffect(() => {
    if (selectedSection && selectedSection.students) {
      const initialGrades = selectedSection.students.reduce((acc, student) => {
        acc[student._id] = classGrades[student._id] || {};
        return acc;
      }, {});
      setEditedGrades(initialGrades);
    }
  }, [selectedSection, classGrades]);

  const handleGradeChange = (studentId, quarter, value) => {
    const normalizedValue = value.trim() === "" ? "-" : value;

    setEditedGrades(prevGrades => ({
      ...prevGrades,
      [studentId]: {
        ...prevGrades[studentId],
        [quarter]: normalizedValue,
      },
    }));

    // Check if any grades have been modified (by comparing the current grades with original ones)
    const hasChanges = Object.entries(editedGrades).some(([studentId, grades]) =>
      Object.entries(grades).some(([q, val]) => {
        const originalValue = classGrades[studentId]?.[q] || "-";
        return val !== originalValue;
      })
    );

    setIsSaveAllEnabled(hasChanges);
  };

  const handleSaveAllGrades = async () => {
    const hasChanges = Object.entries(editedGrades).some(([studentId, grades]) =>
      Object.entries(grades).some(([quarter, value]) => {
        const originalValue = classGrades[studentId]?.[quarter] || "-";
        const normalizedValue = typeof value === "string" && value.trim() === "" ? "-" : value;
        return normalizedValue !== originalValue;
      })
    );

    if (!hasChanges) {
      toast.error("No changes detected. Please modify grades before saving.");
      return;
    }

    const hasInvalidGrades = Object.entries(editedGrades).some(([studentId, grades]) =>
      Object.entries(grades).some(([quarter, value]) => {
        const gradeNum = parseFloat(value);
        return !isNaN(gradeNum) && (gradeNum > 100 || gradeNum < 75);
      }
      ));

    if (hasInvalidGrades) {
      toast.error("Grades must be between 75 and 100.");
      return;
    }

    const hasBlankExistingGrades = Object.entries(editedGrades).some(([studentId, grades]) =>
      Object.entries(grades).some(([quarter, value]) => {
        const originalValue = classGrades[studentId]?.[quarter] || "-";
        return !isNaN(parseFloat(originalValue)) && (value === "" || value === "-");
      })
    );

    if (hasBlankExistingGrades) {
      toast.error("Existing grades cannot be left blank. Please enter a grade between 75 and 100.");
      return;
    }

    try {
      const response = await updateStudentGrades(selectedClass, editedGrades, selectedSection);
      setEditMode(false);
      setIsSaveAllEnabled(false);
 
    } catch (error) {
      toast.error("Failed to save all grades.");
      console.log("Error saving grades:", error);
    }
  };

  const handleEditMode = () => {
    setEditMode(prev => !prev);
    if (editMode) {
      setEditedGrades(classGrades); // Reset to original grades if exiting edit mode
      setIsSaveAllEnabled(false);
    }
  };

  // Sorting options for students (sorted by lastName)
  const sortingOptions = ["No Filter", "Ascending", "Descending"];

  const sortStudents = (students) => {
    let sortedStudents = [...students];
    if (sortByStudentLastName === "Ascending") {
      sortedStudents.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (sortByStudentLastName === "Descending") {
      sortedStudents.sort((a, b) => b.lastName.localeCompare(a.lastName));
    }
    return sortedStudents;
  };

  const quarterOptions = [
    { value: "Q1", label: "Quarter 1" },
    { value: "Q2", label: "Quarter 2" },
    { value: "Q3", label: "Quarter 3" },
    { value: "Q4", label: "Quarter 4" },
    { value: "all", label: "All Quarters" },
  ];

  // Pagination Logic for Students
  const paginatedStudents = isShowingAll
    ? sortStudents(selectedSection?.students || []) // Always sort students if showing all
    : (selectedSection?.students ? sortStudents(selectedSection.students) : []).slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const handleDownloadTemplate = async () => {
    if (!selectedSection) {
      toast.error("Please select a section first.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Grades Template");

    // Header Row
    const headers = ["Student ID", "First Name", "Last Name", "Q1", "Q2", "Q3", "Q4"];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };

    // Populate student list
    selectedSection.students.forEach((student) => {
      sheet.addRow([
        student._id,
        student.firstName,
        student.lastName,
        "", // Empty for grades input
        "",
        "",
        "",
      ]);
    });

    // Auto-adjust column width based on the longest value in each column
    sheet.columns.forEach((column, index) => {
      let maxLength = headers[index].length; // Start with header length
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          maxLength = Math.max(maxLength, cellLength);
        }
      });
      column.width = maxLength + 2; // Add some padding
    });

    // Generate the file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Grades_Template_${selectedClass.subjectName}_Grade${selectedClass.gradeLevel}_${selectedSection.name}.xlsx`;
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);

    toast.success("Template downloaded successfully.");
  };

  /**
   * Download current grades to Excel file
   */
  const handleDownloadGrades = async () => {
    if (!selectedSection) {
      toast.error("Please select a section first.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Class Grades");

      sheet.columns = [
        { width: 5 },    // Column A - narrow for row numbers
        { width: 20 },   // Column B
        { width: 20 },   // Column C
        { width: 20 },   // Column D
        { width: 20 },   // Column E
        { width: 20 },   // Column F
        { width: 20 },   // Column G

      ];

      // Header rows
      sheet.mergeCells('A1:G1');
      sheet.getCell('A1').value = 'Department of Education';

      sheet.mergeCells('A2:G2');
      sheet.getCell('A2').value = 'Region V';

      sheet.mergeCells('A3:G3');
      sheet.getCell('A3').value = 'Division of Camarines Sur';

      sheet.mergeCells('A4:G4');
      sheet.getCell('A4').value = 'Goa District';

      sheet.mergeCells('A5:G5');
      sheet.getCell('A5').value = 'GOA SCIENCE HIGH SCHOOL';

      sheet.mergeCells('A6:G6');
      sheet.getCell('A6').value = selectedSection?.schoolYear;

      sheet.mergeCells('A7:G7');
      // Add empty row
      sheet.addRow([]);

      // Title row
      sheet.mergeCells('A8:G8');
      sheet.getCell('A8').value = `${selectedClass.subjectName} - ${selectedClass.gradeLevel} Class Grades`;

      sheet.mergeCells('A9:G9');
      sheet.getCell('A9').value = `Grade ${selectedSection?.gradeLevel} - ${selectedSection?.name}`;

      sheet.addRow([]);

      // Style the cells - alignment and fonts only, no borders
      for (let i = 1; i <= 9; i++) {
        const cell = sheet.getCell(`A${i}`);
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

      // Header Row
      const headers = ["Student ID", "First Name", "Last Name", "Q1", "Q2", "Q3", "Q4"];
      const headerRow = sheet.addRow(headers);
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.font = { bold: true };

      // Style headers
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' } // Light gray background
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Populate with student data and grades
      const sortedStudents = sortStudents(selectedSection.students);
      sortedStudents.forEach((student) => {
        const studentGrades = classGrades[student._id] || {};
        const row = sheet.addRow([
          student._id,
          student.firstName,
          student.lastName,
          studentGrades.Q1 || "-",
          studentGrades.Q2 || "-",
          studentGrades.Q3 || "-",
          studentGrades.Q4 || "-",
        ]);
        row.alignment = { horizontal: 'center', vertical: 'middle' };

        // Add light border to each cell
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Auto-adjust column width for better readability
      sheet.columns.forEach((column, index) => {
        let maxLength = headers[index].length;
        column.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.value) {
            const cellLength = cell.value.toString().length;
            maxLength = Math.max(maxLength, cellLength);
          }
        });
        column.width = maxLength + 2;
      });

      const generatedRow = sheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`]);
      generatedRow.eachCell((cell) => {
        cell.font = { italic: true };
      });

      // Generate and save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Current_Grades_${selectedClass.subjectName}_Grade${selectedClass.gradeLevel}_${selectedSection.name}.xlsx`;
      saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);

      toast.success("Grades downloaded successfully.");
    } catch (error) {
      console.error("Error downloading grades:", error);
      toast.error("Failed to download grades.");
    }
  };

  /**
   * Upload and Process Filled Excel File
   */
  const handleUploadGrades = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      toast.error("No file selected.");
      return;
    }

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);
        const sheet = workbook.worksheets[0];

        const rows = sheet.getSheetValues();
        const newGrades = {};

        // Validate Headers
        const expectedHeaders = ["Student ID", "First Name", "Last Name", "Q1", "Q2", "Q3", "Q4"];
        const fileHeaders = rows[1]?.slice(1, 8) || [];
        if (JSON.stringify(fileHeaders) !== JSON.stringify(expectedHeaders)) {
          toast.error("Invalid file format. Please use the correct template.");
          return;
        }

        // Process student grades
        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue

          const studentId = row[1];
          const grades = {
            Q1: row[4]?.toString() || "-",
            Q2: row[5]?.toString() || "-",
            Q3: row[6]?.toString() || "-",
            Q4: row[7]?.toString() || "-",
          };

          // Validate grades (must be numbers between 0-100 or "-")
          for (const quarter in grades) {
            if (grades[quarter] !== "-" && (isNaN(grades[quarter]) || grades[quarter] < 75 || grades[quarter] > 100)) {
              toast.error(`Invalid grade for Student ID ${studentId} in ${quarter}. Must be between 75-100.`);
              return;
            }
          }

          newGrades[studentId] = grades;
        }

        // Update state with new grades
        setEditedGrades(newGrades);
        try {
          const response = await updateStudentGrades(selectedClass, newGrades, selectedSection);
          setEditMode(false);
          setIsSaveAllEnabled(false);
        } catch (error) {
          toast.error("Failed to save all grades.");
          console.log("Error saving grades:", error);
        } finally {
          event.target.value = "";

        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to upload grades. Ensure the file format is correct.");
    }
  };

  // If loading, show loader
  if (isGettingSchoolYears || isLoading) {
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
        <PageHeader title="Manage Student Grades" />
        <div className="bg-white p-6 rounded-lg shadow mt-5">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <Dropdown
            label="School Year"
            options={schoolYears}
            selected={selectedSchoolYear || ""}
            setSelected={(year) => {
              setSelectedSchoolYear(year);
            }}
          />
        </div>

        {assignedClasses.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 text-center text-gray-500">
            You have no assigned classes for the selected school year.
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Dropdown
                  label="Class"
                  options={assignedClasses.map(
                    (c) => `${c.subjectName} - Grade ${c.gradeLevel}`
                  )}
                  selected={
                    selectedClass
                      ? `${selectedClass.subjectName} - Grade ${selectedClass.gradeLevel}`
                      : ""
                  }
                  setSelected={(classLabel) => {
                    const newSelectedClass = assignedClasses.find(
                      (c) =>
                        `${c.subjectName} - Grade ${c.gradeLevel}`.trim() === classLabel.trim()
                    );
                    setSelectedClass(newSelectedClass);
                    // Update selectedSection to the first section of the new class (if available)
                    setSelectedSection(newSelectedClass?.sections[0] || null);
                  }}
                />

                {selectedClass && (
                  <>
                    <Dropdown
                      label="Sections"
                      options={selectedClass.sections.map((s) => `${s.gradeLevel}-${s.name}`)}
                      selected={selectedSection ? `${selectedSection.gradeLevel}-${selectedSection.name}` : ""}
                      setSelected={(formattedName) => {
                        const [gradeLevel, sectionName] = formattedName.split("-");

                        // Find the section object that matches both gradeLevel and name
                        const newSelectedSection = selectedClass.sections.find(
                          (s) => s.gradeLevel == gradeLevel && s.name === sectionName
                        );

                        // If newSelectedSection is found, set it as the selected section
                        if (newSelectedSection) {
                          setSelectedSection(newSelectedSection);
                        } else {
                          console.error("Section not found:", formattedName);
                        }
                      }}
                    />

                    <Dropdown
                      label="Quarter"
                      options={quarterOptions.map((q) => q.label)}
                      selected={quarterOptions.find((q) => q.value === selectedQuarter)?.label || "All Quarters"}
                      setSelected={(quarter) =>
                        setSelectedQuarter(quarterOptions.find((q) => q.label === quarter)?.value || "all")
                      }
                    />
                    {/* Sorting */}
                    <Dropdown
                      label="Sort by Last Name"
                      options={sortingOptions}
                      selected={sortByStudentLastName}
                      setSelected={setSortByStudentLastName}
                    />
                  </>
                )}
              </div>
            </div>

            {selectedSection ? (
              <div className="bg-white p-6 rounded-lg shadow mt-5">
                <h3 className="text-xl font-semibold mb-4">Grades Management</h3>
                <div className="flex justify-start gap-4 mb-4">
                  {selectedSchoolYear == currentSchoolYearState ? (
                    <button
                      onClick={handleDownloadTemplate}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  ) : (
                    <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      You can only edit classes for the current school year
                    </div>
                  )}

                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                        {selectedQuarter === "all" ? (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Q1</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Q2</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Q3</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Q4</th>
                          </>
                        ) : (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Grade ({selectedQuarter})
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.firstName} {student.lastName}
                          </td>
                          {selectedQuarter === "all" ? (
                            <>
                              {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                                <td key={quarter} className="px-6 py-4 whitespace-nowrap">
                                  {editMode ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="border border-gray-300 rounded px-2 py-1 w-20"
                                      value={editedGrades[student._id]?.[quarter] ?? ""}
                                      onChange={(e) => handleGradeChange(student._id, quarter, e.target.value)}
                                      placeholder="—"
                                    />
                                  ) : (
                                    <span className="text-gray-700">{classGrades[student._id]?.[quarter] || "—"}</span>
                                  )}
                                </td>
                              ))}
                            </>
                          ) : (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editMode ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="border border-gray-300 rounded px-2 py-1 w-20"
                                  value={editedGrades[student._id]?.[selectedQuarter] ?? ""}
                                  onChange={(e) => handleGradeChange(student._id, selectedQuarter, e.target.value)}
                                  placeholder="—"
                                />
                              ) : (
                                <span className="text-gray-700">{classGrades[student._id]?.[selectedQuarter] || "—"}</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <Pagination
                  totalItems={selectedSection.students?.length || 0}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  isShowingAll={isShowingAll}
                  setIsShowingAll={setIsShowingAll}
                />
                  <div className="flex justify-start mt-4 gap-4">
                    {selectedSchoolYear == currentSchoolYearState && (
                      <>
                        <button
                          onClick={handleEditMode}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          {editMode ? "Cancel Edit" : "Edit Grades"}
                        </button>

                        {/* Upload Grades Button */}
                        <label className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Upload Grades
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleUploadGrades}
                          />
                        </label>

                        {editMode && isSaveAllEnabled && (
                          <button
                            onClick={handleSaveAllGrades}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                        )}
                      </>
                    )}

                    {/* Download Current Grades Button */}
                    <button
                      onClick={handleDownloadGrades}
                      className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-1"
                    >
                      <FileDown className="w-4 h-4" />
                      Download Current Grades
                    </button>
                  </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-6">No sections found for the selected class.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherManageGradesPage;