import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoPersonAddSharp } from "react-icons/io5";
import { FaEye, FaEyeSlash, FaDownload, FaTrash } from "react-icons/fa";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const generateToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const AddStudentsForm = ({ onAdd, onCancel, onRefresh }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("single"); // single or bulk
  const [form, setForm] = useState({
    name: "",
    className: "",
    term: "first",
  });
  const [bulkStudents, setBulkStudents] = useState([]);
  const [bulkTermMode, setBulkTermMode] = useState("same"); // same or different
  const [bulkDefaultTerm, setBulkDefaultTerm] = useState("first");
  const [bulkClassMode, setBulkClassMode] = useState("same"); // same or different
  const [bulkDefaultClass, setBulkDefaultClass] = useState("");
  const [bulkFormCount, setBulkFormCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showToken, setShowToken] = useState({});
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const currentTerm = adminData.term || "first";

  // Single Student Add
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name.trim() || !form.className.trim()) {
      setErrorMsg("Name and class are required.");
      setLoading(false);
      return;
    }

    try {
      const token = generateToken();
      const res = await fetch(`${API_BASE_URL}/api/user/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          className: form.className.trim(),
          term: form.term || currentTerm,
          token: token,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMsg(result.error || "Failed to add student.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Student added successfully!");
      if (onAdd) onAdd(result.user);
      setForm({ name: "", className: "", term: form.term });

      setTimeout(() => {
        setLoading(false);
        if (onRefresh) onRefresh();
      }, 1200);
    } catch (err) {
      setErrorMsg("Failed to add student.");
      setLoading(false);
    }
  };

  // Bulk Add Functions
  const handleBulkChange = (index, field, value) => {
    const updated = [...bulkStudents];
    updated[index][field] = value;
    setBulkStudents(updated);
  };

  const generateBulkForms = () => {
    const count = Math.max(1, Math.min(100, bulkFormCount)); // Min 1, Max 100
    const newStudents = Array.from({ length: count }, () => ({
      name: "",
      className: bulkClassMode === "same" ? bulkDefaultClass : "",
      term: bulkTermMode === "same" ? bulkDefaultTerm : currentTerm,
      token: generateToken(),
    }));
    setBulkStudents(newStudents);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const removeBulkRow = (index) => {
    setBulkStudents(bulkStudents.filter((_, i) => i !== index));
  };

  const updateBulkTermMode = (newMode) => {
    setBulkTermMode(newMode);
    if (newMode === "same") {
      setBulkStudents(
        bulkStudents.map((student) => ({
          ...student,
          term: bulkDefaultTerm,
        }))
      );
    }
  };

  const updateBulkClassMode = (newMode) => {
    setBulkClassMode(newMode);
    if (newMode === "same") {
      setBulkStudents(
        bulkStudents.map((student) => ({
          ...student,
          className: bulkDefaultClass,
        }))
      );
    }
  };

  const handleBulkDefaultTermChange = (newTerm) => {
    setBulkDefaultTerm(newTerm);
    if (bulkTermMode === "same") {
      setBulkStudents(
        bulkStudents.map((student) => ({
          ...student,
          term: newTerm,
        }))
      );
    }
  };

  const handleBulkDefaultClassChange = (newClass) => {
    setBulkDefaultClass(newClass);
    if (bulkClassMode === "same") {
      setBulkStudents(
        bulkStudents.map((student) => ({
          ...student,
          className: newClass,
        }))
      );
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Validate all rows
    const emptyRows = bulkStudents.filter((s) => !s.name.trim() || !s.className.trim());
    if (emptyRows.length > 0) {
      setErrorMsg(`${emptyRows.length} row(s) have missing name or class.`);
      setLoading(false);
      return;
    }

    if (bulkStudents.length === 0) {
      setErrorMsg("Please add at least one student.");
      setLoading(false);
      return;
    }

    try {
      let addedCount = 0;
      let failedCount = 0;

      for (const student of bulkStudents) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/add-student`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student),
          });
          const result = await res.json();

          if (res.ok && result.success) {
            addedCount++;
            if (onAdd) onAdd(result.user);
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      }

      if (failedCount === 0) {
        setSuccessMsg(`All ${addedCount} student(s) added successfully!`);
        setBulkStudents([]);
        setBulkFormCount(1);
      } else {
        setSuccessMsg(`${addedCount} student(s) added, ${failedCount} failed.`);
      }

      setTimeout(() => {
        setLoading(false);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err) {
      setErrorMsg("Failed to add students.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="bg-white border border-primary/30 rounded-t-2xl shadow-xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-start gap-2 md:gap-3 min-w-0">
              <div className="bg-gradient-to-br from-primary to-accent p-2 md:p-3 rounded-xl flex-shrink-0">
                <IoPersonAddSharp size={24} className="text-white md:w-8 md:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-3xl font-bold font-heading text-primary">Add Students</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage student enrollment efficiently</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition flex items-center justify-center gap-2 text-sm md:text-base flex-shrink-0"
              title="Go back to dashboard"
            >
              <Icon name="ChevronLeft" size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 md:gap-3 mb-6">
            <button
              onClick={() => {
                setMode("single");
                setErrorMsg("");
                setSuccessMsg("");
                setBulkStudents([]);
              }}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold transition-all text-sm md:text-base ${
                mode === "single"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon name="Plus" size={16} className="inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Single Student</span>
              <span className="sm:hidden">Single</span>
            </button>
            <button
              onClick={() => {
                setMode("bulk");
                setErrorMsg("");
                setSuccessMsg("");
                setForm({ name: "", className: "", term: "first" });
              }}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold transition-all text-sm md:text-base ${
                mode === "bulk"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon name="Users" size={16} className="inline mr-1 md:mr-2" />
              <span className="hidden sm:inline">Bulk Add</span>
              <span className="sm:hidden">Bulk</span>
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3 text-sm md:text-base">
              <Icon name="AlertCircle" size={18} className="flex-shrink-0 mt-0.5 md:w-5 md:h-5" />
              <p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3 text-sm md:text-base">
              <Icon name="CheckCircle" size={18} className="flex-shrink-0 mt-0.5 md:w-5 md:h-5" />
              <p>{successMsg}</p>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="bg-white border border-t-0 border-primary/30 rounded-b-2xl shadow-xl p-4 md:p-8">
          {/* SINGLE STUDENT MODE */}
          {mode === "single" && (
            <form onSubmit={handleSingleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="block font-semibold text-primary mb-2 text-sm md:text-base">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm md:text-base"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block font-semibold text-primary mb-2 text-sm md:text-base">Class *</label>
                  <input
                    type="text"
                    name="className"
                    value={form.className}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm md:text-base"
                    placeholder="e.g., Class 1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-2 text-sm md:text-base">Term *</label>
                  <select
                    name="term"
                    value={form.term}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm md:text-base"
                  >
                    <option value="first">First Term</option>
                    <option value="second">Second Term</option>
                    <option value="third">Third Term</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-blue-700">
                  <Icon name="Info" size={14} className="inline mr-1 md:mr-2" />
                  <strong>Auto-Generated Token:</strong> A unique 6-digit code will be automatically created for this student
                </p>
              </div>

              <Button type="submit" className="w-full h-10 md:h-12 text-sm md:text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader" size={16} className="animate-spin mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Adding Student...</span>
                    <span className="sm:hidden">Adding...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Plus" size={16} className="mr-1 md:mr-2" />
                    Add Student
                  </>
                )}
              </Button>
            </form>
          )}

          {/* BULK ADD MODE */}
          {mode === "bulk" && (
            <form onSubmit={handleBulkSubmit} className="space-y-4 md:space-y-5">
              {/* Bulk Configuration Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/30 rounded-xl p-4 md:p-6 space-y-4 md:space-y-5">
                <h3 className="font-bold text-primary text-base md:text-lg flex items-center gap-2">
                  <Icon name="Settings" size={18} className="md:w-5 md:h-5" />
                  Bulk Add Configuration
                </h3>

                {/* Row 1: Number Input */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-primary mb-2">
                    How many students to add? *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                 <input
  type="number"
  max="100"
  value={bulkFormCount}
  onChange={(e) => {
    const value = e.target.value;
    if (value === "") {
      setBulkFormCount("");
    } else {
      setBulkFormCount(Math.max(1, Math.min(100, parseInt(value) || 1)));
    }
  }}
  className="flex-1 border-2 border-primary/30 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-base md:text-lg font-semibold"
  placeholder="10"
/>
                    <Button
                      type="button"
                      onClick={generateBulkForms}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-4 md:px-6 text-sm md:text-base"
                    >
                      <Icon name="Plus" size={16} className="mr-1 md:mr-2" />
                      Generate Forms
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a number between 1-100 and click "Generate Forms"
                  </p>
                </div>

                {/* Row 2: Class Mode & Term Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-primary mb-2">
                      Class Assignment *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="classMode"
                          value="same"
                          checked={bulkClassMode === "same"}
                          onChange={() => updateBulkClassMode("same")}
                          className="w-4 h-4"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          Same class for all
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="classMode"
                          value="different"
                          checked={bulkClassMode === "different"}
                          onChange={() => updateBulkClassMode("different")}
                          className="w-4 h-4"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          Different class per student
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-primary mb-2">
                      Term Assignment *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="termMode"
                          value="same"
                          checked={bulkTermMode === "same"}
                          onChange={() => updateBulkTermMode("same")}
                          className="w-4 h-4"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          Same term for all
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="termMode"
                          value="different"
                          checked={bulkTermMode === "different"}
                          onChange={() => updateBulkTermMode("different")}
                          className="w-4 h-4"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          Different term per student
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Class Selector (only show if "same" mode) */}
                {bulkClassMode === "same" && (
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-primary mb-2">
                      Select Class for All Students *
                    </label>
                    <input
                      type="text"
                      value={bulkDefaultClass}
                      onChange={(e) => handleBulkDefaultClassChange(e.target.value)}
                      className="w-full md:w-1/2 border-2 border-primary/30 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-semibold text-sm md:text-base"
                      placeholder="e.g., Class 1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      This class will be applied to all {bulkStudents.length} student(s)
                    </p>
                  </div>
                )}

                {/* Term Selector (only show if "same" mode) */}
                {bulkTermMode === "same" && (
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-primary mb-2">
                      Select Term for All Students *
                    </label>
                    <select
                      value={bulkDefaultTerm}
                      onChange={(e) => handleBulkDefaultTermChange(e.target.value)}
                      className="w-full md:w-1/2 border-2 border-primary/30 rounded-lg px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-semibold text-sm md:text-base"
                    >
                      <option value="first">First Term</option>
                      <option value="second">Second Term</option>
                      <option value="third">Third Term</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">
                      This term will be applied to all {bulkStudents.length} student(s)
                    </p>
                  </div>
                )}

                {/* Info Messages */}
                {bulkClassMode === "different" && bulkStudents.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3">
                    <p className="text-xs md:text-sm text-yellow-700 font-semibold">
                      💡 Each student form has its own class input below
                    </p>
                  </div>
                )}
                {bulkTermMode === "different" && bulkStudents.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3">
                    <p className="text-xs md:text-sm text-yellow-700 font-semibold">
                      💡 Each student form has its own term selector below
                    </p>
                  </div>
                )}
              </div>

              {/* Student Forms Grid */}
              {bulkStudents.length > 0 && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="font-bold text-primary text-base md:text-lg">
                      Student Details ({bulkStudents.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkStudents([]);
                        setBulkFormCount(1);
                      }}
                      className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-2 px-2 md:px-3 py-1 md:py-2 bg-red-50 rounded-lg transition text-sm"
                    >
                      <FaTrash size={14} />
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                    {bulkStudents.map((student, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary/30 rounded-xl p-4 md:p-6 hover:border-primary/60 transition-all"
                      >
                        {/* Student Number Header */}
                        <div className="flex justify-between items-start gap-2 mb-3 md:mb-4">
                          <div className="min-w-0">
                            <h5 className="font-bold text-primary text-base md:text-lg">
                              Student #{idx + 1}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              Token: <span className="font-mono text-primary">{showToken[idx] ? student.token : '●●●●●●'}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBulkRow(idx)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-1 px-2 rounded-lg transition flex items-center gap-1 text-xs flex-shrink-0"
                            title="Remove student"
                          >
                            <FaTrash size={12} />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>

                        {/* Name Field */}
                        <div className="mb-3 md:mb-4">
                          <label className="block text-xs font-semibold text-primary mb-1 md:mb-2 uppercase tracking-wide">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) =>
                              handleBulkChange(idx, "name", e.target.value)
                            }
                            className="w-full border-2 border-primary/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition bg-white"
                            placeholder="e.g., John Doe"
                            required
                          />
                        </div>

                        {/* Class and Term Fields */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                          {/* Class Field */}
                          {bulkClassMode === "different" && (
                            <div>
                              <label className="block text-xs font-semibold text-primary mb-1 md:mb-2 uppercase tracking-wide">
                                Class *
                              </label>
                              <input
                                type="text"
                                value={student.className}
                                onChange={(e) =>
                                  handleBulkChange(idx, "className", e.target.value)
                                }
                                className="w-full border-2 border-primary/30 rounded-lg px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition bg-white"
                                placeholder="e.g., Class 1"
                                required
                              />
                            </div>
                          )}

                          {/* Class Display (if "same" mode) */}
                          {bulkClassMode === "same" && (
                            <div>
                              <label className="block text-xs font-semibold text-primary mb-1 md:mb-2 uppercase tracking-wide">
                                Class
                              </label>
                              <div className="w-full border-2 border-primary/30 rounded-lg px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm bg-muted flex items-center justify-center font-semibold text-primary">
                                {bulkDefaultClass || "—"}
                              </div>
                            </div>
                          )}

                          {/* Term Field */}
                          {bulkTermMode === "different" && (
                            <div>
                              <label className="block text-xs font-semibold text-primary mb-1 md:mb-2 uppercase tracking-wide">
                                Term *
                              </label>
                              <select
                                value={student.term}
                                onChange={(e) =>
                                  handleBulkChange(idx, "term", e.target.value)
                                }
                                className="w-full border-2 border-primary/30 rounded-lg px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition bg-white"
                              >
                                <option value="first">First</option>
                                <option value="second">Second</option>
                                <option value="third">Third</option>
                              </select>
                            </div>
                          )}

                          {/* Term Display (if "same" mode) */}
                          {bulkTermMode === "same" && (
                            <div>
                              <label className="block text-xs font-semibold text-primary mb-1 md:mb-2 uppercase tracking-wide">
                                Term
                              </label>
                              <div className="w-full border-2 border-primary/30 rounded-lg px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm bg-muted flex items-center justify-center font-semibold text-primary">
                                {bulkDefaultTerm === "first" ? "First" : bulkDefaultTerm === "second" ? "Second" : "Third"}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Token Display */}
                        <div className="bg-white rounded-lg p-2 md:p-3 border-2 border-primary/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1 font-semibold">
                                TOKEN
                              </p>
                              <input
                                type={showToken[idx] ? "text" : "password"}
                                value={student.token}
                                readOnly
                                className="w-full border border-primary/30 rounded px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono font-bold text-primary truncate"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setShowToken((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                              className="text-primary hover:text-accent transition p-1 md:p-2 hover:bg-primary/10 rounded flex-shrink-0"
                              title={showToken[idx] ? "Hide token" : "Show token"}
                            >
                              {showToken[idx] ? (
                                <FaEyeSlash size={14} className="md:w-4 md:h-4" />
                              ) : (
                                <FaEye size={14} className="md:w-4 md:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bulkStudents.length === 0 && (
                <div className="text-center py-8 md:py-16 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                  <Icon name="Users" size={36} className="mx-auto mb-3 md:mb-4 text-blue-500 opacity-40 md:w-12 md:h-12" />
                  <p className="text-blue-700 font-bold mb-1 md:mb-2 text-base md:text-lg">No Students Added Yet</p>
                  <p className="text-xs md:text-sm text-blue-600">
                    Enter a number in the configuration section above and click "Generate Forms"
                  </p>
                </div>
              )}

              {/* Submit Button */}
              {bulkStudents.length > 0 && (
                <Button
                  type="submit"
                  className="w-full h-10 md:h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm md:text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-1 md:mr-2 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Adding {bulkStudents.length} Student(s)...</span>
                      <span className="sm:hidden">Adding...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Check" size={16} className="mr-1 md:mr-2 md:w-5 md:h-5" />
                      ✓ Add All {bulkStudents.length} Students
                    </>
                  )}
                </Button>
              )}
            </form>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-4 md:mt-6 flex justify-center">
          <button
            className="text-primary hover:text-accent font-semibold flex items-center gap-2 transition text-sm md:text-base"
           onClick={() => navigate('/admin')}
          >
            <Icon name="ChevronLeft" size={16} className="md:w-[18px] md:h-[18px]" />
            Back to Students
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentsForm;