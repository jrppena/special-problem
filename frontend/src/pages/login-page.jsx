import React from 'react';
import schoolImage from "../assets/school.jpg";
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { EyeOff } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from "react-hot-toast";


function SignupPage() {

    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const {login} = useAuthStore();
    
    const validateForm = () => {
        
        if (!formData.email) {
           return toast.error("Email is required");
        }
        if(!formData.password){
            return toast.error("Password is required"); 
        }

        return true;
    };

    const handleSubmit = (e) =>{
        e.preventDefault();
        const success = validateForm();

        if(success) login(formData);

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
              Login to Account
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Login to **AcadBridge** to check on grades and school events.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">

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


              {/* Buttons */}
              <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-16 py-4 text-lg font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:ring-2 focus:ring-blue-500"
                disabled={isLoggingIn}
                >
                {isLoggingIn ? (
                    <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading...
                    </>
                ) : (
                    "Create Account"
                )}
              </button>

                <p className="mt-4 text-lg text-gray-600 sm:mt-0">
                  Don't have an account?{" "}
                  <a href="/signup" className="text-blue-600 underline">
                    Signup
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
