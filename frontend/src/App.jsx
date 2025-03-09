import { Routes, Route } from "react-router-dom";

import SignupPage from "./pages/signup-page";
import LoginPage from "./pages/login-page";
import VerificationPage from "./pages/verification-page";
import HomePage from "./pages/home-page";
import UserProfile from "./pages/user-profile-page";
import NotFoundPage from "./pages/not-found-page";

import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AdminManageSectionPage from "./pages/admin/admin-manage-section-page";
import AdminManageClassPage from "./pages/admin/admin-manage-class-page";
import AdminVerificationPage from "./pages/admin/admin-verification-page";

import TeacherSectionManagementPage from "./pages/teacher/teacher-section-management-page";

import "./index.css";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <Toaster />
            <Routes>
                <Route
                    path="/"
                    element={
                        isCheckingAuth ? (
                            <div className="flex justify-center items-center h-screen">
                                <Loader className="size-10 animate-spin" />
                            </div>
                        ) : authUser ? (
                            authUser.accountStatus === "Verified" ? (
                                <HomePage />
                            ) : (
                                <VerificationPage />
                            )
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/verification" element={authUser ? (authUser.accountStatus === "Verified" ? <Navigate to="/" /> : <VerificationPage />) : <Navigate to="/login" />} />
                <Route path="/profile" element={authUser ? <UserProfile /> : <Navigate to="/login" />} />
                
                <Route path="/admin/verify" element={authUser && authUser.role === "Admin" ? <AdminVerificationPage /> : <Navigate to="/" />} />
                <Route path="/admin/manage-sections" element={authUser && authUser.role === "Admin" ? <AdminManageSectionPage /> : <Navigate to="/" />} />
                <Route path="/admin/manage-classes" element={authUser && authUser.role === "Admin" ? <AdminManageClassPage /> : <Navigate to="/" />} />

                <Route path="/teacher/manage-sections" element={authUser && authUser.role === "Teacher" ? <TeacherSectionManagementPage /> : <Navigate to="/" />} />

                {/* Wildcard route for handling undefined routes */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
};

export default App;
