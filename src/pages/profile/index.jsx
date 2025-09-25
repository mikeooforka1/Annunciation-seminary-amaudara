import React, { useState, useEffect } from 'react';
import RegistrationTabs from './RegistrationTabs';

const defaultProfile = {
  name: "",
  email: "",
  photo: "",
  gradeLevel: "",
  dob: "",
  gender: "",
};

const defaultRegistrationData = {
  personal: {},
  parentGuardian: {},
  emergencyContact: {},
  medical: {},
  legal: {},
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [registrationData, setRegistrationData] = useState(defaultRegistrationData);

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('studentProfile')) || defaultProfile;
    const savedRegistration = JSON.parse(localStorage.getItem('goshen-registration-data')) || defaultRegistrationData;
    setProfile(savedProfile);
    setRegistrationData(savedRegistration);
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-10">
      <div className="flex flex-col sm:flex-row items-center mb-6 gap-4 sm:gap-6">
        <img
          src={profile.photo || "/assets/images/default_student.png"}
          alt="Student"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border"
        />
        <div className="text-center sm:text-left w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">{profile.name || "Student Name"}</h2>
          <p className="text-base sm:text-lg font-medium mb-1">Email: {profile.email || "student@email.com"}</p>
          <p className="text-base sm:text-lg font-medium mb-1">Grade Level: {profile.gradeLevel || "N/A"}</p>
          <p className="text-base sm:text-lg font-medium mb-1">Date of Birth: {profile.dob || "N/A"}</p>
          <p className="text-base sm:text-lg font-medium mb-1">Gender: {profile.gender || "N/A"}</p>
        </div>
      </div>
      <div className="w-full">
        <RegistrationTabs registrationData={registrationData} />
      </div>
    </div>
  );
};

export default ProfilePage;