import React, { useEffect, useState } from "react";
import NavBar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import MissingGradesModal from "../../components/missing-grades-modal";
import { useConfigStore } from "../../store/useConfigStore";

const AdminManageConfigurationPage = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ text: "", type: "" });
    const [missingGradesData, setMissingGradesData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
       
        try {
            const response = await updateCurrentSchoolYear(currentSchoolYear);
            
            // Check if the response contains missing grades data
            if (response && response.sections) {
                setMissingGradesData(response);
                setIsModalOpen(true);
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
        </div>
    );
};

export default AdminManageConfigurationPage;