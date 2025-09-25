import React, { useState, useEffect } from 'react';

const tabList = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'parentGuardian', label: 'Parent/Guardian' },
  { key: 'emergencyContact', label: 'Emergency Contact' },
  { key: 'medical', label: 'Medical Info' },
  { key: 'legal', label: 'Legal & Account' },
];

const RegistrationTabs = ({ registrationData }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [data, setData] = useState(registrationData);

  useEffect(() => {
    // Always reload latest registration data from localStorage
    const latestData = JSON.parse(localStorage.getItem('goshen-registration-data')) || registrationData;
    setData(latestData);
  }, []);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap border-b mb-4 gap-2">
        {tabList.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-background p-4 rounded shadow">
        {activeTab === 'personal' && (
          <div>
            <h3 className="font-bold mb-2">Personal Information</h3>
            <p>Name: {data.personal?.firstName} {data.personal?.middleName} {data.personal?.lastName}</p>
            <p>Date of Birth: {data.personal?.dob}</p>
            <p>Gender: {data.personal?.gender}</p>
            <p>Grade Level: {data.personal?.gradeLevel}</p>
            <p>Phone: {data.personal?.phoneNumber}</p>
            <p>Address: {data.personal?.address}</p>
            <p>Photo: {data.personal?.photo ? <img src={data.personal.photo} alt="Profile" className="w-16 h-16 rounded-full mt-2" /> : 'No photo'}</p>
          </div>
        )}
        {activeTab === 'parentGuardian' && (
          <div>
            <h3 className="font-bold mb-2">Parent/Guardian Information</h3>
            <p>Name: {data.parentGuardian?.firstName} {data.parentGuardian?.middleName} {data.parentGuardian?.lastName}</p>
            <p>Relationship: {data.parentGuardian?.relationship}</p>
            <p>Email: {data.parentGuardian?.email}</p>
            <p>Phone: {data.parentGuardian?.phone}</p>
            <p>Address: {data.parentGuardian?.address}, {data.parentGuardian?.city}, {data.parentGuardian?.state}, {data.parentGuardian?.zip}</p>
          </div>
        )}
        {activeTab === 'emergencyContact' && (
          <div>
            <h3 className="font-bold mb-2">Emergency Contact</h3>
            <p>Name: {data.emergencyContact?.name}</p>
            <p>Relationship: {data.emergencyContact?.relationship}</p>
            <p>Phone: {data.emergencyContact?.phone}</p>
            <p>Medical Authorization: {data.emergencyContact?.medicalAuth ? 'Yes' : 'No'}</p>
          </div>
        )}
        {activeTab === 'medical' && (
          <div>
            <h3 className="font-bold mb-2">Medical Information</h3>
            <p>Allergies: {data.medical?.allergies}</p>
            <p>Conditions: {data.medical?.conditions}</p>
            <p>Medications: {data.medical?.medications}</p>
            <p>Physician: {data.medical?.physicianName} ({data.medical?.physicianPhone})</p>
            <p>Insurance: {data.medical?.insurance}</p>
          </div>
        )}
        {activeTab === 'legal' && (
          <div>
            <h3 className="font-bold mb-2">Legal & Account</h3>
            <p>Media Consent: {data.legal?.mediaConsent ? 'Yes' : 'No'}</p>
            <p>Emergency Consent: {data.legal?.emergencyConsent ? 'Yes' : 'No'}</p>
            <p>Privacy Policy: {data.legal?.privacyPolicy ? 'Agreed' : 'Not Agreed'}</p>
            <p>Email: {data.legal?.email}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationTabs;