import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoPersonAddSharp } from "react-icons/io5";
import Button from "../../components/ui/Button";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const AddStaffForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
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
    setSuccessMsg("");

    if (!form.name || !form.subject || !form.photo) {
      setErrorMsg("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("subject", form.subject);
      data.append("photo", form.photo);

      // FIX: Use /api/teacher endpoint
      const res = await fetch(`${API_BASE_URL}/api/teacher`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "Failed to add teacher.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Teacher added successfully!");
      if (onAdd) onAdd(result.teacher);
      setForm({ name: "", subject: "", photo: null });

      setTimeout(() => {
        setLoading(false);
        onCancel && onCancel();
      }, 1200);
    } catch (err) {
      setErrorMsg("Failed to add teacher.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="bg-white border border-primary/30 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <IoPersonAddSharp size={28} className="text-primary" />
          <h2 className="text-2xl font-heading font-bold text-primary">Add New Teacher</h2>
        </div>
        {errorMsg && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded p-2 text-center">
            {successMsg}
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
              placeholder="Enter teacher's full name"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter subject"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Photo</label>
            <input
              type="file"
              name="photo"
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              accept="image/*"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Teacher"}
          </Button>
        </form>
        <button
          className="mt-6 text-primary underline text-sm"
          onClick={() => onCancel && onCancel()}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
};

export default AddStaffForm;