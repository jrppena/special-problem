import React, { useState } from "react";
import { EyeOff, Eye, Loader2, Camera } from "lucide-react";
import Navbar from "../components/navigation-bar";
import PageHeader from "../components/page-header";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

const UserProfile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(authUser.profilePic || "/avatar.png");
  const [didChangeImage, setDidChangeImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImage(base64Image);   
        setDidChangeImage(true);
    }
    
  };

  const [formData, setFormData] = useState({
    contact_number: authUser.contactNumber|| "",
    address: authUser.address || "",
  });

  const validateUpdate = () => {
    
    if(authUser.contactNumber === formData.contact_number && authUser.address === formData.address && !didChangeImage){
        toast.error("There aren't any changes to update");
        return false;
    }

    if (formData.contact_number && /^(09|\+639)\d{9}$/.test(formData.contact_number) === false) {
        toast.error("Invalid contact number format");
        return false;

    }

    return true
  }


  const handleUpdate = async (e) => {
    e.preventDefault();
    const success = validateUpdate();
    if(success) updateProfile({ ...formData, selectedImage, didChangeImage });
  };

  return (
    <div className="-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <PageHeader title="Profile Settings" />
      </div>

      <section className="py-12 flex justify-center">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl p-10 transition hover:shadow-2xl">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative w-32 h-32">
              <img
                src={selectedImage}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-gray-700 hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUploading || isUpdatingProfile ? "animate-pulse pointer-events-none opacity-50" : ""}
                `}
              >
                {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading || isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUploading ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-semibold text-gray-900">{authUser.firstName + " " + authUser.lastName}</h2>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-3 gap-6 mt-2">
            {/* User ID */}
            <div className="col-span-3 md:col-span-1">
              <label className="block text-lg font-medium text-gray-700">User ID</label>
              <input
                type="text"
                value={"USER-" + authUser._id.toUpperCase().slice(0,5) || "N/A"}
                className="mt-1 w-full rounded-md border-2 border-gray-300 bg-gray-200 text-lg text-gray-700 py-3 px-4 shadow-md cursor-not-allowed"
                disabled
              />
            </div>

            {/* First Name */}
            <div className="col-span-3 md:col-span-1">
              <label className="block text-lg font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={authUser.firstName}
                className="mt-1 w-full rounded-md border-2 border-gray-300 bg-gray-200 text-lg text-gray-700 py-3 px-4 shadow-md focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>

            {/* Last Name */}
            <div className="col-span-3 md:col-span-1">
              <label className="block text-lg font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={authUser.lastName}
                className="mt-1 w-full rounded-md border-2 border-gray-300 bg-gray-200 text-lg text-gray-700 py-3 px-4 shadow-md focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>

            
            {authUser.role === "Student" && (
                <>
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-lg font-medium text-gray-700">Current Grade Level</label>
                    <input
                      type="text"
                      value={authUser.gradeLevel}
                      className="mt-1 w-full rounded-md border-2 border-gray-300 bg-gray-200 text-lg text-gray-700 py-3 px-4 shadow-md cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-lg font-medium text-gray-700">Academic Status</label>
                    <input
                      type="text"
                      value={authUser.academicStatus || "N/A"}
                      className="mt-1 w-full rounded-md border-2 border-gray-300 bg-gray-200 text-lg text-gray-700 py-3 px-4 shadow-md cursor-not-allowed"
                      disabled
                    />
                  </div>
                </>
              )}

            {/* Contact Number */}
            <div className="col-span-3 md:col-span-1">
              <label className="block text-lg font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                value={formData.contact_number}
                placeholder="09XXXXXXXXX"
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                disabled={isUpdatingProfile}
                className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Address */}
            <div className="col-span-3 md:col-span-1">
              <label className="block text-lg font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isUpdatingProfile}
                className="mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-lg text-gray-700 py-3 px-4 shadow-md focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {/* Update Button */}
            <div className="col-span-3 flex justify-center mt-6">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-500"
                disabled={isUpdatingProfile}
                onSubmit={handleUpdate}
              >
                {isUpdatingProfile ? <Loader2 className="size-5 animate-spin inline-block" /> : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
