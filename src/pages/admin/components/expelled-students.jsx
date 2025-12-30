import React, { useState, useEffect } from "react";
import { FaPlus, FaCheckCircle } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const ExpelledStudents = () => {
  const [classList, setClassList] = useState([]);
  const [students, setStudents] = useState([]);
  const [expelled, setExpelled] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [showAddBar, setShowAddBar] = useState(false);

  // Fetch class names from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/class-list`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length && data[0].className) {
          setClassList(data.map(cls => cls.className));
        } else if (Array.isArray(data)) {
          setClassList(data);
        }
      })
      .catch(() => setClassList([]));
  }, []);

  // Fetch students for selected class from backend
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/user/class/${selectedClass}/students`)
        .then(res => res.json())
        .then(data => {
          setStudents(data);
          setLoading(false);
        })
        .catch(() => {
          setStudents([]);
          setLoading(false);
        });
    }
  }, [selectedClass]);

  // Fetch expelled students for selected class
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/expelled-students/class/${selectedClass}`)
        .then(res => res.json())
        .then(data => {
          setExpelled(data);
          setLoading(false);
        })
        .catch(() => {
          setExpelled([]);
          setLoading(false);
        });
    }
  }, [selectedClass]);

  // Students in selected class for adding, filtered by search
  const studentsInClass = students.filter(
    (student) =>
      student.className &&
      selectedClass &&
      student.className.toLowerCase() === selectedClass.toLowerCase() &&
      student.name &&
      student.name.toLowerCase().includes(search.toLowerCase()) &&
      !expelled.some((s) => s._id === student._id)
  );

  // Expelled students in selected class, filtered by search
  const expelledInClass = expelled.filter(
    (student) =>
      student.className &&
      selectedClass &&
      student.className.toLowerCase() === selectedClass.toLowerCase() &&
      student.name &&
      student.name.toLowerCase().includes(search.toLowerCase())
  );

  // Optimistic add to expelled list
  const handleAddExpelled = async (student) => {
    setAddingId(student._id);
    setExpelled((prev) => [...prev, student]); // Optimistic update
    try {
      const res = await fetch(`${API_BASE_URL}/api/expelled-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student._id }),
      });
      if (!res.ok) {
        // Rollback if failed
        setExpelled((prev) => prev.filter((s) => s._id !== student._id));
      }
    } catch (err) {
      setExpelled((prev) => prev.filter((s) => s._id !== student._id));
    }
    setAddingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <h2 className="text-2xl font-bold mb-6 text-primary">Expelled Students</h2>
      {!selectedClass ? (
        <>
          <div className="mb-6 text-lg font-semibold text-primary">Select a class:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {classList.map((cls) => (
              <button
                key={cls}
                className="bg-gradient-to-br from-primary/10 to-white border border-primary rounded-xl shadow flex flex-col items-center justify-center p-6 font-bold text-lg text-primary hover:bg-primary/20 transition cursor-pointer"
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            className="mb-4 text-primary underline text-sm"
            onClick={() => {
              setSelectedClass(null);
              setSearch("");
              setShowAddBar(false);
            }}
          >
            &larr; Back to classes
          </button>
          <div className="mb-4 text-lg font-semibold text-primary">
            {selectedClass} Expelled Students
          </div>
          {/* Add button to show search bar */}
          {!showAddBar && (
            <button
              className="mb-4 bg-primary text-white px-4 py-2 rounded shadow"
              onClick={() => setShowAddBar(true)}
            >
              Add
            </button>
          )}
          {/* Search bar and add logic */}
          {showAddBar && (
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student in this class..."
                className="w-full mb-6 px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary"
              />
              {/* Only show matching students if search is not empty */}
              {search.trim() !== "" && (
                <>
                  <div className="mb-4 font-semibold text-base text-primary">Matching students:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {students
                      .filter(
                        (student) =>
                          student.className &&
                          selectedClass &&
                          student.className.toLowerCase() === selectedClass.toLowerCase() &&
                          student.name.toLowerCase().includes(search.toLowerCase()) &&
                          !expelled.some((s) => s._id === student._id)
                      )
                      .map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 shadow hover:shadow-lg transition"
                        >
                          <div>
                            <div className="font-semibold text-lg">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.className}</div>
                          </div>
                          <button
                            className={`bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-all duration-150 ${
                              addingId === student._id ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            title="Add to expelled"
                            onClick={() => handleAddExpelled(student)}
                            disabled={addingId === student._id}
                          >
                            {addingId === student._id ? (
                              <FaCheckCircle className="animate-bounce" />
                            ) : (
                              <FaPlus />
                            )}
                          </button>
                        </div>
                      ))}
                    {/* If no students match */}
                    {students.filter(
                      (student) =>
                        student.className &&
                        selectedClass &&
                        student.className.toLowerCase() === selectedClass.toLowerCase() &&
                        student.name.toLowerCase().includes(search.toLowerCase()) &&
                        !expelled.some((s) => s._id === student._id)
                    ).length === 0 && (
                      <div className="text-center text-muted-foreground col-span-full py-8">
                        No students found in this class. Use the search above to find and add.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          {/* Already expelled students */}
          <div className="mb-4 font-semibold text-base text-primary">Already expelled:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expelledInClass.length === 0 && (
              <div className="text-center text-muted-foreground col-span-full py-8">
                No expelled students in this class yet.
              </div>
            )}
            {expelledInClass.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow"
              >
                <div>
                  <div className="font-semibold text-lg text-red-700">{student.name}</div>
                  <div className="text-xs text-muted-foreground">{student.className}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExpelledStudents;