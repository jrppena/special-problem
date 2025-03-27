import React, { useEffect } from "react";
import Navbar from "../../components/navigation-bar";
import PageHeader from "../../components/page-header";
import { useLocation } from "react-router-dom";
import { useTeacherStore } from "../../store/useTeacherStore";

const TeacherSectionGradesPage = () => {
    const location = useLocation();
    const {sectionId,} = location.state;
    const {getAdviserSectionGrades,adviserSectionGrades} = useTeacherStore();
    
    useEffect(() => {
        getAdviserSectionGrades();
    },[location]);
    
    return(
        <div>
            <Navbar />
            <PageHeader title="Section Grades"/>
        </div>
    )
}

export default TeacherSectionGradesPage;