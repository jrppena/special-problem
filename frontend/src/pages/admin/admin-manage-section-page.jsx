import React, { useEffect, useState, useMemo } from "react";

import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import SearchFilter from "../../components/search-filter";
import EnrolledStudentsFilter from "../../components/enrolled-students-filter";


import { useAuthStore } from "../../store/useAuthStore";
import { useSectionStore } from "../../store/useSectionStore";
import { useTeacherStore } from "../../store/useTeacherStore";

import toast from "react-hot-toast";
import { Pen, Trash2 } from 'lucide-react'; // Correct import for lucide-react icons
import { schoolYears, gradeLevels } from "../../constants";


const AdminManageSectionPage = () => {
  const { authUser } = useAuthStore();
  
  const { 
    sections, 
    availableAdvisers, 
    fetchSections, 
    fetchAvailableAdvisers, 
    createSection,
    editSection,
    deleteSection  // Added deletion function from store
  } = useSectionStore();

  const { teachers, getTeachers } = useTeacherStore();

  // For filtering, grade level is stored as a number; null means "No Filter"
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(
    schoolYears.find((year) => year.isCurrent).name
  );
  
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
  const [selectedAdviser, setSelectedAdviser] = useState("No Filter");
  const [searchSectionName, setSearchSection] = useState("");
  const [sortByGradeLevel, setSortByGradeLevel] = useState("No Filter");
  const [sortByAdviser, setSortByAdviser] = useState("No Filter");
  const [sortBySection, setSortBySection] = useState("No Filter");
  const [studentCount, setStudentCount] = useState(null);

  // Modal states for adding/editing a section
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [modalSectionName, setModalSectionName] = useState("");
  // modalGradeLevel is stored as a number; for add mode we default to the first grade's value.
  const [modalGradeLevel, setModalGradeLevel] = useState(
    gradeLevels[0]?.value || null
  );
  const [modalAdviser, setModalAdviser] = useState(null);

  const sortingOptions = ["No Filter", "Ascending", "Descending"];

  // Fetch data when school year changes or on mount
  useEffect(() => {
    fetchSections(selectedSchoolYear);
  }, [selectedSchoolYear, fetchSections]);

  useEffect(() => {
    fetchAvailableAdvisers(selectedSchoolYear);
  }, [selectedSchoolYear, fetchAvailableAdvisers]);

  useEffect(() => {
    getTeachers();
  }, [getTeachers]);

  const handleSliderChange = (value) => {
    setStudentCount(value);
  };

  const handleSearchSection = (value) => {
    setSearchSection(value);
  };

  // Open modal for adding a section.
  const openAddSectionModal = () => {
    setCurrentSection(null);
    setModalSectionName("");
    setModalGradeLevel(gradeLevels[0]?.value || null);
    setModalAdviser(availableAdvisers && availableAdvisers.length > 0 ? availableAdvisers[0] : null); //

    setIsModalOpen(true);
  };

  // Open modal for editing a section.
  const openEditSectionModal = (section) => {
    setCurrentSection(section);
    setModalSectionName(section.name);
    setModalGradeLevel(section.gradeLevel);
    console.log(section);
    setModalAdviser(section.adviser);
    setIsModalOpen(true);
  };

  // Delete a section after confirmation.
  const handleDeleteSection = (section) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      deleteSection(section.id || section._id);
    }
  };

  // Close modal without resetting currentSection.
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Compute merged advisers list.
  const mergedAdvisers = useMemo(() => {
    if (availableAdvisers && availableAdvisers.length > 0) {
      if (modalAdviser) {
        const exists = availableAdvisers.some(
          (teacher) =>{
            if(teacher._id === modalAdviser._id){
            }

          }
        );
        if (!exists) {
          return [modalAdviser, ...availableAdvisers];
        }
      }
      return availableAdvisers;
    } else {
      return !currentSection
        ? [
            {
              id: "no-adviser",
              firstName: "No available advisers",
              lastName: "",
            },
          ]
        : modalAdviser
        ? [modalAdviser]
        : [];
    }
  }, [modalAdviser, availableAdvisers, currentSection]);

  const validateSectionData = () => {
    if (!modalSectionName.trim()) {
      toast.error("Please enter a section name");
      return false;
    }
    if (modalGradeLevel === null) {
      toast.error("Please select a grade level");
      return false;
    }
    if (!modalAdviser || modalAdviser.id === "no-adviser") {
      toast.error("Please select an adviser");
      return false;
    }
    return true;
  };

  const handleSaveSection = () => {
    console.log("3. modaladviser", modalAdviser);

    if (!currentSection && (!availableAdvisers || availableAdvisers.length === 0)) {
      toast.error("Cannot add new section: No advisers available");
      return;
    }
    if (!validateSectionData()) return;

    if (currentSection) {
      const originalAdviserId =
        currentSection.adviser?._id || currentSection.adviser?.id;
      const currentAdviserId = modalAdviser?._id || modalAdviser?.id;
      if (
        modalSectionName.trim() === currentSection.name &&
        modalGradeLevel === currentSection.gradeLevel &&
        currentAdviserId === originalAdviserId
      ) {
        toast.error("No changes detected");
        return;
      }

      
      const updatedSection = {
        id: currentSection?.id || currentSection?._id,
        sectionName: modalSectionName,
        gradeLevel: modalGradeLevel,
        adviser: modalAdviser?._id || modalAdviser?.id,
        schoolYear: selectedSchoolYear
      };
      editSection(updatedSection);
    } else {
      const newSection = {
        sectionName: modalSectionName,
        gradeLevel: modalGradeLevel,
        adviserId: modalAdviser?._id || modalAdviser?.id,
        schoolYear: selectedSchoolYear,
      };
      createSection(newSection);
      setModalAdviser(null);
    }
    closeModal();
  };

  // Compute disabled state for sort dropdowns.
  const disableSortByGradeLevel =
    sortByGradeLevel === "No Filter" &&
    (sortByAdviser !== "No Filter" || sortBySection !== "No Filter");
  const disableSortByAdviser =
    sortByAdviser === "No Filter" &&
    (sortByGradeLevel !== "No Filter" || sortBySection !== "No Filter");
  const disableSortBySection =
    sortBySection === "No Filter" &&
    (sortByGradeLevel !== "No Filter" || sortByAdviser !== "No Filter");

  // Determine active sort option.
  const activeSort =
    sortByGradeLevel !== "No Filter"
      ? { field: "gradeLevel", order: sortByGradeLevel }
      : sortByAdviser !== "No Filter"
      ? { field: "adviser", order: sortByAdviser }
      : sortBySection !== "No Filter"
      ? { field: "name", order: sortBySection }
      : null;

  // Compute filtered and sorted sections.
  const computedSections = useMemo(() => {
    let filtered = sections;

    if (selectedGradeLevel !== null) {
      filtered = filtered.filter(
        (section) => section.gradeLevel === selectedGradeLevel
      );
    }
    if (selectedAdviser !== "No Filter") {
      filtered = filtered.filter((section) => {
        if (!section.adviser) return false;
        const adviserName =
          section.adviser.firstName + " " + section.adviser.lastName;
        return adviserName === selectedAdviser;
      });
    }
    if (searchSectionName) {
      filtered = filtered.filter((section) =>
        section.name.toLowerCase().includes(searchSectionName.toLowerCase())
      );
    }
    if (studentCount !== null) {
      filtered = filtered.filter(
        (section) => section.enrolled >= studentCount
      );
    }
    if (activeSort) {
      filtered = filtered.slice().sort((a, b) => {
        if (activeSort.field === "adviser") {
          const aAdviser = a.adviser
            ? a.adviser.firstName + " " + a.adviser.lastName
            : "";
          const bAdviser = b.adviser
            ? b.adviser.firstName + " " + b.adviser.lastName
            : "";
          return activeSort.order === "Ascending"
            ? aAdviser.localeCompare(bAdviser)
            : bAdviser.localeCompare(aAdviser);
        } else if (activeSort.field === "gradeLevel") {
          // Compare numerically.
          return activeSort.order === "Ascending"
            ? a.gradeLevel - b.gradeLevel
            : b.gradeLevel - a.gradeLevel;
        } else {
          // For other fields, convert to strings and compare lexicographically.
          const aField = a[activeSort.field] || "";
          const bField = b[activeSort.field] || "";
          return activeSort.order === "Ascending"
            ? aField.toString().localeCompare(bField.toString())
            : bField.toString().localeCompare(aField.toString());
        }
      });
    }
    
    return filtered;
  }, [
    sections,
    selectedGradeLevel,
    selectedAdviser,
    searchSectionName,
    studentCount,
    activeSort,
  ]);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <PageHeader title="Manage Sections" />

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Dropdown
              label="School Year"
              options={schoolYears.map((year) => year.name)}
              selected={selectedSchoolYear}
              setSelected={setSelectedSchoolYear}
            />
            <Dropdown
              label="Grade Level"
              options={["No Filter", ...gradeLevels.map((grade) => grade.name)]}
              selected={
                selectedGradeLevel === null
                  ? "No Filter"
                  : gradeLevels.find((g) => g.value === selectedGradeLevel)
                      ?.name
              }
              setSelected={(value) =>
                setSelectedGradeLevel(
                  value === "No Filter"
                    ? null
                    : gradeLevels.find((g) => g.name === value)?.value
                )
              }
            />
            <Dropdown
              label="Adviser"
              options={[
                "No Filter",
                ...teachers.map(
                  (teacher) => teacher.firstName + " " + teacher.lastName
                ),
              ]}
              selected={selectedAdviser}
              setSelected={setSelectedAdviser}
            />
            <SearchFilter
              label="Search Section"
              value={searchSectionName}
              onChange={handleSearchSection}
              placeholder="Enter section name..."
            />
            <EnrolledStudentsFilter
              selected={studentCount}
              setSelected={handleSliderChange}
            />
          </div>
        </div>

        {/* Sorting Sidebar & Sections Table */}
        <div className="flex flex-col md:flex-row mt-6 gap-6">
          <div className="bg-white p-6 rounded-lg shadow md:w-1/4">
            <h3 className="text-xl font-semibold mb-4">Sorting</h3>
            <div className="space-y-4">
              <Dropdown
                label="Sort by Grade Level"
                options={sortingOptions}
                selected={sortByGradeLevel}
                setSelected={(value) => {
                  setSortByGradeLevel(value);
                  if (value !== "No Filter") {
                    setSortByAdviser("No Filter");
                    setSortBySection("No Filter");
                  }
                }}
                disabled={disableSortByGradeLevel}
              />
              <Dropdown
                label="Sort by Adviser"
                options={sortingOptions}
                selected={sortByAdviser}
                setSelected={(value) => {
                  setSortByAdviser(value);
                  if (value !== "No Filter") {
                    setSortByGradeLevel("No Filter");
                    setSortBySection("No Filter");
                  }
                }}
                disabled={disableSortByAdviser}
              />
              <Dropdown
                label="Sort by Section"
                options={sortingOptions}
                selected={sortBySection}
                setSelected={(value) => {
                  setSortBySection(value);
                  if (value !== "No Filter") {
                    setSortByGradeLevel("No Filter");
                    setSortByAdviser("No Filter");
                  }
                }}
                disabled={disableSortBySection}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow flex-1 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Sections Table</h3>
            {computedSections.length === 0 ? (
              <div className="text-center text-gray-500">No sections found</div>
            ) : (
              <div className="overflow-x-auto max-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section Name
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adviser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students Enrolled
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {computedSections.map((section) => (
                    <tr key={section.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.gradeLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.adviser
                          ? section.adviser.firstName + " " + section.adviser.lastName
                          : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.students.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        <button
                          className="flex items-center gap-2 text-blue-500 hover:underline"
                          onClick={() => openEditSectionModal(section)}
                        >
                          <Pen className="w-5 h-5" />
                          Edit
                        </button>
                        <button
                          className="flex items-center gap-2 text-red-500 hover:underline"
                          onClick={() => handleDeleteSection(section)}
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            )}
            <div className="mt-6">
              <button
                onClick={openAddSectionModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add New Section
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding/Editing Section */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">
              {currentSection ? "Edit Section" : "Add New Section"}
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col w-auto">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={modalSectionName}
                  onChange={(e) => setModalSectionName(e.target.value)}
                />
              </div>
              <div>
                <Dropdown
                  label="Grade Level"
                  options={gradeLevels.map((g) => g.name)}
                  selected={
                    gradeLevels.find((g) => g.value === modalGradeLevel)?.name ||
                    ""
                  }
                  setSelected={(value) =>
                    setModalGradeLevel(
                      gradeLevels.find((g) => g.name === value)?.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <Dropdown
                label="Available Advisers"
                options={mergedAdvisers}
                selected={modalAdviser}
                setSelected={setModalAdviser}
                getOptionValue={(teacher) => teacher?._id || teacher?.id || "no-adviser"}  // Safely access _id
                getOptionLabel={(teacher) =>
                  `${teacher.firstName} ${teacher.lastName}` || "No Adviser Available"
                }
                disabled={mergedAdvisers[0]?.id === "no-adviser"}
              />

            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageSectionPage;
