import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { AddFormatorForm } from "../add-page";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const FormatorsList = () => {
  const [formators, setFormators] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);

  // Fetch formators from backend
  useEffect(() => {
    const fetchFormators = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/formators`);
        const data = await res.json();
        setFormators(data);
      } catch (err) {
        setFormators([]);
      }
      setLoading(false);
    };
    fetchFormators();
  }, []);

  // Handler to add formator from AddFormatorForm
  const handleFormatorAdded = (formator) => {
    setFormators((prev) => [...prev, formator]);
    setShowAdd(false);
  };

  // Handler to close add page
  const handleCloseAdd = () => setShowAdd(false);

  // Handler for deleting a formator
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this formator?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/formators/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFormators((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Get photo URL from DB
  const getFormatorPhotoUrl = (formator) => {
    if (formator._id) {
      return `${API_BASE_URL}/api/formators/${formator._id}/photo`;
    }
    return null;
  };

  // Get photo URL from uploads folder
  const getFormatorUploadUrl = (formator) => {
    if (formator.photoFilename) {
      return `${API_BASE_URL}/uploads/formators/${formator.photoFilename}`;
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      {showAdd ? (
        <AddFormatorForm onAdd={handleFormatorAdded} onCancel={handleCloseAdd} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-primary text-center flex-1">
              All Formators
            </h2>
            <div className="flex gap-2 ml-4">
              <button
                className={`flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition`}
                onClick={() => setShowAdd(true)}
                title="Add Formator"
              >
                <FaPlus size={20} />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                className={`flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition`}
                onClick={() => setDeleteMode((prev) => !prev)}
                title="Delete Mode"
              >
                <MdDelete size={20} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
          <div className="mb-4 text-lg font-semibold text-primary">
            Total Formators: {formators.length}
          </div>
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {formators.map((formator, idx) => (
                <div
                  key={formator._id || idx}
                  className="bg-white border border-border rounded-xl shadow flex flex-col items-center p-4 relative"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-primary/30 bg-muted">
                    <img
                      src={getFormatorPhotoUrl(formator)}
                      alt={formator.name}
                      crossOrigin="use-credentials"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fallback = getFormatorUploadUrl(formator);
                        if (fallback) e.target.src = fallback;
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-base text-foreground">{formator.name}</div>
                    <div className="text-sm text-muted-foreground">{formator.position}</div>
                    <div className="text-xs text-muted-foreground">Year: {formator.year}</div>
                    <div className="text-xs text-muted-foreground">Age: {formator.age}</div>
                  </div>
                  {deleteMode && (
                    <button
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow hover:bg-red-700"
                      onClick={() => handleDelete(formator._id)}
                      title="Delete Formator"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {formators.length === 0 && !loading && (
            <div className="text-center text-muted-foreground mt-8">No formators found.</div>
          )}
        </>
      )}
    </div>
  );
};

export default FormatorsList;