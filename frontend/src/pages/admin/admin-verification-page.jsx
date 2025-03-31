import React, { useEffect } from "react";
import NavBar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import ApprovalTable from "../../components/approval-table";
import { useApprovalStore } from "../../store/useApprovalStore";

const AdminVerificationPage = () => {
    const { 
        pendingUsers,
        totalUsers,
        loading,
        currentPage,
        itemsPerPage,
        isShowingAll,
        fetchPendingUsers,
        verifyUser,
        setPage,
        setShowAll
    } = useApprovalStore();
    
    const [userType, setUserType] = React.useState("All");
    const userTypeOptions = ["Student", "Teacher", "All"];

    // Fetch users when page, userType, or showAll changes
    useEffect(() => {
        fetchPendingUsers(userType);
    }, [currentPage, userType, isShowingAll]);
    
    // Handle user type change
    const handleUserTypeChange = (newType) => {
        setUserType(newType);
        setPage(1); // Reset to first page when changing user type
    };
    
    const handleVerify = (user, isVerified) => {
        verifyUser(user._id, isVerified);
    };

    return (
        <div>
            <NavBar />
            <div className="flex flex-col md:flex-row w-auto justify-start items-start md:items-center gap-4 container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <PageHeader title="Verify Accounts" />
                <Dropdown 
                    label="User Type" 
                    options={userTypeOptions} 
                    selected={userType} 
                    setSelected={handleUserTypeChange} 
                />
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-40 mt-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <ApprovalTable
                    userType={userType}
                    users={pendingUsers}
                    totalUsers={totalUsers}
                    currentPage={currentPage}
                    setCurrentPage={setPage}
                    itemsPerPage={itemsPerPage}
                    isShowingAll={isShowingAll}
                    setIsShowingAll={setShowAll}
                    onApprove={(user) => handleVerify(user, true)}
                    onDisapprove={(user) => handleVerify(user, false)}
                />
            )}
        </div>        
    );
};

export default AdminVerificationPage;