import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import TeachersList from "./components/teachers";
import FormatorsList from "./components/formators";
import NonAcademicStaffList from "./components/non-academic staffs";
import VerifyResult from "./components/verify-result";
import { useNavigate, useLocation } from "react-router-dom";

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
  const [showSection, setShowSection] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentName, setEditingStudentName] = useState("");
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchFormators();
    fetchNonAcademic();
  }, []);

 useEffect(() => {
  if (location.state?.showSection === "verify") {
    setShowSection("verify");

    navigate("/admin", {
      replace: true,
      state: {},
    });
  }
}, [location.state, navigate]);

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

  const fetchNonAcademic = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/non-academic`);
      setNonAcademic(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to fetch non-academic staff.");
    }
    setLoading(false);
  };

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

  const handleLogout = () => {
    localStorage.removeItem("adminData");
    window.location.replace("/login-authentication");
  };

  const filterUsers = (users) => {
    if (!search.trim()) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.className?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleSection = async (section) => {
    setShowSection(section);
    setSelectedClass(null);
    setSearch("");
    setErrorMsg("");
    if (section === "teachers") fetchTeachers();
    if (section === "formators") fetchFormators();
    if (section === "nonAcademic") fetchNonAcademic();
  };

  const handleStudentNameEdit = (student) => {
    setEditingStudentId(student._id);
    setEditingStudentName(student.name);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleStudentNameChange = (e) => {
    setEditingStudentName(e.target.value);
  };

  const handleStudentNameSave = async (student) => {
    if (!editingStudentName.trim() || editingStudentName === student.name) {
      setEditingStudentId(null);
      setEditingStudentName("");
      return;
    }
    setSavingStudentId(student._id);
    try {
      await axios.put(`${API_BASE_URL}/api/user/${student._id}/update-name`, {
        name: editingStudentName.trim(),
      });
      setStudents((prev) =>
        prev.map((s) =>
          s._id === student._id ? { ...s, name: editingStudentName.trim() } : s
        )
      );
      setEditingStudentId(null);
      setEditingStudentName("");
      setSuccessMsg("Student name updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to update student name.");
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    setDeletingStudentId(studentId);
    setErrorMsg("");
    try {
      await axios.delete(`${API_BASE_URL}/api/user/${studentId}`);

      setStudents((prev) => prev.filter((s) => s._id !== studentId));

      setClasses((prev) =>
        prev.map((cls) =>
          cls.className === selectedClass
            ? { ...cls, studentCount: Math.max(0, cls.studentCount - 1) }
            : cls
        )
      );

      setDeleteConfirmId(null);
      setSuccessMsg("Student deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to delete student.");
    } finally {
      setDeletingStudentId(null);
    }
  };

  const DeleteConfirmationDialog = ({ student, onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Delete Student?
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{student.name}</strong> from {selectedClass}?
        </p>
        <p className="text-red-600 text-sm mb-6 font-semibold">
          ⚠️ This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative">
      {/* Premium Admin Dashboard Header */}
      <div className="w-full bg-gradient-to-r from-primary/95 via-primary to-accent/90 shadow-lg border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
              <Icon name="BarChart3" size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-white/80 text-sm mt-1">School Management Control Panel</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Premium Navigation Cards Section */}
      {!showSection && (
        <div className="w-full bg-white/40 backdrop-blur-md border-b border-white/20 py-6 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {adminCards.map((card) => (
              <div
                key={card.key}
                className="group relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col items-center cursor-pointer shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300 overflow-hidden"
                onClick={() =>
                  card.key === "teachers"
                    ? setShowSection("teachers")
                    : handleSection(card.key)
                }
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h2 className="font-heading font-bold text-base sm:text-lg mb-1 text-slate-800 text-center relative z-10">{card.title}</h2>
                <p className="text-muted-foreground text-xs sm:text-sm text-center relative z-10 line-clamp-2">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-200">
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm flex items-center gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-600 hover:text-red-800 transition">
              ✕
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm flex items-center gap-3">
            <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium flex-1">{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-green-600 hover:text-green-800 transition">
              ✕
            </button>
          </div>
        )}

        {/* Admin Quick Stats */}
        {!showSection && (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Total Students Card */}
              <div className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Icon name="Users" size={32} className="text-white" />
                    </div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      Total
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-4xl sm:text-5xl font-bold text-slate-900">
                      {classes.reduce((acc, cls) => acc + (cls.studentCount || 0), 0)}
                    </div>
                    <div className="text-slate-600 font-medium mt-2">Students Enrolled</div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <p className="text-sm text-slate-500">Across all classes in the school</p>
                  </div>
                </div>
              </div>

              {/* Total Teachers Card */}
              <div className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                      <Icon name="UserCheck" size={32} className="text-white" />
                    </div>
                    <div className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      Active
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-4xl sm:text-5xl font-bold text-slate-900">
                      {teachers.length}
                    </div>
                    <div className="text-slate-600 font-medium mt-2">Teachers on Staff</div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <p className="text-sm text-slate-500">Quality educators and mentors</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Premium Admin Notices Section */}
            <div className="relative bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20" />
              <div className="relative z-10 p-6 sm:p-8">
                <h2 className="font-heading font-bold text-2xl mb-6 text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Icon name="AlertTriangle" size={24} className="text-indigo-600" />
                  </div>
                  Important Admin Notices
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-md transition-shadow">
                    <Icon name="Database" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Database Backups</p>
                      <p className="text-sm text-blue-700 mt-1">Regularly back up the database to prevent data loss.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:shadow-md transition-shadow">
                    <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Result Verification</p>
                      <p className="text-sm text-green-700 mt-1">Review and approve pending result verifications promptly.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:shadow-md transition-shadow">
                    <Icon name="Eye" size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-900">User Activity Monitoring</p>
                      <p className="text-sm text-purple-700 mt-1">Monitor user activity for unusual behavior and security threats.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:shadow-md transition-shadow">
                    <Icon name="Edit" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Record Management</p>
                      <p className="text-sm text-amber-700 mt-1">Update staff and student records as needed to maintain accuracy.</p>
                    </div>
                  </div>
                </div>
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
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 text-lg font-semibold text-primary">
                  Total Students in School:{" "}
                  {classes.reduce((acc, cls) => acc + (cls.studentCount || 0), 0)}
                </div>
                <h2 className="font-heading text-xl">All Classes</h2>
              </div>
              <Button
                onClick={() => navigate("/admin/add-students")}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg w-full sm:w-auto"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Add Student
              </Button>
            </div>
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
                  className="flex items-center justify-between bg-muted/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/10 transition"
                  title="View Profile"
                >
                  <span className="font-semibold flex items-center gap-2">
                    {editingStudentId === student._id ? (
                      <>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editingStudentName}
                          onChange={handleStudentNameChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleStudentNameSave(student);
                            if (e.key === "Escape") {
                              setEditingStudentId(null);
                              setEditingStudentName("");
                            }
                          }}
                          className="border border-primary rounded px-2 py-1 text-sm"
                          style={{ minWidth: 120 }}
                          disabled={savingStudentId === student._id}
                        />
                        <button
                          className="ml-2 text-green-600 font-bold"
                          title="Save"
                          onClick={() => handleStudentNameSave(student)}
                          disabled={savingStudentId === student._id}
                        >
                          {savingStudentId === student._id ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="ml-1 text-red-500 font-bold"
                          title="Cancel"
                          onClick={() => {
                            setEditingStudentId(null);
                            setEditingStudentName("");
                          }}
                          disabled={savingStudentId === student._id}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {student.name}
                        <button
                          className="ml-2 text-xs text-blue-600 underline"
                          title="Edit Name"
                          onClick={() => handleStudentNameEdit(student)}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {student.className}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="ml-2"
                      onClick={() => navigate(`/admin/student/${student._id}`)}
                      title="View Profile"
                    >
                      <Icon name="User" size={16} className="mr-1" />
                      View Profile
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmId(student._id)}
                      disabled={deletingStudentId === student._id}
                      title="Delete Student"
                    >
                      <Icon name="Trash2" size={16} className="mr-1" />
                      {deletingStudentId === student._id ? "..." : "Delete"}
                    </Button>
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
            <NonAcademicStaffList />
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
            <VerifyResult
              initialClass={location.state?.selectedClass}
              initialTerm={location.state?.selectedTerm}
            />
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <DeleteConfirmationDialog
          student={students.find((s) => s._id === deleteConfirmId)}
          onConfirm={() => handleDeleteStudent(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
          isDeleting={deletingStudentId === deleteConfirmId}
        />
      )}
    </div>
  );
};

export default AdminDashboard;