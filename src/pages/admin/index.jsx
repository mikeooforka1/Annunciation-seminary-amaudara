import React, { useEffect, useState } from "react";
import axios from "axios";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import TeachersList from "./components/teachers";
import FormatorsList from "./components/formators";
import ExpelledStudents from "./components/expelled-students";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const adminCards = [
  {
    key: "students",
    icon: <Icon name="Users" size={36} className="text-primary mb-2" />,
    title: "Students",
    desc: "View all students by class",
  },
  {
    key: "teachers",
    icon: <Icon name="UserCheck" size={36} className="text-accent mb-2" />,
    title: "Teachers",
    desc: "See all teachers in the school",
  },
  {
    key: "formators",
    icon: <Icon name="Award" size={36} className="text-primary mb-2" />,
    title: "Formators",
    desc: "Meet all formators",
  },
  {
    key: "nonAcademic",
    icon: <Icon name="Briefcase" size={36} className="text-accent mb-2" />,
    title: "Non-Academic Staff",
    desc: "All non-academic staff",
  },
  {
    key: "expelled",
    icon: <Icon name="UserX" size={36} className="text-red-500 mb-2" />,
    title: "Expelled/Suspended",
    desc: "View expelled or suspended students",
  },
  {
    key: "verify",
    icon: <Icon name="CheckCircle" size={36} className="text-green-500 mb-2" />,
    title: "Verify Results",
    desc: "Verify student results",
  },
];

const AdminDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formators, setFormators] = useState([]);
  const [nonAcademic, setNonAcademic] = useState([]);
  const [expelled, setExpelled] = useState([]);
  const [showSection, setShowSection] = useState(null); // 'students', 'teachers', 'formators', 'nonAcademic', 'expelled', 'verify'
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

  // Fetch all teachers
  const fetchTeachers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user?role=teacher`);
      setTeachers(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch teachers.");
    }
    setLoading(false);
  };

  // Fetch all formators
  const fetchFormators = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/formators`);
      setFormators(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch formators.");
    }
    setLoading(false);
  };

  // Fetch all non-academic staff
  const fetchNonAcademic = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user?role=non-academic`);
      setNonAcademic(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch non-academic staff.");
    }
    setLoading(false);
  };

  // Fetch expelled/suspended students
  const fetchExpelled = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expelled-students`);
      setExpelled(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch expelled/suspended students.");
    }
    setLoading(false);
  };

  // Fetch students in a class
  const handleClassSelect = async (className) => {
    setSelectedClass(className);
    setLoading(true);
    setErrorMsg("");
    try {
      const studentsRes = await axios.get(
        `${API_BASE_URL}/api/user/class/${className}/all/students`
      );
      setStudents(studentsRes.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch class students.");
    }
    setLoading(false);
  };

  // Simple logout handler (clear adminData and reload or redirect)
  const handleLogout = () => {
    localStorage.removeItem("adminData");
    window.location.replace("/login-authentication");
  };

  // Filter users by search
  const filterUsers = (users) => {
    if (!search.trim()) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.className?.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Section handlers
  const handleSection = async (section) => {
    setShowSection(section);
    setSelectedClass(null);
    setSearch("");
    setErrorMsg("");
    if (section === "teachers") fetchTeachers();
    if (section === "formators") fetchFormators();
    if (section === "nonAcademic") fetchNonAcademic();
    if (section === "expelled") fetchExpelled();
    // students and verify don't need fetch here
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Logout Button at the top */}
      <div className="w-full flex justify-end px-4 py-2 bg-card border-b border-border">
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Horizontal Cards Section */}
      <div className="w-full bg-white shadow-sm border-b border-border py-4 px-2 flex overflow-x-auto gap-4">
        {adminCards.map((card) => (
          <div
            key={card.key}
            className="min-w-[200px] max-w-xs flex-shrink-0 bg-card border border-border rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            onClick={() =>
              card.key === "teachers"
                ? setShowSection("teachers")
                : handleSection(card.key)
            }
          >
            {card.icon}
            <h2 className="font-heading font-bold text-base mb-1">{card.title}</h2>
            <p className="text-muted-foreground text-xs text-center">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 transition-all duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary mb-2 sm:mb-0">
            Admin Dashboard
          </h1>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 text-center text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {errorMsg}
          </div>
        )}

        {/* Main Section Content */}
        {!showSection && (
          <div className="mt-8">
            {/* Admin Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col items-center">
                <Icon name="Users" size={28} className="text-primary mb-2" />
                <div className="text-lg font-bold text-primary">
                  {classes.reduce((acc, cls) => acc + (cls.studentCount || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex flex-col items-center">
                <Icon name="UserCheck" size={28} className="text-accent mb-2" />
                <div className="text-lg font-bold text-accent">
                  {teachers.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Teachers</div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col items-center">
                <Icon name="Award" size={28} className="text-primary mb-2" />
                <div className="text-lg font-bold text-primary">
                  {formators.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Formators</div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex flex-col items-center">
                <Icon name="Briefcase" size={28} className="text-accent mb-2" />
                <div className="text-lg font-bold text-accent">
                  {nonAcademic.length}
                </div>
                <div className="text-xs text-muted-foreground">Non-Academic Staff</div>
              </div>
            </div>
            {/* Admin Notices or Useful Links */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="font-heading font-bold text-lg mb-2 text-primary">
                Admin Notices
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                <li>Remember to regularly back up the database.</li>
                <li>Review and approve pending result verifications.</li>
                <li>Monitor user activity for unusual behavior.</li>
                <li>Update staff and student records as needed.</li>
                <li>Check for new announcements to post.</li>
              </ul>
            </div>
            {/* Useful Links */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-heading font-bold text-lg mb-2 text-primary">
                Useful Links
              </h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/admin/settings"
                  className="text-primary underline text-sm"
                >
                  Admin Settings
                </a>
                <a
                  href="/admin/logs"
                  className="text-primary underline text-sm"
                >
                  System Logs
                </a>
                <a
                  href="/admin/support"
                  className="text-primary underline text-sm"
                >
                  Support
                </a>
                <a
                  href="/admin/announcements"
                  className="text-primary underline text-sm"
                >
                  Manage Announcements
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Students Section: Show classes, then students in class */}
        {showSection === "students" && !selectedClass && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowSection(null)}
            >
              &larr; Back to Dashboard
            </Button>
            {/* Total number of students in the school */}
            <div className="mb-4 text-lg font-semibold text-primary">
              Total Students in School:{" "}
              {classes.reduce((acc, cls) => acc + (cls.studentCount || 0), 0)}
            </div>
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
        )}

        {/* Students in selected class */}
        {showSection === "students" && selectedClass && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setSelectedClass(null)}
            >
              &larr; Back to Classes
            </Button>
            <h2 className="font-heading text-xl mb-4">
              Students in {selectedClass}
            </h2>
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
          </>
        )}

        {/* Teachers Section */}
        {showSection === "teachers" && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowSection(null)}
            >
              &larr; Back to Dashboard
            </Button>
            <TeachersList />
          </>
        )}

        {/* Formators Section */}
        {showSection === "formators" && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowSection(null)}
            >
              &larr; Back to Dashboard
            </Button>
            <FormatorsList />
          </>
        )}

        {/* Non-Academic Staff Section */}
        {showSection === "nonAcademic" && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowSection(null)}
            >
              &larr; Back to Dashboard
            </Button>
            <h2 className="font-heading text-xl mb-4">Non-Academic Staff</h2>
            <div className="space-y-2">
              {filterUsers(nonAcademic).map((staff) => (
                <div
                  key={staff._id}
                  className="flex items-center justify-between bg-muted/10 rounded-lg px-3 py-2"
                >
                  <span className="font-semibold">{staff.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {staff.role}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Expelled/Suspended Students Section */}
        {showSection === "expelled" && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowSection(null)}
            >
              &larr; Back to Dashboard
            </Button>
            <ExpelledStudents />
          </>
        )}

        {/* Verify Results Section */}
        {showSection === "verify" && (
          <>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowSection(null)}
            >
              &larr; Back to Dashboard
            </Button>
            <h2 className="font-heading text-xl mb-4">Verify Results</h2>
            <div className="text-muted-foreground">
              {/* Implement your result verification logic here */}
              <p>Result verification functionality coming soon.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;