
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import Pagination from "./pagination";

const MissingGradesModal = ({ isOpen, onClose, missingGradesData, currentSchoolYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [paginatedSections, setPaginatedSections] = useState([]);
  const itemsPerPage = 1; // Number of sections to show per page
  
  useEffect(() => {
    if (!missingGradesData || !missingGradesData.sections) return;
    
    if (isShowingAll) {
      setPaginatedSections(missingGradesData.sections);
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedSections(missingGradesData.sections.slice(startIndex, endIndex));
    }
  }, [missingGradesData, currentPage, isShowingAll]);

  if (!isOpen || !missingGradesData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Missing Grades Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700">
            Unable to update to the next school year due to missing grades for the current school year: <span className="font-semibold">{currentSchoolYear}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            All students must have grades for all quarters before advancing to the next school year.
          </p>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-100 p-3 flex justify-between items-center">
            <h3 className="font-semibold">Sections with Missing Grades</h3>
            <span className="text-sm text-gray-600">
              {missingGradesData.sections.length} total sections
            </span>
          </div>
          
          {paginatedSections.map((section) => (
            <div key={section.sectionId} className="border-t p-4">
              <div className="flex flex-wrap justify-between items-center mb-3">
                <h4 className="text-lg font-medium">
                  {section.sectionName} (Grade {section.sectionGrade})
                </h4>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {section.totalStudents} Students
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Q1
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Q2
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Q3
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Q4
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {section.classes.map((classItem) => (
                      <tr key={classItem.classId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {classItem.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {classItem.missingByQuarter.Q1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {classItem.missingByQuarter.Q1} missing
                            </span>
                          ) : (
                            <span className="text-green-600">✓</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {classItem.missingByQuarter.Q2 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {classItem.missingByQuarter.Q2} missing
                            </span>
                          ) : (
                            <span className="text-green-600">✓</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {classItem.missingByQuarter.Q3 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {classItem.missingByQuarter.Q3} missing
                            </span>
                          ) : (
                            <span className="text-green-600">✓</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {classItem.missingByQuarter.Q4 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {classItem.missingByQuarter.Q4} missing
                            </span>
                          ) : (
                            <span className="text-green-600">✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
        {missingGradesData.sections && missingGradesData.sections.length > 0 && (
          <Pagination
            totalItems={missingGradesData.sections.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isShowingAll={isShowingAll}
            setIsShowingAll={setIsShowingAll}
          />
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissingGradesModal;