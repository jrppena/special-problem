  import React, { useState, useEffect } from "react";
  import Navbar from "../../components/navigation-bar";
  import PageHeader from "../../components/page-header";
  import Dropdown from "../../components/drop-down";
  import SearchFilter from "../../components/search-filter";
  import Select from "react-select";
  import { schoolYears, gradeLevels } from "../../constants";
  import { useSectionStore } from "../../store/useSectionStore";
  import { useTeacherStore } from "../../store/useTeacherStore";
  import { useAuthStore } from "../../store/useAuthStore";
  import toast from "react-hot-toast";
  import { Trash2 } from "lucide-react";

  const TeacherSectionManagementPage = () => {
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(schoolYears[0].name);
    const [selectedSection, setSelectedSection] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { adviserSections, getAdviserSections } = useSectionStore();
    const { availableStudents, getAvailableStudents, addStudentToSection, removeStudentFromSection } = useTeacherStore();
    const { authUser } = useAuthStore();
    const [modalStudents, setModalStudents] = useState([]);

    // Filters & Sorting
    const [searchStudentName, setSearchStudentName] = useState("");
    const [sortByStudentName, setSortByStudentName] = useState("No Filter");

    const sortingOptions = ["No Filter", "Ascending", "Descending"];

    useEffect(() => {
      getAdviserSections(authUser._id, selectedSchoolYear);
    }, [selectedSchoolYear]);

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
    }, [isModalOpen, selectedSection]);

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
      setSelectedSection(updatedSection);
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
                options={schoolYears.map((year) => year.name)}
                selected={selectedSchoolYear}
                setSelected={setSelectedSchoolYear}
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
                          {handleFilterAndSort().map((student) => (
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
                              <td className="px-6 py-4 whitespace-nowrap">
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

                  <div className="mb-4 mt-5">
                    <button
                      onClick={openModal}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Add Student to Class
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
      </div>
    );
  };

  export default TeacherSectionManagementPage;
