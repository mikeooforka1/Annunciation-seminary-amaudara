import React, { useState, useEffect } from 'react';
import RegistrationTabs from './RegistrationTabs';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const defaultProfile = {
  name: "",
  email: "",
  photo: "",
  gradeLevel: "",
  dob: "",
  gender: "",
  currentFunction: "",
  address: "",
};

const defaultRegistrationData = {
  parentGuardian: {},
  emergencyContact: {},
  medical: {},
  legal: {},
};

const ProfilePage = () => {
  // Move this line to the top of the component
  const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
  const userId = studentData._id;

  const [profile, setProfile] = useState(defaultProfile);
  const [registrationData, setRegistrationData] = useState(defaultRegistrationData);
  const [editing, setEditing] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Fetch profile from backend
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({
            ...prev,
            ...data, // Use all backend profile fields
          }));
        } else {
          // fallback: fetch basic info from user endpoint
          const resUser = await fetch(`${API_BASE_URL}/api/user/${userId}`);
          const dataUser = await resUser.json();
          setProfile((prev) => ({
            ...prev,
            gradeLevel: dataUser.className || dataUser.gradeLevel || prev.gradeLevel,
            name: dataUser.name || prev.name,
            email: dataUser.email || prev.email,
            dob: dataUser.dob || prev.dob,
            gender: dataUser.gender || prev.gender,
          }));
        }
      } catch (err) {
        // fallback: use localStorage
      }
    };

    fetchProfile();

    const savedRegistration = JSON.parse(localStorage.getItem('goshen-registration-data')) || defaultRegistrationData;
    setRegistrationData(savedRegistration);
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile((prev) => ({ ...prev, photo: ev.target.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save profile to backend
  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        localStorage.setItem('studentProfile', JSON.stringify(profile));
        setEditing(false);
      }
    } catch (err) {
      // Optionally show error
      setEditing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-10">
      <div className="flex flex-col sm:flex-row items-center mb-6 gap-4 sm:gap-6">
        <div className="relative group w-full sm:w-auto flex justify-center">
          <img
            src={profile.photo || "/assets/images/default_student.png"}
            alt="Student"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border cursor-pointer"
            onClick={() => setShowPhotoModal(true)}
            title="Click to view full photo"
            style={{ transition: "box-shadow 0.2s" }}
          />
          {editing && (
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer"
              style={{ height: "100%" }}
              onChange={handleChange}
              title="Change photo"
            />
          )}
        </div>
        <div className="text-center sm:text-left w-full">
          {editing ? (
            <>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border rounded px-2 py-1 mb-2"
              />
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border rounded px-2 py-1 mb-2"
              />
              <input
                type="text"
                name="gradeLevel"
                value={profile.gradeLevel}
                readOnly
                className="w-full border rounded px-2 py-1 mb-2 bg-gray-100 cursor-not-allowed"
                placeholder="Grade Level"
              />
              <input
                type="text"
                name="currentFunction"
                value={profile.currentFunction}
                onChange={handleChange}
                placeholder="Current Function"
                className="w-full border rounded px-2 py-1 mb-2"
              />
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full border rounded px-2 py-1 mb-2"
              />
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 mb-2"
              />
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 mb-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">{profile.name || "Student Name"}</h2>
              <p className="text-base sm:text-lg font-medium mb-1">Email: {profile.email || "student@email.com"}</p>
              <p className="text-base sm:text-lg font-medium mb-1">
                Grade Level: {profile.gradeLevel || "N/A"}
              </p>
              <p className="text-base sm:text-lg font-medium mb-1">
                Current Function: {profile.currentFunction || "N/A"}
              </p>
              <p className="text-base sm:text-lg font-medium mb-1">
                Address: {profile.address || "N/A"}
              </p>
              <p className="text-base sm:text-lg font-medium mb-1">Date of Birth: {profile.dob || "N/A"}</p>
              <p className="text-base sm:text-lg font-medium mb-1">Gender: {profile.gender || "N/A"}</p>
            </>
          )}
        </div>
      </div>
      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-4">
            <img
              src={profile.photo || "/assets/images/default_student.png"}
              alt="Full Student"
              className="max-w-full max-h-[80vh] rounded"
            />
            <button
              className="absolute top-2 right-2 bg-primary text-white rounded-full px-3 py-1"
              onClick={() => setShowPhotoModal(false)}
              title="Close"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-4 mb-4">
        {editing ? (
          <button
            className="bg-primary text-white px-4 py-2 rounded font-semibold"
            onClick={handleSave}
          >
            Save
          </button>
        ) : (
          <button
            className="bg-primary text-white px-4 py-2 rounded font-semibold"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )}
        {editing && (
          <button
            className="bg-gray-200 px-4 py-2 rounded font-semibold"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        )}
      </div>
      <div className="w-full">
        <RegistrationTabs userId={userId} registrationData={registrationData} />
      </div>
    </div>
  );
};

export default ProfilePage;