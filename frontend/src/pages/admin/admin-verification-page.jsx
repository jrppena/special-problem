import React, { useEffect, useState } from "react";
import NavBar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import Dropdown from "../../components/drop-down";
import { useAuthStore } from "../../store/useAuthStore";
import ApprovalTable from "../../components/approval-table";
import { useApprovalStore } from "../../store/useApprovalStore";


const AdminVerificationPage = () => {

    const [userType, setUserType] = useState("All");
    const {pendingUsers, fetchPendingUsers,verifyUser} = useApprovalStore();
    const userTypeOptions = ["Student","Teacher","All"];

    useEffect(() => {
        fetchPendingUsers();
    }, [pendingUsers]);
    
    
    const handleVerify = (user,isVerified) => {
        verifyUser(user._id,isVerified);

    };
    return(
        <div>
            <NavBar />
            <div className="flex flex-col md:flex-row w-auto justify-start items-start md:items-center gap-4 container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <PageHeader title="Verify Accounts" />
                <Dropdown label="User Type" options={userTypeOptions} selected={userType} setSelected={setUserType} />
            </div>
            <ApprovalTable
                userType={userType}
                users={pendingUsers}
                onApprove={(user) => handleVerify(user, true)}
                onDisapprove={(user) => handleVerify(user, false)}
            />
            
        </div>        
    )

};

export default AdminVerificationPage;