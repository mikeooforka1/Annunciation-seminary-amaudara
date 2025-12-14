import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RegistrationTabs from "../../profile/RegistrationTabs"; // Adjust path if needed

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const defaultProfile = {
  name: "",
  photo: "",
  gradeLevel: "",
  dob: "",
  gender: "",
  currentFunction: "",
  address: "",
};

const defaultRegistrationData = {
  parentGuardian: {},
  medical: {},
};

const StudentProfilePage = () => {
  const { studentId } = useParams();
  const [profile, setProfile] = useState(defaultProfile);
  const [registrationData, setRegistrationData] = useState(defaultRegistrationData);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false); // Modal state

  useEffect(() => {
    if (!studentId) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({
            ...prev,
            ...data,
          }));
        } else {
          // fallback: fetch basic info from user endpoint
          const resUser = await fetch(`${API_BASE_URL}/api/user/${studentId}`);
          const dataUser = await resUser.json();
          setProfile((prev) => ({
            ...prev,
            gradeLevel: dataUser.className || dataUser.gradeLevel || prev.gradeLevel,
            name: dataUser.name || prev.name,
            dob: dataUser.dob || prev.dob,
            gender: dataUser.gender || prev.gender,
          }));
        }
      } catch (err) {
        // Optionally handle error
      }
      setLoading(false);
    };

    const fetchRegistration = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/registration/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setRegistrationData(data);
        }
      } catch (err) {
        setRegistrationData(defaultRegistrationData);
      }
    };

    fetchProfile();
    fetchRegistration();
  }, [studentId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-10 text-center">
        Loading student profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-10">
      {/* Photo Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 shadow-lg max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profile.photo || "/assets/images/default_student.png"}
              alt="Student Large"
              className="max-w-[90vw] max-h-[80vh] rounded"
              style={{ display: "block", margin: "0 auto" }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center mb-6 gap-4 sm:gap-6">
        <div className="relative group">
          <img
            src={profile.photo || "/assets/images/default_student.png"}
            alt="Student"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border cursor-pointer"
            title="Click to enlarge"
            style={{ transition: "box-shadow 0.2s" }}
            onClick={() => setShowPhotoModal(true)}
          />
        </div>
        <div className="text-center sm:text-left w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
            {profile.name || "Student Name"}
          </h2>
          <p className="text-base sm:text-lg font-medium mb-1">
            Grade Level: {profile.gradeLevel || "N/A"}
          </p>
          <p className="text-base sm:text-lg font-medium mb-1">
            Current Function: {profile.currentFunction || "N/A"}
          </p>
          <p className="text-base sm:text-lg font-medium mb-1">
            Address: {profile.address || "N/A"}
          </p>
          <p className="text-base sm:text-lg font-medium mb-1">
            Date of Birth: {profile.dob || "N/A"}
          </p>
          <p className="text-base sm:text-lg font-medium mb-1">
            Gender: {profile.gender || "N/A"}
          </p>
        </div>
      </div>
      {/* Registration Tabs (readonly for admin) */}
      <div className="w-full">
        <RegistrationTabs registrationData={registrationData} userId={studentId} readOnly={true} />
      </div>
    </div>
  );
};

export default StudentProfilePage;