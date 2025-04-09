import React from "react";
import PageHeader from "../../components/page-header";
import Navbar from "../../components/navigation-bar";

const AdminManageConfigurationPage = () => {
    return (
        <div>
            <Navbar />
            <PageHeader title="Admin Manage Configuration" description="Manage the configuration of the system" />
            <div className="content">
                <h2>Configuration Management</h2>
                <p>Here you can manage the configuration of the system.</p>
                {/* Add your configuration management components here */}
            </div>
        </div>
    );
}
export default AdminManageConfigurationPage;
