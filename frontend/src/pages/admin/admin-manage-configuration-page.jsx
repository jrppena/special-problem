import React, { useEffect, useState } from "react";
import NavBar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import MissingGradesModal from "../../components/missing-grades-modal";
import { useConfigStore } from "../../store/useConfigStore";

const AdminManageConfigurationPage = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ text: "", type: "" });
    const [missingGradesData, setMissingGradesData] = useState(null);
    const [promotionData, setPromotionData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const { updateCurrentSchoolYear, fetchCurrentSchoolYear } = useConfigStore();
    const [currentSchoolYear, setCurrentSchoolYear] = useState([]);
    
    useEffect(() => {
        const getCurrentSchoolYear = async () => {
            try {
               const schoolYear = await fetchCurrentSchoolYear();
                setCurrentSchoolYear(schoolYear);
            } catch (error) {
                console.error("Error fetching current school year:", error);
                setUpdateMessage({ text: "Failed to fetch current school year.", type: "error" });
            }
        };
        getCurrentSchoolYear();
    }, [fetchCurrentSchoolYear]);      
           
    const handleUpdateSchoolYear = async () => {
        setIsUpdating(true);
        setUpdateMessage({ text: "", type: "" });
        setMissingGradesData(null);
        setPromotionData(null);
       
        try {
            const response = await updateCurrentSchoolYear(currentSchoolYear);
            
            // Check if the response contains missing grades data (failure case)
            if (response && !response.success && response.sections) {
                setMissingGradesData(response);
                setIsModalOpen(true);
            } 
            // Check if the response indicates successful update
            else if (response && response.success) {
                setPromotionData(response);
                setIsPromotionModalOpen(true);
                setUpdateMessage({ 
                    text: `School year successfully updated from ${response.previousSchoolYear} to ${response.currentSchoolYear}`, 
                    type: "success" 
                });
                // Update the displayed current school year
                setCurrentSchoolYear(response.currentSchoolYear);
            }
        } catch (error) {
            setUpdateMessage({ 
                text: "Failed to update school year. Please try again.", 
                type: "error" 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closePromotionModal = () => {
        setIsPromotionModalOpen(false);
    };

    return (
        <div>
            <NavBar />
            <div className="flex flex-col md:flex-row w-auto justify-start items-start md:items-center gap-4 container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <PageHeader title="System Configuration" />
            </div>
           
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-white shadow-md rounded-md p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-2">School Year Settings</h2>
                        <p className="text-gray-600">
                            Current School Year: <span className="font-semibold">{currentSchoolYear || "Not set"}</span>
                        </p>
                    </div>
                    {updateMessage.text && (
                        <div className={`p-3 mb-4 rounded-md ${
                            updateMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {updateMessage.text}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <button
                            onClick={handleUpdateSchoolYear}
                            disabled={isUpdating}
                            className={`px-4 py-2 rounded-md text-white ${
                                isUpdating ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                            } transition-colors`}
                        >
                            {isUpdating ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                "Update School Year"
                            )}
                        </button>
                        <p className="text-sm text-gray-500">
                            The system will automatically determine and set the appropriate school year.
                            Students will be promoted only if their final grade average is greater than 85.
                        </p>
                    </div>
                </div>
            </div>

            {/* Missing Grades Modal */}
            {missingGradesData && (
                <MissingGradesModal 
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    missingGradesData={missingGradesData}
                    currentSchoolYear={currentSchoolYear}
                />
            )}

            {/* Promotion Results Modal */}
            {promotionData && (
                <PromotionResultsModal
                    isOpen={isPromotionModalOpen}
                    onClose={closePromotionModal}
                    promotionData={promotionData}
                />
            )}
        </div>
    );
};

// New modal component to display promotion results
const PromotionResultsModal = ({ isOpen, onClose, promotionData }) => {
    if (!isOpen) return null;

    const { promotionSummary } = promotionData;
    const hasRetainedStudents = promotionSummary.studentsRetained && promotionSummary.studentsRetained.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">School Year Update Results</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">School Year Updated</h3>
                    <p className="mb-1">
                        Previous School Year: <span className="font-medium">{promotionData.previousSchoolYear}</span>
                    </p>
                    <p>
                        Current School Year: <span className="font-medium">{promotionData.currentSchoolYear}</span>
                    </p>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Promotion Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                            <p className="text-sm text-gray-600">Total Students</p>
                            <p className="text-2xl font-bold">{promotionSummary.totalStudents}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-sm text-gray-600">Promoted Students</p>
                            <p className="text-2xl font-bold">{promotionSummary.promotedStudents}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-md">
                            <p className="text-sm text-gray-600">Graduated Students</p>
                            <p className="text-2xl font-bold">{promotionSummary.graduatedStudents || 0}</p>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">Students Not Meeting Requirements</p>
                        <p className="text-2xl font-bold">{promotionSummary.failedPromotions}</p>
                    </div>
                </div>

                {hasRetainedStudents && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Students Not Meeting Grade Requirements</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Student ID</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Grade Average</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Grade Level</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotionSummary.studentsRetained.map((student, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="border border-gray-300 px-4 py-2">{student.studentId}</td>
                                            <td className="border border-gray-300 px-4 py-2">{student.average.toFixed(2)}</td>
                                            <td className="border border-gray-300 px-4 py-2">{student.currentGrade}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                {student.status || (student.currentGrade === 12 ? "Senior Not Graduated" : "Retained")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            Students with grade averages below or equal to 85 are not promoted to the next grade level or graduated.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminManageConfigurationPage;