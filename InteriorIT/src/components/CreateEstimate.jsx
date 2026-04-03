import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { exportToExcel } from '../utils/excelExport';
import { exportToPdf } from '../utils/pdfExport';
import { generateHeaderImage } from '../utils/headerGenerator';

export default function CreateEstimate({ isEdit }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [ownerDetails, setOwnerDetails] = useState({
    name: 'Babu Suthar',
    mobile1: '+91 97234 65421',
    mobile2: '+91 94275 15584',
    address: 'Vasad-396001 Gujarat',
    email: 'h.i.suthar85@gmail.com',
    gstin: '24AAAAA0000A1Z5'
  });

  const [items, setItems] = useState([
    { id: Date.now(), isSection: false, itemName: '', length: 0, width: 0, qty: 1, rate: 0, sqft: 0, amount: 0 }
  ]);

  const [headerPreview, setHeaderPreview] = useState(null);

  useEffect(() => {
    const savedOwner = localStorage.getItem('interior_owner');
    let loadedOwner = ownerDetails;
    if (savedOwner) {
      loadedOwner = JSON.parse(savedOwner);
      setOwnerDetails(loadedOwner);
    }
    
    // Generate live canvas preview
    generateHeaderImage(loadedOwner).then(b64 => setHeaderPreview(b64));

    if (isEdit && id) {
      const loadEstimate = async () => {
        try {
          const res = await fetch(`/.netlify/functions/api/estimate/${id}`, {
            headers: { 'x-auth-token': localStorage.getItem('auth_token') }
          });
          if (res.ok) {
            const data = await res.json();
            setClientName(data.client.name || '');
            setClientMobile(data.client.mobile || '');
            setClientAddress(data.client.address || '');
            
            const fetchedItems = data.items.map(i => ({
              id: i._id,
              isSection: i.isSection || false,
              sectionName: i.sectionName || '',
              itemName: i.itemName || '',
              length: i.length || 0,
              width: i.width || 0,
              qty: i.qty || 1,
              rate: i.rate || 0,
              sqft: i.sqft || 0,
              amount: i.amount || 0
            }));
            if (fetchedItems.length > 0) setItems(fetchedItems);
          }
        } catch (e) {
          console.error("Failed to load estimate", e);
        }
      };
      loadEstimate();
    }
  }, [isEdit, id]);

  const handleItemChange = (itemId, field, value) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        if (field === 'length' || field === 'width' || field === 'qty' || field === 'rate') {
          updated.sqft = ((updated.length || 0) * (updated.width || 0) * (updated.qty || 0)) / 144;
          updated.amount = updated.sqft * (updated.rate || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItemRow = () => {
    setItems([...items, { id: Date.now(), itemName: '', length: 0, width: 0, qty: 1, rate: 0, sqft: 0, amount: 0 }]);
  };

  const removeItemRow = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const addSectionRow = () => {
    setItems([...items, { id: Date.now(), isSection: true, sectionName: '' }]);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.isSection ? 0 : (item.amount || 0)), 0);

  const handleSave = async () => {
    const payload = {
      client: { name: clientName, mobile: clientMobile, address: clientAddress },
      items,
      totalAmount
    };
    const token = localStorage.getItem('auth_token');
    
    try {
      if (isEdit && id) {
        const res = await fetch(`/.netlify/functions/api/estimate/update/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alert('Estimate Updated!');
          navigate('/dashboard');
        } else {
          alert('Update Failed - Please check internet connection');
        }
      } else {
        const res = await fetch('/.netlify/functions/api/estimate/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alert('Estimate Saved securely to Cloud!');
          navigate('/dashboard');
        } else {
          alert('Save Failed - Please check internet connection');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving estimate to Serverless Database');
    }
  };

  const handleExportExcel = async () => {
    const fileName = prompt("Enter a name for the Excel file:", clientName ? `${clientName.trim()}_Estimate` : 'Estimate');
    if (!fileName) return; // cancelled
    try {
      const estimate = { client: { name: clientName, mobile: clientMobile, address: clientAddress }, totalAmount };
      await exportToExcel(estimate, items, ownerDetails, fileName);
    } catch (e) {
      console.error(e);
      alert("Failed to export Excel: " + e.message);
    }
  };

  const handleExportPdf = async () => {
    const fileName = prompt("Enter a name for the PDF file:", clientName ? `${clientName.trim()}_Estimate` : 'Estimate');
    if (!fileName) return; // cancelled
    try {
      const estimate = { client: { name: clientName, mobile: clientMobile, address: clientAddress }, totalAmount };
      await exportToPdf(estimate, items, ownerDetails, fileName);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF: " + e.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>{isEdit ? 'Edit Estimate' : 'Create Estimate'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="container" style={{ padding: 0 }}>
        
        {/* Visual Estimate Header Preview */}
        {headerPreview && (
          <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <img src={headerPreview} alt="Estimate Header Preview" style={{ width: '100%', display: 'block' }} />
             <div style={{ padding: '12px 24px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>This letterhead will appear identically on all exported PDF/Excel documents.</span>
               <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => navigate('/profile')}>Edit Header Details</button>
             </div>
          </div>
        )}

        {/* Client Details */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Client Details</h3>
          <input type="text" placeholder="Client Name" className="input-field" value={clientName} onChange={e => setClientName(e.target.value)} />
          <input type="text" placeholder="Mobile Number" className="input-field" value={clientMobile} onChange={e => setClientMobile(e.target.value)} />
          <input type="text" placeholder="Address" className="input-field" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
        </div>

        {/* Dynamic Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Items</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ backgroundColor: '#6c757d' }} onClick={addSectionRow}>+ Add Section</button>
              <button className="btn" onClick={addItemRow}>+ Add Row</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{width: '10%'}}>Length (in)</th>
                  <th style={{width: '10%'}}>Width (in)</th>
                  <th style={{width: '10%'}}>Qty</th>
                  <th style={{width: '10%'}}>Sqft</th>
                  <th style={{width: '15%'}}>Rate (₹)</th>
                  <th style={{width: '15%'}}>Amount (₹)</th>
                  <th style={{width: '5%'}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {item.isSection ? (
                      <>
                        <td colSpan={7}>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{marginBottom:0, fontWeight: 'bold', backgroundColor: '#f0f0f0'}} 
                            placeholder="Section Title (e.g., Ground Floor)"
                            value={item.sectionName} 
                            onChange={e => handleItemChange(item.id, 'sectionName', e.target.value)} 
                          />
                        </td>
                        <td><button className="btn" style={{padding: '0.5rem', backgroundColor: '#dc3545'}} onClick={() => removeItemRow(item.id)}>X</button></td>
                      </>
                    ) : (
                      <>
                        <td><input type="text" className="input-field" style={{marginBottom:0}} value={item.itemName} onChange={e => handleItemChange(item.id, 'itemName', e.target.value)} /></td>
                        <td><input type="number" className="input-field" style={{marginBottom:0}} value={item.length || ''} onChange={e => handleItemChange(item.id, 'length', parseFloat(e.target.value)||0)} /></td>
                        <td><input type="number" className="input-field" style={{marginBottom:0}} value={item.width || ''} onChange={e => handleItemChange(item.id, 'width', parseFloat(e.target.value)||0)} /></td>
                        <td><input type="number" className="input-field" style={{marginBottom:0}} value={item.qty || ''} onChange={e => handleItemChange(item.id, 'qty', parseInt(e.target.value, 10)||0)} /></td>
                        <td>{(item.sqft || 0).toFixed(2)}</td>
                        <td><input type="number" className="input-field" style={{marginBottom:0}} value={item.rate || ''} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value)||0)} /></td>
                        <td style={{fontWeight: 'bold', color: 'var(--primary-red)'}}>₹{(item.amount || 0).toFixed(2)}</td>
                        <td><button className="btn" style={{padding: '0.5rem', backgroundColor: '#dc3545'}} onClick={() => removeItemRow(item.id)}>X</button></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <h2>Total: <span style={{ color: 'var(--primary-red)' }}>₹{totalAmount.toFixed(2)}</span></h2>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn" style={{ flex: 1, backgroundColor: '#28a745' }} onClick={handleExportExcel}>Download Excel</button>
          <button className="btn" style={{ flex: 1, backgroundColor: '#17a2b8' }} onClick={handleExportPdf}>Download PDF</button>
          <button className="btn" style={{ flex: 2 }} onClick={handleSave} disabled={!clientName || items.length === 0}>{isEdit ? 'Update Estimate' : 'Save Estimate'}</button>
        </div>

      </div>
    </div>
  );
}
