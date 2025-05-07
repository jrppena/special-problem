import React, { useState, useEffect } from "react";
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import SearchFilter from "../../components/search-filter";
import Select from "react-select";
import { gradeLevels } from "../../constants";
import { useSectionStore } from "../../store/useSectionStore";
import { useTeacherStore } from "../../store/useTeacherStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useConfigStore } from "../../store/useConfigStore";
import toast from "react-hot-toast";
import { Trash2, FileText, ChevronLeft, ChevronRight, List, Loader } from "lucide-react";
import StudentGradesModal from "./student-grades-modal";
import { useNavigate } from "react-router-dom";
import SectionGradesModal from "./section-grades-modal";
import Pagination from "../../components/pagination";

const TeacherSectionManagementPage = () => {
  // Add ConfigStore for school years
  const { fetchSchoolYears, isGettingSchoolYears,fetchCurrentSchoolYear,currentSchoolYear } = useConfigStore();

  // States for school years and loading
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSchoolYearState, setCurrentSchoolYearState] = useState(null);

  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentGrades, setSelectedStudentGrades] = useState({});
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const navigate = useNavigate();
  const [isSectionGradesModalOpen, setIsSectionGradesModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isShowingAll, setIsShowingAll] = useState(false);

  const { adviserSections, getAdviserSections } = useSectionStore();
  const { availableStudents, getAvailableStudents, addStudentToSection, getSpecificStudentGrades, getAdviserSectionGrades, adviserSectionGrades, removeStudentFromSection } = useTeacherStore();
  const { authUser } = useAuthStore();
  const [modalStudents, setModalStudents] = useState([]);

  // Filters & Sorting
  const [searchStudentName, setSearchStudentName] = useState("");
  const [sortByStudentName, setSortByStudentName] = useState("No Filter");

  const sortingOptions = ["No Filter", "Ascending", "Descending"];

  // Fetch school years on component mount
  useEffect(() => {
    const getSchoolYears = async () => {
      try {
        const years = await fetchSchoolYears();
        const currentSchoolYear = await fetchCurrentSchoolYear();
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

  // Fetch adviser sections when school year changes
  useEffect(() => {
    if (selectedSchoolYear && authUser?._id) {
      getAdviserSections(authUser._id, selectedSchoolYear);
    }
  }, [selectedSchoolYear, authUser]);

  useEffect(() => {
    if (adviserSections && adviserSections.length > 0) {
      setSelectedSection(adviserSections[0]);
    } else {
      setSelectedSection(null);
    }
  }, [adviserSections]);

  useEffect(() => {
    if (isModalOpen && selectedSection) {
      getAvailableStudents(selectedSection.gradeLevel, selectedSchoolYear);
    }
  }, [isModalOpen, selectedSection, selectedSchoolYear]);

  const openModal = () => {
    setModalStudents([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddStudent = async () => {
    if (!modalStudents || modalStudents.length === 0) {
      toast.error("Please select a student.");
      return;
    }
    const data = {
      sectionId: selectedSection._id,
      studentIds: modalStudents.map((student) => student.value),
      schoolYear: selectedSchoolYear,
    };
    const updatedSection = await addStudentToSection(data);
    setSelectedSection(updatedSection);
    closeModal();
  };

  const handleRemoveStudent = async (studentId) => {
    const data = {
      sectionId: selectedSection._id,
      studentId: studentId,
    };
    const updatedSection = await removeStudentFromSection(data);
    if (updatedSection) {
      setSelectedSection(updatedSection);
    }
  };

  // Filter students
  const filterStudents = (students) => {
    let filteredStudents = students;
    if (searchStudentName) {
      filteredStudents = filteredStudents.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchStudentName.toLowerCase())
      );
    }

    return filteredStudents;
  };

  // Sort students
  const sortStudents = (students) => {
    let sortedStudents = [...students];
    if (sortByStudentName === "Ascending") {
      sortedStudents.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
    } else if (sortByStudentName === "Descending") {
      sortedStudents.sort((a, b) => (b.firstName + b.lastName).localeCompare(a.firstName + a.lastName));
    }

    return sortedStudents;
  };

  const handleFilterAndSort = () => {
    let filteredStudents = filterStudents(selectedSection?.students || []);
    return sortStudents(filteredStudents);
  };

  // Get paginated students
  const getPaginatedStudents = () => {
    const filteredAndSortedStudents = handleFilterAndSort();

    if (isShowingAll) {
      return filteredAndSortedStudents;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleViewGrades = async (student) => {
    if (!selectedSection?._id || !selectedSchoolYear) {
      toast.error("Please select a section and school year first");
      return;
    }

    const loadingToast = toast.loading("Fetching student grades...");

    try {
      const grades = await getSpecificStudentGrades(student._id, selectedSection._id, selectedSchoolYear);

      toast.dismiss(loadingToast);

      if (grades && Object.keys(grades).length > 0) {
        setSelectedStudentGrades(grades);
        setSelectedStudentName(`${student.firstName} ${student.lastName}`);
        setIsGradesModalOpen(true);
      } else {
        toast.error("No grades found for this student.");
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to load grades.");
    }
  };

  const showSectionGrades = async () => {
    if (!selectedSection?._id || !selectedSchoolYear) {
      toast.error("Please select a section first");
      return;
    }

    const loadingToast = toast.loading("Fetching section grades...");
    try {
      await getAdviserSectionGrades(selectedSection._id, selectedSchoolYear);
      setIsSectionGradesModalOpen(true);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to load section grades");
    }
  };

  useEffect(() => {
    if (adviserSectionGrades) {
      console.log(adviserSectionGrades);
    }
  }, [adviserSectionGrades]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchStudentName, sortByStudentName]);

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
        <PageHeader title="Section Management" />

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow mt-5">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Dropdown
              label="School Year"
              options={schoolYears}
              selected={selectedSchoolYear || ""}
              setSelected={(year) => {
                setSelectedSchoolYear(year);
              }}
            />

            <SearchFilter
              label="Search Student"
              value={searchStudentName}
              onChange={(value) => setSearchStudentName(value)}
              placeholder="Enter student name..."
            />
          </div>
        </div>

        {/* Sorting & Table Layout */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">

          {/* Sorting Section */}
          <div className="bg-white p-6 rounded-lg shadow md:w-1/4 lg:w-1/4">
            <h3 className="text-xl font-semibold mb-4">Sorting</h3>
            <div className="space-y-4">
              <Dropdown
                label="Sort by Student Name"
                options={sortingOptions}
                selected={sortByStudentName}
                setSelected={setSortByStudentName}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isShowingAll}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
          {adviserSections.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow flex-1">
              <div className="text-center text-gray-500">
                You are not an adviser for any sections this school year.
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow flex-1 overflow-x-auto">
              <h3 className="text-xl font-semibold mb-4">
                Grade {selectedSection?.gradeLevel.toString()}-{selectedSection?.name} Class List
              </h3>

              {/* Students Table */}
              {handleFilterAndSort().length === 0 ? (
                <div className="text-center text-gray-500">No students found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedStudents().map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={student.profilePic?.trim() ? student.profilePic : "/avatar.png"}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{student.firstName} {student.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.contactNumber?.trim() ? student.contactNumber : "Not Yet Updated"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.address?.trim() ? student.address : "Not Yet Updated"}
                          </td>
                          <td className="px-6 py-4 flex gap-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewGrades(student)}
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-5 h-5" />
                              View Grades
                            </button>
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="text-red-500 hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-5 h-5" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Component */}
              {handleFilterAndSort().length > 0 && (
                <Pagination
                  totalItems={handleFilterAndSort().length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  showAllOption={true}
                  isShowingAll={isShowingAll}
                  setIsShowingAll={setIsShowingAll}
                />
              )}

              <div className="mb-4 mt-5">
                
                {currentSchoolYearState == selectedSchoolYear && (
                  <button
                  onClick={openModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Student to Class
                </button>
                  
                )}
                
                <button
                  onClick={showSectionGrades}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
                >
                  Show Section Grades
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
          <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-1/3">
            <h3 className="text-xl font-semibold mb-4">Add Student</h3>
            <div className="mb-4">
              <Select
                isMulti
                options={availableStudents.map((student) => ({
                  value: student._id,
                  label: student.firstName + " " + student.lastName,
                })) || []}
                value={modalStudents}
                onChange={(selected) => setModalStudents(selected)}
                placeholder="Select student"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              <button onClick={handleAddStudent} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
            </div>
          </div>
        </div>
      )}
      {isGradesModalOpen && selectedStudentGrades && (
        <StudentGradesModal
          grades={selectedStudentGrades}
          studentName={selectedStudentName}
          onClose={() => setIsGradesModalOpen(false)}
        />
      )}
      {Object.keys(adviserSectionGrades).length > 0 && (
        <SectionGradesModal
          isOpen={isSectionGradesModalOpen}
          onClose={() => setIsSectionGradesModalOpen(false)}
          section={selectedSection}
          grades={adviserSectionGrades}
        />
      )}
    </div>
  );
};

export default TeacherSectionManagementPage;