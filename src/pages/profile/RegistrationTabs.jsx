import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log('API_BASE_URL:', API_BASE_URL);

const tabList = [
  { key: 'parentGuardian', label: 'Parent/Guardian' },
  { key: 'emergencyContact', label: 'Emergency Contact' },
  { key: 'medical', label: 'Medical Info' },
  { key: 'legal', label: 'Legal & Account' },
];

const RegistrationTabs = ({ userId, readOnly = false }) => {
  console.log('RegistrationTabs userId:', userId); // <-- Add this line

  const [activeTab, setActiveTab] = useState('parentGuardian');
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch registration data from backend
  const fetchRegistrationData = async (tabKey = activeTab) => {
    console.log('[FETCH] userId:', userId); // <-- Add this line
    if (userId) {
      try {
        console.log(`[FETCH] GET /api/registration/${userId}`);
        const res = await fetch(`${API_BASE_URL}/api/registration/${userId}`);
        if (res.ok) {
          const reg = await res.json();
          console.log('[FETCH] Success:', reg);
          setData(reg);
          setForm(reg[tabKey] || {});
        } else {
          const err = await res.json();
          console.error('[FETCH] Error:', err);
          setData({});
          setForm({});
        }
      } catch (e) {
        console.error('[FETCH] Network error:', e);
        setData({});
        setForm({});
      }
    } else {
      console.error('[FETCH] userId is undefined or invalid!');
    }
  };

  // Fetch on mount and when userId changes
  useEffect(() => {
    fetchRegistrationData();
    // eslint-disable-next-line
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedData = { ...data, [activeTab]: form };
    setData(updatedData);
    setEditing(false);
    setForm(updatedData[activeTab] || {});

    // Save to backend
    console.log('[SAVE] userId:', userId); // <-- Add this line
    if (userId) {
      try {
        console.log(`[SAVE] POST /api/registration/${userId}`, updatedData);
        const res = await fetch(`${API_BASE_URL}/api/registration/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
        if (!res.ok) {
          const err = await res.json();
          console.error('[SAVE] Error:', err);
          alert("Save failed: " + (err.error || res.statusText));
        } else {
          const result = await res.json();
          console.log('[SAVE] Success:', result);
          // Refetch to ensure data is in sync with DB
          await fetchRegistrationData(activeTab);
        }
      } catch (e) {
        console.error('[SAVE] Network error:', e);
        alert("Network or server error: " + e.message);
      }
    } else {
      console.error('[SAVE] userId is undefined or invalid!');
    }
    setSaving(false);
  };

  const handleTabChange = async (tabKey) => {
    // Save current form to data before switching
    const updatedData = { ...data, [activeTab]: form };
    setData(updatedData);
    setActiveTab(tabKey);
    setEditing(false);

    // Fetch latest data for the new tab
    await fetchRegistrationData(tabKey);
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap border-b mb-4 gap-2">
        {tabList.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-background p-4 rounded shadow">
        {activeTab === 'parentGuardian' && (
          <div>
            <h3 className="font-bold mb-2">Parent/Guardian Information</h3>
            {editing ? (
              <>
                <input type="text" name="firstName" value={form.firstName || ""} onChange={handleChange} placeholder="First Name" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="middleName" value={form.middleName || ""} onChange={handleChange} placeholder="Middle Name" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="lastName" value={form.lastName || ""} onChange={handleChange} placeholder="Last Name" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="relationship" value={form.relationship || ""} onChange={handleChange} placeholder="Relationship" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="email" name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Phone" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="address" value={form.address || ""} onChange={handleChange} placeholder="Address" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="city" value={form.city || ""} onChange={handleChange} placeholder="City" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="state" value={form.state || ""} onChange={handleChange} placeholder="State" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="zip" value={form.zip || ""} onChange={handleChange} placeholder="ZIP" className="mb-2 w-full border rounded px-2 py-1" />
              </>
            ) : (
              <>
                <p>Name: {form.firstName} {form.middleName} {form.lastName}</p>
                <p>Relationship: {form.relationship}</p>
                <p>Email: {form.email}</p>
                <p>Phone: {form.phone}</p>
                <p>Address: {form.address}, {form.city}, {form.state}, {form.zip}</p>
              </>
            )}
          </div>
        )}
        {activeTab === 'emergencyContact' && (
          <div>
            <h3 className="font-bold mb-2">Emergency Contact</h3>
            {editing ? (
              <>
                <input type="text" name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="relationship" value={form.relationship || ""} onChange={handleChange} placeholder="Relationship" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Phone" className="mb-2 w-full border rounded px-2 py-1" />
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" name="medicalAuth" checked={form.medicalAuth || false} onChange={handleChange} />
                  Medical Authorization
                </label>
              </>
            ) : (
              <>
                <p>Name: {form.name}</p>
                <p>Relationship: {form.relationship}</p>
                <p>Phone: {form.phone}</p>
                <p>Medical Authorization: {form.medicalAuth ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        )}
        {activeTab === 'medical' && (
          <div>
            <h3 className="font-bold mb-2">Medical Information</h3>
            {editing ? (
              <>
                <input type="text" name="allergies" value={form.allergies || ""} onChange={handleChange} placeholder="Allergies" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="conditions" value={form.conditions || ""} onChange={handleChange} placeholder="Conditions" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="medications" value={form.medications || ""} onChange={handleChange} placeholder="Medications" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="physicianName" value={form.physicianName || ""} onChange={handleChange} placeholder="Physician Name" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="physicianPhone" value={form.physicianPhone || ""} onChange={handleChange} placeholder="Physician Phone" className="mb-2 w-full border rounded px-2 py-1" />
                <input type="text" name="insurance" value={form.insurance || ""} onChange={handleChange} placeholder="Insurance" className="mb-2 w-full border rounded px-2 py-1" />
              </>
            ) : (
              <>
                <p>Allergies: {form.allergies}</p>
                <p>Conditions: {form.conditions}</p>
                <p>Medications: {form.medications}</p>
                <p>Physician: {form.physicianName} ({form.physicianPhone})</p>
                <p>Insurance: {form.insurance}</p>
              </>
            )}
          </div>
        )}
        {activeTab === 'legal' && (
          <div>
            <h3 className="font-bold mb-2">Legal & Account</h3>
            {editing ? (
              <>
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" name="mediaConsent" checked={form.mediaConsent || false} onChange={handleChange} />
                  Media Consent
                </label>
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" name="emergencyConsent" checked={form.emergencyConsent || false} onChange={handleChange} />
                  Emergency Consent
                </label>
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" name="privacyPolicy" checked={form.privacyPolicy || false} onChange={handleChange} />
                  Privacy Policy
                </label>
                <input type="email" name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" className="mb-2 w-full border rounded px-2 py-1" />
              </>
            ) : (
              <>
                <p>Media Consent: {form.mediaConsent ? 'Yes' : 'No'}</p>
                <p>Emergency Consent: {form.emergencyConsent ? 'Yes' : 'No'}</p>
                <p>Privacy Policy: {form.privacyPolicy ? 'Agreed' : 'Not Agreed'}</p>
                <p>Email: {form.email}</p>
              </>
            )}
          </div>
        )}
        <div className="flex gap-4 mt-4">
          {editing && !readOnly ? (
            <>
              <button
                className="bg-primary text-white px-4 py-2 rounded font-semibold"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded font-semibold"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            !readOnly && (
              <button
                className="bg-primary text-white px-4 py-2 rounded font-semibold"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationTabs;