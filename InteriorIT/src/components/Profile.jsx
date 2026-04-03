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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Owner Profile</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="container" style={{ padding: 0, paddingBottom: '40px' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            <div>
               <h4 style={{ margin: '0 0 10px 0' }}>Profile Photo</h4>
               <div style={{ 
                 width: '120px', height: '120px', borderRadius: '50%', 
                 backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                 overflow: 'hidden', marginBottom: '10px', border: '2px solid #ddd'
               }}>
                 {details.avatar ? (
                   <img src={details.avatar} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <span style={{ color: '#aaa', fontSize: '12px' }}>No Photo</span>
                 )}
               </div>
               <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '12px', width: '100%' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Personalisation</h4>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#666' }}>App Theme</label>
              <select name="theme" className="input-field" value={details.theme || 'light'} onChange={handleChange} style={{ marginBottom: '15px' }}>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode (Preview)</option>
              </select>
              
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#666' }}>Notification Preferences</label>
              <select name="notifications" className="input-field" value={details.notifications || 'all'} onChange={handleChange}>
                <option value="all">All Notifications</option>
                <option value="important">Important Only</option>
                <option value="none">Mute All</option>
              </select>
            </div>
          </div>

          <h3 style={{ marginTop: 0 }}>Business Details (For Exports)</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>These details will instantly map to the red header of your PDF and Excel documents.</p>
          <input type="text" name="name" className="input-field" placeholder="Owner Name" value={details.name} onChange={handleChange} />
          <input type="text" name="mobile1" className="input-field" placeholder="Mobile 1" value={details.mobile1} onChange={handleChange} />
          <input type="text" name="mobile2" className="input-field" placeholder="Mobile 2" value={details.mobile2} onChange={handleChange} />
          <input type="text" name="email" className="input-field" placeholder="Email Address" value={details.email} onChange={handleChange} />
          <input type="text" name="address" className="input-field" placeholder="Address" value={details.address} onChange={handleChange} />
          <input type="text" name="gstin" className="input-field" placeholder="GST Number" value={details.gstin} onChange={handleChange} />
          <button className="btn" style={{ width: '100%', marginTop: '10px' }} onClick={handleSave}>Save Profile</button>
          
          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>Account Actions</h4>
            <button className="btn" style={{ width: '100%', backgroundColor: '#dc3545', color: '#fff' }} onClick={handleLogout}>
              Sign Out & Lock App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
