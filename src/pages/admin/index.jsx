import React, { useEffect, useState } from "react";
import axios from "axios";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/class-list`);
      setClasses(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch classes.");
    }
    setLoading(false);
  };

  const handleClassSelect = async (className) => {
    setSelectedClass(className);
    setLoading(true);
    setErrorMsg("");
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/user/class/${className}/all/students`),
        axios.get(`${API_BASE_URL}/api/user?role=teacher`),
      ]);
      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data.filter((t) => t.className === className));
    } catch (err) {
      setErrorMsg("Failed to fetch class details.");
    }
    setLoading(false);
  };

  // Simple logout handler (clear adminData and reload or redirect)
  const handleLogout = () => {
    localStorage.removeItem("adminData");
    window.location.replace("/login-authentication");
  };

  // Filter students/teachers by search
  const filterUsers = (users) => {
    if (!search.trim()) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.className?.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Logout Button at the top */}
      <div className="w-full flex justify-end px-4 py-2 bg-card border-b border-border">
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Search bar for all screens */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="relative w-full max-w-xs mx-auto">
          <input
            type="text"
            className="w-full border border-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search students or teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-primary">
            <Icon name="Search" size={18} />
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 transition-all duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary mb-2 sm:mb-0">
            {selectedClass ? `Class: ${selectedClass}` : "Admin Dashboard"}
          </h1>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 text-center text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {errorMsg}
          </div>
        )}

        {/* Main Dashboard or Class Details */}
        {!selectedClass ? (
          <>
            <h2 className="font-heading text-xl mb-4">All Classes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.className}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-lg"
                  onClick={() => handleClassSelect(cls.className)}
                >
                  <div className="font-bold text-lg">{cls.className}</div>
                  <div className="text-muted-foreground text-sm">
                    Teacher: {cls.teacherName || "N/A"}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Students: {cls.studentCount || 0}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setSelectedClass(null)}
            >
              &larr; Back to All Classes
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Students in Class */}
              <section>
                <h2 className="font-heading text-lg mb-2">Students</h2>
                <div className="space-y-2">
                  {filterUsers(students).map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between bg-muted/10 rounded-lg px-3 py-2"
                    >
                      <span className="font-semibold">{student.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.className}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              {/* Teachers in Class */}
              <section>
                <h2 className="font-heading text-lg mb-2">Teachers</h2>
                <div className="space-y-2">
                  {filterUsers(teachers).map((teacher) => (
                    <div
                      key={teacher._id}
                      className="flex items-center justify-between bg-muted/10 rounded-lg px-3 py-2"
                    >
                      <span className="font-semibold">{teacher.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {teacher.className}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;