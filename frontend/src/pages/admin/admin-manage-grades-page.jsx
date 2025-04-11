import React, { useState, useEffect } from "react";
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import { useTeacherStore } from "../../store/useTeacherStore";
import { useClassStore } from "../../store/useClassStore";
import { useConfigStore } from "../../store/useConfigStore";
import { Edit2, Save, Download, Upload, FileDown, Loader } from "lucide-react";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Pagination from "../../components/pagination";

const AdminManageGradesPage = () => {
  // States - all defined at the top before any conditionals
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});
  const [isSaveAllEnabled, setIsSaveAllEnabled] = useState(false);
  const [sectionsTeaching, setSectionsTeaching] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortByStudentLastName, setSortByStudentLastName] = useState("No Filter");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("All Grades");

  // Store hooks
  const { classGrades, getClassGrades, updateStudentGrades } = useTeacherStore();
  const { classes, fetchClasses } = useClassStore();
  const { fetchSchoolYears, isGettingSchoolYears } = useConfigStore();
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [gradeLevels, setGradeLevels] = useState(["All Grades"]);

  // Fetch school years on component mount
  useEffect(() => {
    const getSchoolYears = async () => {
      try {
        const years = await fetchSchoolYears();
        if (years && years.length > 0) {
          setSchoolYears(years);
          setSelectedSchoolYear(years[0]); // Set first school year as default
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching school years:", error);
        toast.error("Failed to load school years");
        setIsLoading(false);
      }
    };
    
    getSchoolYears();
  }, [fetchSchoolYears]);

  // Fetch classes when school year changes
  useEffect(() => {
    if (selectedSchoolYear) {
      fetchClasses(selectedSchoolYear);
    }
  }, [selectedSchoolYear, fetchClasses]);

  // Extract unique grade levels from classes for filter dropdown
  useEffect(() => {
    if (classes && classes.length > 0) {
      const uniqueGradeLevels = ["All Grades", ...new Set(classes.map(c => c.gradeLevel.toString()))];
      // Sort grade levels numerically
      uniqueGradeLevels.sort((a, b) => {
        if (a === "All Grades") return -1;
        if (b === "All Grades") return 1;
        return parseInt(a) - parseInt(b);
      });
      setGradeLevels(uniqueGradeLevels);
    }
  }, [classes]);

  // Filter classes by selected grade level
  useEffect(() => {
    if (classes && classes.length > 0) {
      if (selectedGradeLevel === "All Grades") {
        setFilteredClasses(classes);
      } else {
        const filtered = classes.filter(c => c.gradeLevel.toString() === selectedGradeLevel);
        setFilteredClasses(filtered);
      }
    } else {
      setFilteredClasses([]);
    }
  }, [classes, selectedGradeLevel]);

  // Set default class and section when filtered classes are updated
  useEffect(() => {
    if (filteredClasses && filteredClasses.length > 0) {
      const defaultClass = filteredClasses[0];
      setSelectedClass(defaultClass);
      setSelectedSection(defaultClass.sections && defaultClass.sections.length > 0 
        ? defaultClass.sections[0] 
        : null);
    } else {
      setSelectedClass(null);
      setSelectedSection(null);
    }
  }, [filteredClasses]);

  // Get class grades when section changes
  useEffect(() => {
    if (selectedSection && selectedClass && selectedSchoolYear) {
      getClassGrades(selectedClass._id, "all", selectedSection._id, selectedSchoolYear);
    }
  }, [selectedClass, selectedSection, getClassGrades, selectedSchoolYear]);

  // Initialize edited grades based on class grades
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
  
  setEditedGrades(prevGrades => {
    const updatedGrades = {
      ...prevGrades,
      [studentId]: {
        ...prevGrades[studentId],
        [quarter]: normalizedValue,
      },
    };

    // Check if any grades have been modified
    const hasChanges = Object.entries(updatedGrades).some(([sid, grades]) => 
      Object.entries(grades).some(([q, val]) => {
        const originalValue = classGrades[sid]?.[q] || "-";
        return val !== originalValue;
      })
    );

    setIsSaveAllEnabled(hasChanges);

    return updatedGrades;
  });
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
        return !isNaN(gradeNum) && (gradeNum > 100 || gradeNum < 0);
      })
    );

    if (hasInvalidGrades) {
      toast.error("Grades must be between 0 and 100.");
      return;
    }

    const hasBlankExistingGrades = Object.entries(editedGrades).some(([studentId, grades]) =>
      Object.entries(grades).some(([quarter, value]) => {
        const originalValue = classGrades[studentId]?.[quarter] || "-";
        return !isNaN(parseFloat(originalValue)) && (value === "" || value === "-");
      })
    );

    if (hasBlankExistingGrades) {
      toast.error("Existing grades cannot be left blank. Please enter a valid number.");
      return;
    }

    try {
      const response = await updateStudentGrades(selectedClass, editedGrades, selectedSection);
      setEditMode(false);
      setIsSaveAllEnabled(false);
      toast.success("Grades updated successfully.");
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

  // Handle grade level change
  const handleGradeLevelChange = (level) => {
    setSelectedGradeLevel(level);
    setCurrentPage(1); // Reset to first page when changing grade level
  };

  // Sorting options for students
  const sortingOptions = ["No Filter", "Ascending", "Descending"];

  const sortStudents = (students) => {
    if (!students) return [];
    
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
    ? sortStudents(selectedSection?.students || [])
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
  
    // Auto-adjust column width
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

      // Header Row
      const headers = ["Student ID", "First Name", "Last Name", "Q1", "Q2", "Q3", "Q4"];
      const headerRow = sheet.addRow(headers);
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
      selectedSection.students.forEach((student) => {
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
          if (!row) continue;

          const studentId = row[1];
          const grades = {
            Q1: row[4]?.toString() || "-",
            Q2: row[5]?.toString() || "-",
            Q3: row[6]?.toString() || "-",
            Q4: row[7]?.toString() || "-",
          };

          // Validate grades
          for (const quarter in grades) {
            if (grades[quarter] !== "-" && (isNaN(grades[quarter]) || grades[quarter] < 0 || grades[quarter] > 100)) {
              toast.error(`Invalid grade for Student ID ${studentId} in ${quarter}. Must be between 0-100.`);
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
          toast.success("Grades successfully uploaded.");
        } catch (error) {
          toast.error("Failed to save all grades.");
          console.log("Error saving grades:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to upload grades. Ensure the file format is correct.");
    }
  };

  // If loading, show loader
  if (isGettingSchoolYears) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
                label="School Year"
                options={schoolYears}
                selected={selectedSchoolYear || ""}
                setSelected={(year) => {
                  setSelectedSchoolYear(year);
                  setSelectedGradeLevel("All Grades"); // Reset grade level when school year changes
                }}
            />

            <Dropdown
                label="Grade Level"
                options={gradeLevels}
                selected={selectedGradeLevel}
                setSelected={handleGradeLevelChange}
            />
          </div>
        </div>

        {(!filteredClasses || filteredClasses.length === 0) ? (
          <div className="bg-white p-6 rounded-lg shadow mt-5 text-center text-gray-500">
            {classes && classes.length > 0 ? 
              `No classes found for grade level ${selectedGradeLevel}.` : 
              "No classes found for the selected school year."}
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Dropdown
                  label="Class"
                  options={filteredClasses.map(
                    (c) => `${c.subjectName} - Grade ${c.gradeLevel}`
                  )}
                  selected={
                    selectedClass
                      ? `${selectedClass.subjectName} - Grade ${selectedClass.gradeLevel}`
                      : ""
                  }
                  setSelected={(classLabel) => {
                    const newSelectedClass = filteredClasses.find(
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
                <div className="flex flex-wrap justify-start gap-4 mb-4">
                  <button
                    onClick={handleDownloadTemplate}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  
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

                  {/* Download Current Grades Button */}
                  <button
                    onClick={handleDownloadGrades}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-1"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Current Grades
                  </button>
                  
                  <button
                    onClick={handleEditMode}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    {editMode ? "Cancel Edit" : "Edit Grades"}
                  </button>
                  
                  {editMode && isSaveAllEnabled && (
                    <button
                      onClick={handleSaveAllGrades}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
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

export default AdminManageGradesPage;