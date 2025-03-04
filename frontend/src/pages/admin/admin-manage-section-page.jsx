import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useSectionStore } from "../../store/useSectionStore";
import { useTeacherStore } from "../../store/useTeacherStore";
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import { schoolYears, gradeLevels } from "../../constants";
import SearchFilter from "../../components/search-filter";
import EnrolledStudentsFilter from "../../components/enrolled-students-filter";
import { use } from "react";

const AdminManageSectionPage = () => {
  const { authUser } = useAuthStore();
  const { sections, availableAdvisers, fetchSections, fetchAvailableAdvisers} = useSectionStore();
  const { teachers, getTeachers } = useTeacherStore();


  const [selectedSchoolYear, setSelectedSchoolYear] = useState(
    schoolYears.find((year) => year.isCurrent).name
  );
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("No Filter");
  const [selectedAdviser, setSelectedAdviser] = useState("No Filter");
  const [searchSectionName, setSearchSection] = useState("");
  const [sortByGradeLevel, setSortByGradeLevel] = useState("No Filter");
  const [sortByAdviser, setSortByAdviser] = useState("No Filter");
  const [sortBySection, setSortBySection] = useState("No Filter");
  const [studentCount, setStudentCount] = useState(null);


  useEffect(() => {
    fetchSections(selectedSchoolYear);
  }, [selectedSchoolYear]);

  useEffect(() => {
    fetchAvailableAdvisers(selectedSchoolYear);
  }, [selectedSchoolYear]);

  useEffect(() => {
    getTeachers();
  }, []);


  // Modal states for adding/editing a section
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  const sortingOptions = ["No Filter", "Ascending", "Descending"];

  const handleSliderChange = (value) => {
    setStudentCount(value);
  };

  const handleSearchSection = (value) => {
    setSearchSection(value);
  };

  // Open modal for adding or editing
  const openAddSectionModal = () => {
    setCurrentSection(null);
    setIsModalOpen(true);
  };

  const openEditSectionModal = (section) => {
    setCurrentSection(section);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSection = () => {
    // Add logic to save changes here...
    if(currentSection) {
        // Edit existing section
        console.log("Edit existing section");
    }else{
        // Add new section
        console.log("Add new section");
    }
    closeModal();
  };

  // Teacher list for the adviser dropdown in modal
  const teacherList = ["Mr. Smith", "Ms. Johnson", "Mrs. Brown"];
  const [modalAdviser, setModalAdviser] = useState(
    currentSection ? currentSection.adviser : teachers.map((teacher) => teacher.firstName + " " + teacher.lastName)[0]
  );
  const [modalGradeLevel, setModalGradeLevel] = useState(
    currentSection ? currentSection.gradeLevel : gradeLevels[0])

  // Update modal adviser value when currentSection changes
  useEffect(() => {
    if (currentSection) {
      setModalAdviser(currentSection.adviser);
    } else {
      setModalAdviser(teachers.map((teacher) => teacher.firstName + " " + teacher.lastName)[0]);
    }
  }, [currentSection]);

  useEffect(() => {
    if (currentSection) {
        setModalGradeLevel(currentSection.gradeLevel);
    } else {
        setModalGradeLevel(gradeLevels[0]);
    }
    }, [currentSection]);

  // Determine which sorting option is active (only one at a time is allowed)
  const activeSort =
    sortByGradeLevel !== "No Filter"
      ? { field: "gradeLevel", order: sortByGradeLevel }
      : sortByAdviser !== "No Filter"
      ? { field: "adviser", order: sortByAdviser }
      : sortBySection !== "No Filter"
      ? { field: "sectionName", order: sortBySection }
      : null;

  // Compute disabled state for each sort dropdown:
  const disableSortByGradeLevel =
    sortByGradeLevel === "No Filter" && (sortByAdviser !== "No Filter" || sortBySection !== "No Filter");
  const disableSortByAdviser =
    sortByAdviser === "No Filter" && (sortByGradeLevel !== "No Filter" || sortBySection !== "No Filter");
  const disableSortBySection =
    sortBySection === "No Filter" && (sortByGradeLevel !== "No Filter" || sortByAdviser !== "No Filter");

  // Compute filtered and sorted sections
  const computedSections = useMemo(() => {
    // Start with sections from store or fallback data
    let filtered = sections;

    // Apply filters
    if (selectedGradeLevel !== "No Filter") {
      filtered = filtered.filter(
        (section) => section.gradeLevel === selectedGradeLevel
      );
    }
    if (selectedAdviser !== "No Filter") {
      filtered = filtered.filter(
        (section) => section.adviser === selectedAdviser
      );
    }
    if (searchSectionName) {
      filtered = filtered.filter((section) =>
        section.sectionName.toLowerCase().includes(searchSectionName.toLowerCase())
      );
    }
    if (studentCount !== null) {
      // Filter sections with enrolled students greater than or equal to the selected value
      filtered = filtered.filter((section) => section.enrolled >= studentCount);
    }

    // Apply only the active sort if available
    if (activeSort) {
      filtered = filtered.slice().sort((a, b) => {
        const cmp = a[activeSort.field].localeCompare(b[activeSort.field]);
        return activeSort.order === "Ascending" ? cmp : -cmp;
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

        {/* Filters Section at the Top */}
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
              options={["No Filter", ...gradeLevels.map((gradeLevel) => gradeLevel.name)]}
              selected={selectedGradeLevel}
              setSelected={setSelectedGradeLevel}
            />
            <Dropdown
              label="Adviser"
              options={["No Filter", ...teachers.map((teacher) => teacher.firstName + " " + teacher.lastName)]}
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

        {/* Main Content: Sorting Sidebar & Table */}
        <div className="flex flex-col md:flex-row mt-6 gap-6">
          {/* Sorting Sidebar */}
          <div className="bg-white p-6 rounded-lg shadow md:w-1/4">
            <h3 className="text-xl font-semibold mb-4">Sorting</h3>
            <div className="space-y-4">
              <Dropdown
                label="Sort by Grade Level"
                options={sortingOptions}
                selected={sortByGradeLevel}
                setSelected={(value) => {
                  // Reset other sort options when this one changes
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

          {/* Dynamic Sections Table */}
          <div className="bg-white p-6 rounded-lg shadow flex-1 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Sections Table</h3>
            {computedSections.length === 0 ? (
              <div className="text-center text-gray-500">No sections found</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade Level
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
                      <td className="px-6 py-4 whitespace-nowrap">{section.sectionName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{section.gradeLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{section.adviser}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{section.enrolled}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => openEditSectionModal(section)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Add New Section Button */}
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
          <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
          <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">
              {currentSection ? "Edit Section" : "Add New Section"}
            </h3>
            {/* Modal content fields */}
            <div className="space-y-4">
            <div className="flex flex-col w-auto">
                {/* Label */}
                <label className="text-sm font-medium text-gray-700 mb-1">
                    Section Name
                </label>

                {/* Input Field */}
                <input
                    type="text"
                    className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={currentSection ? currentSection.sectionName : ""}
                />
            </div>

              <div>
                <Dropdown
                  options={currentSection ? currentSection.gradeLevel : gradeLevels.map((gradeLevel) => gradeLevel.name)}
                  selected={modalGradeLevel}
                  label = "Grade Level"
                  setSelected={setModalGradeLevel}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <Dropdown
                  options={availableAdvisers.map((adviser) => adviser.firstName + " " + adviser.lastName)}
                  selected={modalAdviser}
                  label="Available Advisers"
                  setSelected={setModalAdviser}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
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
