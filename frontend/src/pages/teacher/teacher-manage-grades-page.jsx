import React, { useState, useEffect } from "react";
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import { schoolYears } from "../../constants";
import { useSectionStore } from "../../store/useSectionStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useTeacherStore } from "../../store/useTeacherStore";
import { Edit2, Save } from "lucide-react";
import toast from "react-hot-toast";

const TeacherManageGradesPage = () => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(schoolYears[0].name);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [editMode, setEditMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});
  const [isSaveAllEnabled, setIsSaveAllEnabled] = useState(false);

  // Sorting state
  const [sortByStudentLastName, setSortByStudentLastName] = useState("No Filter");

  const { assignedClasses, getAssignedClasses, classGrades, getClassGrades, updateStudentGrades } = useTeacherStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getAssignedClasses(authUser._id, selectedSchoolYear);
  }, [selectedSchoolYear, authUser._id]);

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
    if (selectedSection) {
      getClassGrades(selectedClass._id, "all", selectedSection);
    }
  }, [selectedClass, selectedSection, getClassGrades]);

  useEffect(() => {
    if (selectedSection) {
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
      console.log(response);
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

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <PageHeader title="Manage Student Grades" />
        <div className="bg-white p-6 rounded-lg shadow mt-5">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <Dropdown
            label="School Year"
            options={schoolYears.map((year) => year.name)}
            selected={selectedSchoolYear}
            setSelected={setSelectedSchoolYear}
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
                  options={assignedClasses.map((c) => c.subjectName)}
                  selected={selectedClass?.subjectName}
                  setSelected={(className) =>
                    setSelectedClass(assignedClasses.find((c) => c.subjectName === className))
                  }
                />
                {selectedClass && (
                  <>
                    <Dropdown
                      label="Section"
                      options={selectedClass.sections.map((s) => `${s.gradeLevel}-${s.name}`)}
                      selected={selectedSection ? `${selectedSection.gradeLevel}-${selectedSection.name}` : ""}
                      setSelected={(formattedName) => {
                        const [gradeLevel, sectionName] = formattedName.split("-");
                        setSelectedSection(
                          selectedClass.sections.find((s) => s.gradeLevel === gradeLevel && s.name === sectionName)
                        );
                      }}
                    />
                    <Dropdown
                      label="Quarter"
                      options={quarterOptions.map((q) => q.label)}
                      selected={quarterOptions.find((q) => q.value === selectedQuarter).label}
                      setSelected={(quarter) =>
                        setSelectedQuarter(quarterOptions.find((q) => q.label === quarter).value)
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
                      {sortStudents(selectedSection.students).map((student) => (
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

                <div className="flex justify-start mt-4 gap-4">
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
