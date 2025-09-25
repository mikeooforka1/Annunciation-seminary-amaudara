import React from 'react';

const WelcomeBanner = ({ teacherName }) => (
  <div className="flex items-center bg-gradient-to-r from-primary to-accent text-white p-6 rounded-2xl mb-6 shadow-lg">
    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 border-4 border-primary text-primary text-3xl font-bold shadow">
      {teacherName ? teacherName.charAt(0).toUpperCase() : "T"}
    </div>
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome, {teacherName}!</h1>
      <p className="text-base md:text-lg opacity-90">
        This is your teacher dashboard.<br />
        Manage your classes and connect with your students here.
      </p>
    </div>
  </div>
);

export default WelcomeBanner;