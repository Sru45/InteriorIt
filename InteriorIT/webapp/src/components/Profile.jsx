import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [details, setDetails] = useState({
    name: 'Babu Suthar',
    mobile1: '+91 97234 65421',
    mobile2: '+91 94275 15584',
    address: '24-A, Sona plot, Abrama, Vasad-396001 Gujarat',
    email: 'h.i.suthar85@gmail.com',
    ownerGst: '24BWHPS9275B129',
    ownerTextSize: '20',
    acName: '',
    bankName: '',
    acNo: '',
    ifsc: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid, 'profile', 'details');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDetails(docSnap.data());
        }
      }
    }
    loadProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'profile', 'details'), details);
      alert('Profile Saved Securely!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Company Settings & Branding</h1>
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
          <input type="text" name="ownerGst" className="input-field" placeholder="Owner GSTIN" value={details.ownerGst || ''} onChange={handleChange} />
          <input type="text" name="address" className="input-field" placeholder="Address" value={details.address} onChange={handleChange} />
          
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#666' }}>Owner Text Size</label>
            <select name="ownerTextSize" className="input-field" value={details.ownerTextSize || '20'} onChange={handleChange} style={{ marginBottom: 0 }}>
              <option value="16">Extra Small (16px)</option>
              <option value="18">Small (18px)</option>
              <option value="20">Medium (20px)</option>
              <option value="22">Large / Default (22px)</option>
              <option value="24">Extra Large (24px)</option>
            </select>
          </div>

          <div style={{ marginTop: '2rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Bank Account Details</h4>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '1rem' }}>These details will appear at the bottom left of your estimates.</p>
            <input type="text" name="acName" className="input-field" placeholder="A/C Holders Name" value={details.acName || ''} onChange={handleChange} />
            <input type="text" name="bankName" className="input-field" placeholder="Bank Name" value={details.bankName || ''} onChange={handleChange} />
            <input type="text" name="acNo" className="input-field" placeholder="A/c No." value={details.acNo || ''} onChange={handleChange} />
            <input type="text" name="ifsc" className="input-field" placeholder="IFSC Code" value={details.ifsc || ''} onChange={handleChange} style={{ marginBottom: 0 }} />
          </div>

          <button className="btn" style={{ width: '100%' }} onClick={handleSave}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}
