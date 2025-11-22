import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const NonAcademicStaffList = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Fetch non-academic staff from backend
  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/non-academic`);
      const data = await res.json();
      if (res.ok) {
        setStaffs(data || []);
      } else {
        setErrorMsg(data.error || "Failed to fetch non-academic staff.");
      }
    } catch (err) {
      setErrorMsg("Failed to fetch non-academic staff.");
    }
    setLoading(false);
  };

  // Handler for deleting a staff (calls backend API)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/non-academic/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setStaffs((prev) => prev.filter((staff) => staff._id !== id));
      } else {
        alert(result.error || "Failed to delete staff.");
      }
    } catch (err) {
      alert("Failed to delete staff.");
    }
  };

  // Handler for adding a staff (calls backend API)
  const handleAddStaff = async (staffData) => {
    try {
      const formData = new FormData();
      formData.append("name", staffData.name);
      formData.append("position", staffData.position);
      if (staffData.photo) formData.append("photo", staffData.photo);

      const res = await fetch(`${API_BASE_URL}/api/non-academic`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setStaffs((prev) => [...prev, result.staff]);
        setShowAdd(false);
      } else {
        alert(result.error || "Failed to add staff.");
      }
    } catch (err) {
      alert("Failed to add staff.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-primary">Non-Academic Staff</h2>
        <Button onClick={() => setShowAdd(true)} variant="primary" size="sm">
          Add Staff
        </Button>
      </div>
      {errorMsg && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
          {errorMsg}
        </div>
      )}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : staffs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No non-academic staff found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {staffs.map((staff) => (
            <div
              key={staff._id}
              className="bg-card border border-border rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition"
            >
              {staff.photoFilename ? (
                <img
                  src={`${API_BASE_URL}/api/non-academic/${staff._id}/photo`}
                  alt={staff.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-accent mb-2"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    background: '#f3f4f6',
                    display: 'block'
                  }}
                  crossOrigin="use-credentials"
                />
              ) : (
                <span className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-white border-2 border-accent mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {/* Microphone icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v2m0 0a4 4 0 01-4-4h8a4 4 0 01-4 4zm0-2V6a4 4 0 018 0v6a4 4 0 01-8 0z" />
                  </svg>
                </span>
              )}
              <div className="font-heading font-semibold text-lg text-foreground mb-1">
                {staff.name}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {staff.position || "Non-Academic Staff"}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(staff._id)}
                className="mt-2"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
      {/* Add Staff Modal */}
      {showAdd && (
        <AddNonAcademicStaffForm
          onAdd={handleAddStaff}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};

// Add staff form with photo field
const AddNonAcademicStaffForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({ name: "", position: "", photo: null });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    if (!form.name || !form.position || !form.photo) {
      setErrorMsg("All fields are required.");
      setLoading(false);
      return;
    }
    await onAdd(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white border border-primary/30 rounded-xl shadow-lg p-8 w-full max-w-md">
        <h3 className="text-xl font-heading font-bold text-primary mb-4">Add Non-Academic Staff</h3>
        {errorMsg && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter staff's full name"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Position</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter position"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Photo</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Staff"}
          </Button>
        </form>
        <button
          className="mt-6 text-primary underline text-sm"
          onClick={onCancel}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
};

export default NonAcademicStaffList;