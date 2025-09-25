import React from 'react';

const DashboardWidgets = ({ teacherData }) => {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Teacher Profile Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-lg p-6 flex items-center space-x-6">
        <div className="flex-shrink-0">
          <span className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white border-2 border-primary">
            {teacherData.name ? teacherData.name.charAt(0).toUpperCase() : "T"}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-2xl font-bold text-primary mb-2">{teacherData.name}</h2>
          <div className="flex flex-col gap-2">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-base font-semibold border border-secondary/20">
              Class: {teacherData.className}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Placeholder Card */}
      <div className="bg-gradient-to-br from-muted/10 to-muted/5 rounded-2xl shadow-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-heading text-lg font-bold text-muted-foreground mb-2">Welcome, {teacherData.name}!</h3>
          <p className="text-muted-foreground text-sm">
            You are currently logged into <span className="font-semibold text-primary">{teacherData.className}</span>.
          </p>
        </div>
      </div>
      {/* Add more widgets as needed */}
    </div>
  );
};

export default DashboardWidgets;