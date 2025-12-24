import React, { useState, useEffect } from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import AddTeacherPage from "../add-page";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch teachers from backend
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/teacher?page=${page}&limit=20`);
        if (!res.ok) throw new Error("Failed to fetch teachers");
        const data = await res.json();
        if (page === 1) {
          setTeachers(data.teachers);
        } else {
          setTeachers((prev) => [...prev, ...data.teachers]);
        }
        setHasMore(data.teachers.length === 20);
      } catch (err) {
        setErrorMsg("Could not load teachers.");
      }
      setLoading(false);
    };
    fetchTeachers();
  }, [page]);

  // Handler for deleting a teacher (calls backend API)
  const handleDelete = async (idx) => {
    const teacher = teachers[idx];
    if (!teacher || !teacher._id) return;

    if (!window.confirm(`Are you sure you want to delete ${teacher.name}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher/${teacher._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete teacher");
      setTeachers((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      alert("Could not delete teacher. Please try again.");
    }
  };

  // Handler for adding a teacher (show add page)
  const handleAddTeacher = () => {
    setShowAdd(true);
  };

  // Handler to add teacher from AddTeacherPage
  const handleTeacherAdded = (teacher) => {
    setTeachers((prev) => [...prev, teacher]);
    setShowAdd(false);
  };

  // Handler to close add page
  const handleCloseAdd = () => setShowAdd(false);

  const getTeacherPhotoUrl = (teacher) => {
    if (teacher._id) {
      // Try DB first
      return `${API_BASE_URL}/api/teacher/${teacher._id}/photo`;
    }
    return null;
  };

  const getTeacherUploadUrl = (teacher) => {
    if (teacher.photoFilename) {
      return `${API_BASE_URL}/uploads/teachers/${teacher.photoFilename}`;
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      {showAdd ? (
        <AddTeacherPage
          onAdd={handleTeacherAdded}
          onCancel={handleCloseAdd}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-primary text-center flex-1">
              All Teachers
            </h2>
            <div className="flex gap-3 ml-4">
              <button
                className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
                onClick={handleAddTeacher}
                title="Add Teacher"
              >
                <IoPersonAddSharp size={20} />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-lg shadow transition ${
                  deleteMode
                    ? "bg-red-600 text-white"
                    : "bg-white border border-red-300 text-red-600"
                }`}
                onClick={() => setDeleteMode((d) => !d)}
                title="Delete Teacher"
              >
                <MdDelete size={20} />
                <span className="hidden sm:inline">{deleteMode ? "Cancel" : "Delete"}</span>
              </button>
            </div>
          </div>
          {/* Total number of teachers */}
          <div className="mb-4 text-lg font-semibold text-primary">
            Total Teachers in School: {teachers.length}
          </div>
          {errorMsg && (
            <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
              {errorMsg}
            </div>
          )}
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {teachers.map((teacher, idx) => (
                <div
                  key={teacher._id || idx}
                  className={`bg-white border border-border rounded-xl shadow flex flex-col items-center p-4 relative`}
                >
                  {deleteMode && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition"
                      onClick={() => handleDelete(idx)}
                      title="Delete this teacher"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-primary/30 bg-muted">
                    {/* Use the API route to serve the image from the database */}
                    <img
                      src={getTeacherPhotoUrl(teacher)}
                      alt={teacher.name}
                      crossOrigin="use-credentials"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fallback = getTeacherUploadUrl(teacher);
                        if (fallback) e.target.src = fallback;
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-base text-foreground">{teacher.name}</div>
                    <div className="text-sm text-muted-foreground">{teacher.subject}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {deleteMode && teachers.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">No teachers left.</div>
          )}
          {hasMore && (
            <div className="text-center mt-4">
              <button
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeachersList;