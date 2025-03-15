import React, { useState } from "react";
import { useEffect } from "react";

import Select from "react-select"; // Importing react-select
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import SearchFilter from "../../components/search-filter";

import { schoolYears } from "../../constants";
import {useSectionStore} from "../../store/useSectionStore";
import {useTeacherStore} from "../../store/useTeacherStore";
import { useClassStore } from "../../store/useClassStore";

import { Pen, Trash2 } from "lucide-react"; // Correct import for lucide-react icons
import toast from "react-hot-toast";
import { gradeLevels } from "../../constants";
import Exceljs from "exceljs";


const AdminManageClassPage = () => {
  
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(schoolYears[0].name);
    
  const {classes, fetchClasses, createClass, editClass, deleteClass,createClassThroughImport,isCreatingClasses,deleteAllClassesGivenSchoolYear} = useClassStore();
  const {sections, fetchSections} = useSectionStore();
  const {teachers, getTeachers} = useTeacherStore();
  
  useEffect (() => {
    fetchClasses(selectedSchoolYear);
    fetchSections(selectedSchoolYear);
    getTeachers();
  }, [selectedSchoolYear]);
 
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("No Filter");
  const [selectedTeacher, setSelectedTeacher] = useState("No Filter");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("No Filter");
  
  const [searchClassName, setSearchClassName] = useState("");
  const [sortByClassName, setSortByClassName] = useState("No Filter");
  const [sortBySubject, setSortBySubject] = useState("No Filter");
  const [sortBySection, setSortBySection] = useState("No Filter");
  const [sortByTeacher, setSortByTeacher] = useState("No Filter");
  const [sortByGradeLevel, setSortByGradeLevel] = useState("No Filter");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  
  const [modalSections, setModalSections] = useState([]); // Initialize as an empty array
  const [modalSubject, setModalSubject] = useState("");
  const [modalTeachers, setModalTeachers] = useState(null);
  const [modalGradeLevel, setModalGradeLevel] = useState();

  const sortingOptions = ["No Filter", "Ascending", "Descending"];

  const handleSearchClass = (value) => {
    setSearchClassName(value);
  };

  const handleModalSectionChange = (selectedOptions) => {
    setModalSections(selectedOptions);
  };

  const openAddClassModal = () => {
    setCurrentClass(null);
    setModalSubject("");
    setModalSections([]);
    setModalTeachers([]);
    setModalGradeLevel(gradeLevels[0].value); // Set first grade level
    setIsModalOpen(true);
  };
  

  const openEditClassModal = (classItem) => {
    setCurrentClass(classItem);
    setModalSubject(classItem.subjectName);
    
    // Map the existing sections to match the format that react-select expects
    setModalSections(
      classItem.sections.map((section) => ({
        value: section._id,    // The unique identifier for react-select
        label: `${section.name} (Grade ${section.gradeLevel})`, // Display name
      }))
    );
    
   setModalTeachers(
      classItem.teachers.map((teacher)=>({
      value: teacher._id,
      label: `${teacher.firstName} ${teacher.lastName}`
   }))); // Assuming class has a teacher object

    setModalGradeLevel(classItem.gradeLevel); // Assuming class has sections as an array
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSectionChange = (selectedOptions) => {
    setSelectedSections(selectedOptions);
  };

  const handleDeleteClass = (classId,selectedSchoolYear) => {
    deleteClass(classId,selectedSchoolYear);
  }

   const filterClasses = (classes) => {
    let filteredClasses = classes;

    // Apply search filter
    if (searchClassName) {
      filteredClasses = filteredClasses.filter((classItem) =>
        classItem.subjectName.toLowerCase().includes(searchClassName.toLowerCase())
      );
    }

    // Apply section filter
    if (selectedSectionFilter !== "No Filter") {
      filteredClasses = filteredClasses.filter((classItem) =>
        classItem.sections.some((section) =>
          section.name.toLowerCase().includes(selectedSectionFilter.toLowerCase())
        )
      );
    }

    // Apply teacher filter
    if (selectedTeacher !== "No Filter") {
      filteredClasses = filteredClasses.filter((classItem) =>
        classItem.teachers.some((teacher) =>
          `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(selectedTeacher.toLowerCase())
        )
      );
    }
    
    // Apply grade level filter
    if (selectedGradeLevel !== "No Filter") {
      filteredClasses = filteredClasses.filter(
        (classItem) => classItem.gradeLevel === parseInt(selectedGradeLevel.split(" ")[1])
      );
    }

    return filteredClasses;
  };

  const sortClasses = (classes) => {
    let sortedClasses = [...classes]; // Create a copy to avoid mutating original array

    // Apply sorting by class name
    if (sortByClassName === "Ascending") {
      sortedClasses = sortedClasses.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    } else if (sortByClassName === "Descending") {
      sortedClasses = sortedClasses.sort((a, b) => b.subjectName.localeCompare(a.subjectName));
    }

    // Apply sorting by grade level
    if (sortByGradeLevel === "Ascending") {
      sortedClasses = sortedClasses.sort((a, b) => a.gradeLevel - b.gradeLevel);
    } else if (sortByGradeLevel === "Descending") {
      sortedClasses = sortedClasses.sort((a, b) => b.gradeLevel - a.gradeLevel);
    }

    // Apply sorting by section name
    if (sortBySection === "Ascending") {
      sortedClasses = sortedClasses.sort((a, b) => {
        const sectionA = a.sections.map((section) => section.name).join(", ");
        const sectionB = b.sections.map((section) => section.name).join(", ");
        return sectionA.localeCompare(sectionB);
      });
    } else if (sortBySection === "Descending") {
      sortedClasses = sortedClasses.sort((a, b) => {
        const sectionA = a.sections.map((section) => section.name).join(", ");
        const sectionB = b.sections.map((section) => section.name).join(", ");
        return sectionB.localeCompare(sectionA);
      });
    }

    // Apply sorting by teacher name
    if (sortByTeacher === "Ascending") {
      sortedClasses = sortedClasses.sort((a, b) => {
        const teacherA = `${a.teachers[0].firstName} ${a.teachers[0].lastName}`;
        const teacherB = `${b.teachers[0].firstName} ${b.teachers[0].lastName}`;
        return teacherA.localeCompare(teacherB);
      });
    
    } else if (sortByTeacher === "Descending") {
      sortedClasses = sortedClasses.sort((a, b) => {
        const teacherA = `${a.teachers[0].firstName} ${a.teachers[0].lastName}`;
        const teacherB = `${b.teachers[0].firstName} ${b.teachers[0].lastName}`;
        return teacherB.localeCompare(teacherA);
      });
    }
    
    return sortedClasses;
  };

  const handleFilterAndSort = () => {
    let filteredClasses = filterClasses(classes);
    return sortClasses(filteredClasses);
  };

  const validateClassData = () => {
    if (!modalSubject.trim() || !modalGradeLevel || !modalSections.length || !modalTeachers.length) {
      toast.error("All fields are required.");
      return false;
    }
 
    
    if(currentClass){
      // Extract relevant IDs from modalSections and currentClass.sections
        const originalSectionIds = currentClass.sections.map((section) => section._id);
        const currentSectionIds = modalSections.map((section) => section.value); // Use 'value' here

        // Check if the sections match
        const sectionsMatch =
          originalSectionIds.length === currentSectionIds.length &&
          originalSectionIds.every(id => currentSectionIds.includes(id)) &&
          currentSectionIds.every(id => originalSectionIds.includes(id));

        // Extract relevant IDs from modalTeachers and currentClass.teachers
        const originalTeacherIds = currentClass.teachers.map((teacher) => teacher._id);
        const currentTeacherIds = modalTeachers.map((teacher) => teacher.value); // Use 'value' here

        // Check if the teachers match
        const teachersMatch =
          originalTeacherIds.length === currentTeacherIds.length &&
          originalTeacherIds.every(id => currentTeacherIds.includes(id)) &&
          currentTeacherIds.every(id => originalTeacherIds.includes(id));

        // Check if everything matches
        if (
          modalSubject === currentClass.subjectName &&
          modalGradeLevel === currentClass.gradeLevel &&
          sectionsMatch &&
          teachersMatch
        ) {
          toast.error("No changes detected.");
          return false;
        }
    }
    
  }
    

  const handleSaveClass = () => {

    if(validateClassData() === false){
      return;
    }

    if (currentClass) {
      const updatedClass = {
        id: currentClass._id,
        subjectName: modalSubject,
        gradeLevel: modalGradeLevel,
        sections: modalSections.map((section) => section.value),
        teachers: modalTeachers.map((teacher) => teacher.value),
        schoolYear: selectedSchoolYear,
      };
      editClass(updatedClass);
  
    } else {
      const newClass = {
        subjectName: modalSubject,
        gradeLevel: modalGradeLevel,
        sections: modalSections.map((section) => section.value),
        teachers: modalTeachers.map((teacher) => teacher.value),
        schoolYear: selectedSchoolYear,
      };
  
      createClass(newClass);

    }

    closeModal();
  };

  let fileInput = null; // Reference to the file input element



  const handleImportClasses = (e) => {
    const file = e.target.files[0]; // Get the file from input
    if (!file) {
      console.error("No file selected.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target.result;
      const data = new Uint8Array(buffer);
  
      const workbook = new Exceljs.Workbook();
      try {
        await workbook.xlsx.load(data); // Load the data into the workbook
  
        const worksheet = workbook.getWorksheet(1); // Get the first worksheet
        if (!worksheet) {
          console.error("No worksheet found.");
          return;
        }
  
        const classes = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) { // Skip the first row (header)
            // Extract raw data from the row
            const subjectName = row.getCell(1).value;
            const gradeLevel = parseInt(row.getCell(2).value); // Assuming grade level is in column 2
            const sectionNames = row.getCell(3).value ? row.getCell(3).value.split(";") : []; // Assuming sections are comma-separated
            const teacherFullNames = row.getCell(4).value ? row.getCell(4).value.split(";").map(name => name.trim()) : []; // Assuming teacher full names are comma-separated
  
            // Map section names to their _id values from the sections array
            const sectionsMapped = sectionNames.map(sectionName => {
              const trimmedSectionName = sectionName.trim();
              // Find the section by name in the sections array and return the _id
              const section = sections.find(s => s.name === trimmedSectionName);
              return section ? section._id : trimmedSectionName; // Use section id, or return name if not found
            });
  
            // Map teacher full names to their IDs by creating full name from firstName and lastName
            const teachersMapped = teacherFullNames.map(fullName => {
              // Find teacher by comparing the full name
              const teacher = Object.values(teachers).find(
                (teacher) => `${teacher.firstName} ${teacher.lastName}` === fullName
              );
              
              return teacher ? teacher._id : fullName; // Return the teacher's ID or the full name if not found
            });
  
            // Construct the class object
            const classesData = {
              subjectName: subjectName,
              gradeLevel: gradeLevel,
              sections: sectionsMapped, // Array of section IDs
              teachers: teachersMapped, // Array of teacher IDs
              schoolYear: selectedSchoolYear, // Hardcoded school year, adjust as necessary
            };
  
            classes.push(classesData);
          }
        });
  
        createClassThroughImport(classes, selectedSchoolYear); // Call the store function to create classes
  
        // Reset the file input after processing
        fileInput.value = null; // This resets the file input value
  
      } catch (error) {
        console.error("Error reading the Excel file:", error);
      }
    };
  
    reader.readAsArrayBuffer(file); // Read the file as an array buffer
  };

  const handleDeleteAllClasses = () => {
    
    if (window.confirm("Are you sure you want to delete all classes?")) {
      deleteAllClassesGivenSchoolYear(selectedSchoolYear);
    }
  }

  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <PageHeader title="Manage Classes" />

         {/* Filters Section */}
         <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Dropdown
              label="School Year"
              options={schoolYears.map((year) => year.name)}
              selected={selectedSchoolYear}
              setSelected={setSelectedSchoolYear}
            />
            <Dropdown
              label="Section"
              options={["No Filter", ...sections.map((section) => section.name)]}
              selected={selectedSectionFilter}
              setSelected={setSelectedSectionFilter}
            />
            <Dropdown
              label="Teacher"
              options={["No Filter", ...teachers.map((teacher) => `${teacher.firstName} ${teacher.lastName}`)]}
              selected={selectedTeacher}
              setSelected={setSelectedTeacher}
            />
            <Dropdown
              label="Grade Level"
              options={["No Filter", ...gradeLevels.map((level) => level.name)]}
              selected={selectedGradeLevel}
              setSelected={setSelectedGradeLevel}
            />
            <SearchFilter
              label="Search Class"
              value={searchClassName}
              onChange={(value) => setSearchClassName(value)}
              placeholder="Enter class name..."
            />
          </div>
        </div>

        {/* Sorting Section and Classes Table */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow md:w-1/4 lg:w-1/4">
            <h3 className="text-xl font-semibold mb-4">Sorting</h3>
            <div className="space-y-4">
              <Dropdown
                label="Sort by Class Name"
                options={sortingOptions}
                selected={sortByClassName}
                setSelected={setSortByClassName}
              />
              <Dropdown
                label="Sort by Section"
                options={sortingOptions}
                selected={sortBySection}
                setSelected={setSortBySection}
              />
              <Dropdown
                label="Sort by Teacher"
                options={sortingOptions}
                selected={sortByTeacher}
                setSelected={setSortByTeacher}
              />
              <Dropdown
                label="Sort by Grade Level"
                options={sortingOptions}
                selected={sortByGradeLevel}
                setSelected={setSortByGradeLevel}
              />
            </div>
          </div>

          {/* Classes Table */}
          <div className="bg-white p-6 rounded-lg shadow flex-1 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Classes Table</h3>
            {handleFilterAndSort().length === 0 ? (
              <div className="text-center text-gray-500">No classes found</div>
            ) : (
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sections</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {handleFilterAndSort().map((classItem) => (
                      <tr key={classItem._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.subjectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.gradeLevel}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {classItem.sections.map((section) => `${section.gradeLevel}-${section.name}`).join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.teachers.map((teacher) => `${teacher.firstName} ${teacher.lastName}`).join(", ")}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <button
                            className="flex items-center gap-2 text-blue-500 hover:underline"
                            onClick={() => openEditClassModal(classItem)}
                          >
                            <Pen className="w-5 h-5" />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 text-red-500 hover:underline"
                            onClick={() => handleDeleteClass(classItem._id, selectedSchoolYear)}
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
              {/* Container for buttons */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-start">
                {/* Add New Class Button */}
                <button
                  onClick={openAddClassModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
                >
                  Add New Class
                </button>

             {/* Import Classes Button */}
                <button className="w-full sm:w-auto">
                  <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer w-full">
                    Import Classes
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImportClasses}
                      ref={(input) => (fileInput = input)}  // Create a reference to the file input
                    />
                  </label>
                </button>


                {/* Delete Classes Button (visible only if classes exist) */}
                {classes.length > 0 && (
                  <button
                    onClick={handleDeleteAllClasses}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                  >
                    Delete Classes for the School Year
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>


      </div>

      {/* Modal for Adding/Editing Class */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-white p-6 rounded-lg z-50 w-11/12 md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">
              {currentClass ? "Edit Class" : "Add New Class"}
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col w-auto">
                <label className="text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  className="border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
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
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Sections</label>
                <Select
                  isMulti
                  name="sections"
                  options={sections
                    .filter((section) => section.gradeLevel === modalGradeLevel) // Filter based on gradeLevel
                    .map((section) => ({
                      value: section._id, // Unique identifier
                      label: `Grade ${section.gradeLevel}-${section.name}`, // Display name
                    })) || []} // Ensure options is always an array
                  value={modalSections}
                  onChange={handleModalSectionChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />

              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Teachers</label>
                <Select
                  isMulti
                  name="teachers"
                  options={teachers.map((teacher) => ({
                    value: teacher._id, // Unique identifier
                    label: `${teacher.firstName} ${teacher.lastName}`, // Display name
                  })) || []} // Ensure options is always an array
                  value={modalTeachers}
                  onChange={(selectedOptions) => setModalTeachers(selectedOptions)}
                  className="react-select-container"
                  classNamePrefix="react-select"
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
                onClick={handleSaveClass}
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

export default AdminManageClassPage;
