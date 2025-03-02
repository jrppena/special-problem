import {Routes, Route} from "react-router-dom";
// import Home from "./pages/HomePage";
import SignupPage from "./pages/signup-page";
import LoginPage from "./pages/login-page";
import VerificationPage from "./pages/verification-page";
import {useAuthStore} from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import "./index.css";
import HomePage from "./pages/home-page";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminVerificationPage from "./pages/admin/admin-verification-page";

const App = () => {
    const {authUser, checkAuth, isCheckingAuth} = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if(isCheckingAuth && !authUser){
        return(
            <div className="flex justify-center items-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    
    return(
        <div>
            <Toaster/>
            <Routes>
                <Route
                    path="/"
                    element={
                        isCheckingAuth ? (
                        // ✅ Show a loader while authentication is being verified
                        <div className="flex justify-center items-center h-screen">
                            <Loader2 className="size-10 animate-spin" />
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
                <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to ="/"/>} />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to ="/"/>} />
                <Route path="/verification" element={authUser ? ( authUser.accountStatus === "Verified" ? <Navigate to="/" /> : <VerificationPage />) : <Navigate to="/login" />} />
                <Route path="/admin/verify" element={authUser && authUser.role === "Admin" ? <AdminVerificationPage /> : <Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;