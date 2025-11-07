import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoPersonAddSharp } from "react-icons/io5";
import Button from "../../components/ui/Button";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const AddStaffForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    yearFrom: "",
    yearTo: "",
    age: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name || !form.yearFrom || !form.yearTo || !form.age || !form.position) {
      setErrorMsg("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          year: `${form.yearFrom} - ${form.yearTo}`,
          age: form.age,
          position: form.position,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "Failed to add staff.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Staff added successfully!");
      if (onAdd) onAdd(result.staff);
      setForm({ name: "", yearFrom: "", yearTo: "", age: "", position: "" });

      setTimeout(() => {
        setLoading(false);
        onCancel && onCancel();
      }, 1200);
    } catch (err) {
      setErrorMsg("Failed to add staff.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="bg-white border border-primary/30 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <IoPersonAddSharp size={28} className="text-primary" />
          <h2 className="text-2xl font-heading font-bold text-primary">Add New Staff</h2>
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
              placeholder="Enter staff's full name"
              required
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block font-semibold mb-1">Year From</label>
              <input
                type="number"
                name="yearFrom"
                value={form.yearFrom}
                onChange={handleChange}
                className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Start year"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year To</label>
              <input
                type="number"
                name="yearTo"
                value={form.yearTo}
                onChange={handleChange}
                className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="End year"
                required
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter age"
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
          onClick={() => onCancel && onCancel()}
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
};

export const AddFormatorForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    yearFrom: "",
    yearTo: "",
    age: "",
    position: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name || !form.yearFrom || !form.yearTo || !form.age || !form.position || !form.image) {
      setErrorMsg("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("year", `${form.yearFrom} - ${form.yearTo}`);
      data.append("age", form.age);
      data.append("position", form.position);
      data.append("photo", form.image);

      const res = await fetch(`${API_BASE_URL}/api/formators`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "Failed to add formator.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Formator added successfully!");
      if (onAdd) onAdd(result.formator);
      setForm({ name: "", yearFrom: "", yearTo: "", age: "", position: "", image: null });

      setTimeout(() => {
        setLoading(false);
        onCancel && onCancel();
      }, 1200);
    } catch (err) {
      setErrorMsg("Failed to add formator.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="bg-white border border-primary/30 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <IoPersonAddSharp size={28} className="text-primary" />
          <h2 className="text-2xl font-heading font-bold text-primary">Add New Formator</h2>
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
              placeholder="Enter formator's full name"
              required
            />
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block font-semibold mb-1">Year From</label>
              <input
                type="number"
                name="yearFrom"
                value={form.yearFrom}
                onChange={handleChange}
                className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Start year"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year To</label>
              <input
                type="number"
                name="yearTo"
                value={form.yearTo}
                onChange={handleChange}
                className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="End year"
                required
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full border border-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter age"
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
            <label className="block font-semibold mb-1">Image</label>
            <input
              type="file"
              name="image"
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
            {loading ? "Adding..." : "Add Formator"}
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