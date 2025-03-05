import React from 'react';
import schoolImage from "../assets/school.jpg";
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { EyeOff } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';


function SignupPage() {
    const [role, setRole] = useState("Student");
    const [isNewStudent, setIsNewStudent] = useState("New"); // "New" or "Transferee"
    const [selectedGradeLevel, setSelectedGradeLevel] = useState(""); // Only for transferees

    const [showPassword, setShowPassword] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: role,
        gradeLevel: selectedGradeLevel,
    });

    const {signup} = useAuthStore();
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0); // Track error position
    const [errors, setErrors] = useState([]); // Store all errors
    const [toastId, setToastId] = useState(null); // Store toast ID for dismissal
    const [isFading, setIsFading] = useState(false); // Track toast fade animation
    
    const validateForm = () => {
        let errorList = [];
    
        if (!formData.first_name.trim()) errorList.push("First Name is required");
        if (!formData.last_name.trim()) errorList.push("Last Name is required");
        if (!formData.email.trim()) errorList.push("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) errorList.push("Invalid email format");
        if (!formData.password.trim()) errorList.push("Password is required");
        if (formData.password.length < 6) errorList.push("Password must be at least 6 characters");
        if (formData.password !== formData.password_confirmation) errorList.push("Passwords do not match");
        if (isNewStudent === "Transferee" && !selectedGradeLevel) errorList.push("Please select your current grade level");
    
        if (errorList.length > 0) {
            setErrors(errorList);
            setCurrentErrorIndex(0);
            showToast(errorList, 0);
            return false;
        }
    
        return true;
    };
    
    const showToast = (errorList, index) => {
        setCurrentErrorIndex(index);
    
        if (toastId) {
            toast.dismiss(toastId);
        }
    
        const newToastId = toast.custom((t) => (
            <div className="flex items-center justify-between gap-4 bg-white text-black px-4 py-3 rounded-md shadow-md w-80 border border-red-500">
                {/* Red Error Icon */}
                <AlertCircle className="size-6 text-red-500" />
    
                {/* Error Message */}
                <p className="text-sm">{errorList[index]}</p>
    
                {/* Navigation Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (index > 0) {
                                showToast(errorList, index - 1);
                            }
                        }}
                        disabled={index === 0}
                    >
                        <ChevronLeft className={`size-5 ${index === 0 ? "text-gray-400" : "text-black"}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (index < errorList.length - 1) {
                                showToast(errorList, index + 1);
                            }
                        }}
                        disabled={index === errorList.length - 1}
                    >
                        <ChevronRight className={`size-5 ${index === errorList.length - 1 ? "text-gray-400" : "text-black"}`} />
                    </button>
                </div>
    
                {/* Close Button */}
                <button onClick={() => toast.dismiss(t.id)}>
                    <X className="size-5 text-gray-500 hover:text-gray-700" />
                </button>
            </div>
        ), {
            id: "error-toast",
            position: "bottom-right",
            duration: Infinity,
        });
    
        setToastId(newToastId);
    };
    

    const handleSubmit = (e) =>{
        e.preventDefault();
        const success = validateForm();

        if(success) signup(formData);

    }

    
  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        {/* Left Section with Image */}
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src= {schoolImage}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        </section>

        {/* Right Section with Form */}
        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
              Create an Account
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Join **AcadBridge** to stay updated on grades and school events.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">
              {/* First Name */}
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="FirstName" className="block text-lg font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="FirstName"
                  name="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="LastName" className="block text-lg font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="LastName"
                  name="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div className="col-span-6">
                <label htmlFor="Email" className="block text-lg font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="Email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                
             {/* Password */}
            <div className="col-span-6 sm:col-span-3">
                <label htmlFor="Password" className="block text-lg font-medium text-gray-700">
                    Password
                </label>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    id="Password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />

                    {/* Eye Toggle Button for Password */}
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                    {showPassword ? (
                        <EyeOff className="size-5" />
                    ) : (
                        <Eye className="size-5" />
                    )}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div className="col-span-6 sm:col-span-3">
                <label htmlFor="PasswordConfirmation" className="block text-lg font-medium text-gray-700">
                    Confirm Password
                </label>
                <div className="relative">
                    <input
                    type={showPasswordConfirmation ? "text" : "password"}
                    id="PasswordConfirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />

                    {/* Eye Toggle Button for Confirm Password */}
                    <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                    {showPasswordConfirmation ? (
                        <EyeOff className="size-5" />
                    ) : (
                        <Eye className="size-5" />
                    )}
                    </button>
            </div>
            </div>


              <div className="col-span-6">
                <label className="block text-lg font-medium text-gray-700">Select Role</label>
                <div className="mt-2 flex gap-4">
                    {/* Student Role */}
                    <label
                    htmlFor="role-student"
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-md shadow-sm cursor-pointer"
                    >
                    <input
                        id="role-student"
                        type="radio"
                        name="role"
                        value="Student"
                        onChange={() => {
                          setRole("Student");
                          setFormData(prevState => ({ ...prevState, role: "Student" }));
                        }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium text-gray-900">Student</span>
                    </label>

                    {/* Teacher Role */}
                    <label
                    htmlFor="role-teacher"
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-md shadow-sm cursor-pointer"
                    >
                    <input
                        id="role-teacher"
                        type="radio"
                        name="role"
                        value="Teacher"
                        checked={role === "Teacher"}
                        onChange={() => {
                          setRole("Teacher");
                          setFormData(prevState => ({ ...prevState, role: "Teacher" }));
                      }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium text-gray-900">Teacher</span>
                    </label>
                </div>
                </div>

                 {/* New Student or Transferee */}
                 {role === "Student" && (
                                <div className="col-span-6">
                                    <label className="block text-lg font-medium text-gray-700">Are you a new student or a transferee?</label>
                                    <select className="mt-2 w-full p-3 border rounded-md" value={isNewStudent} onChange={(e) => setIsNewStudent(e.target.value)}>
                                        <option value="New">New Student</option>
                                        <option value="Transferee">Transferee</option>
                                    </select>
                                </div>
                            )}

                            {/* Transferee Grade Level Selection */}
                            {role === "Student" && isNewStudent === "Transferee" && (
                                <div className="col-span-6">
                                    <label className="block text-lg font-medium text-gray-700">Select Current Grade Level</label>
                                    <select className="mt-2 w-full p-3 border rounded-md" value={selectedGradeLevel} onChange={(e) => setSelectedGradeLevel(e.target.value)}>
                                        <option value="">Select...</option>
                                        {["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                            )}



              {/* Buttons */}
              <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-16 py-4 text-lg font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:ring-2 focus:ring-blue-500"
                disabled={isSigningUp}
                >
                {isSigningUp ? (
                    <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading...
                    </>
                ) : (
                    "Create Account"
                )}
              </button>

                <p className="mt-4 text-lg text-gray-600 sm:mt-0">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-600 underline">
                    Log in
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
}

export default SignupPage;
