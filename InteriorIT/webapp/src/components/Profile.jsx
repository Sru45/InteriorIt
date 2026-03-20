import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    name: 'Babu Suthar',
    mobile1: '+91 97234 65421',
    mobile2: '+91 94275 15584',
    address: 'Vasad-396001 Gujarat',
    email: 'h.i.suthar85@gmail.com',
    gstin: '24AAAAA0000A1Z5'
  });

  useEffect(() => {
    const saved = localStorage.getItem('interior_owner');
    if (saved) setDetails(JSON.parse(saved));
  }, []);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('interior_owner', JSON.stringify(details));
    alert('Profile Saved!');
    navigate('/dashboard');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Owner Profile</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="container" style={{ padding: 0 }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>Update Your Details</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>These details will instantly map to the red swoosh header of your exact design perfectly across Excel and PDF exports.</p>
          <input type="text" name="name" className="input-field" placeholder="Owner Name" value={details.name} onChange={handleChange} />
          <input type="text" name="mobile1" className="input-field" placeholder="Mobile 1" value={details.mobile1} onChange={handleChange} />
          <input type="text" name="mobile2" className="input-field" placeholder="Mobile 2" value={details.mobile2} onChange={handleChange} />
          <input type="text" name="email" className="input-field" placeholder="Email Address" value={details.email} onChange={handleChange} />
          <input type="text" name="address" className="input-field" placeholder="Address" value={details.address} onChange={handleChange} />
          <input type="text" name="gstin" className="input-field" placeholder="GST Number" value={details.gstin} onChange={handleChange} />
          <button className="btn" style={{ width: '100%' }} onClick={handleSave}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}
