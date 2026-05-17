import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { exportToExcel } from '../utils/excelExport';
import { exportToPdf } from '../utils/pdfExport';
import { generateHeaderImage } from '../utils/headerGenerator';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query } from 'firebase/firestore';

export default function CreateEstimate({ isEdit }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [clientName, setClientName] = useState('');
  const [clientGst, setClientGst] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [showHsn, setShowHsn] = useState(true);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Draft');

  const [ownerDetails, setOwnerDetails] = useState({
    name: 'Babu Suthar',
    mobile1: '+91 97234 65421',
    mobile2: '+91 94275 15584',
    address: '24-A, Sona plot, Abrama, Vasad-396001 Gujarat',
    email: 'h.i.suthar85@gmail.com',
    ownerTextSize: '20',
    acName: '',
    bankName: '',
    acNo: '',
    ifsc: ''
  });

  const [items, setItems] = useState([
    { id: Date.now(), isSection: false, itemName: '', hsn: '', length: 0, width: 0, qty: 1, rate: 0, sqft: 0, amount: 0 }
  ]);

  const [headerPreview, setHeaderPreview] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      let loadedOwner = ownerDetails;
      try {
        const ownerDoc = await getDoc(doc(db, 'users', currentUser.uid, 'profile', 'details'));
        if (ownerDoc.exists()) {
          loadedOwner = ownerDoc.data();
          setOwnerDetails(loadedOwner);
        }
      } catch (e) {
        console.error("Failed to load owner profile", e);
      }

      // Generate live canvas preview
      generateHeaderImage(loadedOwner).then(b64 => setHeaderPreview(b64));

      const searchParams = new URLSearchParams(location.search);
      const prefillClient = searchParams.get('clientName');

      if (isEdit && id) {
        try {
          const estDoc = await getDoc(doc(db, 'users', currentUser.uid, 'estimates', id));
          if (estDoc.exists()) {
            const existing = estDoc.data();
            setClientName(existing.client.name);
            setClientGst(existing.client.gst || '');
            setClientAddress(existing.client.address);
            if (existing.showHsn !== undefined) setShowHsn(existing.showHsn);
            if (existing.invoiceNo) setInvoiceNo(existing.invoiceNo);
            if (existing.date) setEstimateDate(existing.date.split('T')[0]);
            if (existing.status) setStatus(existing.status);
            setItems(existing.items);
          }
        } catch (e) {
          console.error("Failed to load estimate", e);
        }
      } else if (prefillClient) {
        try {
          const q = query(collection(db, 'users', currentUser.uid, 'estimates'));
          const snap = await getDocs(q);
          const savedEstimates = snap.docs.map(d => d.data());
          const match = savedEstimates.find(e => e.client && e.client.name.toLowerCase().trim() === prefillClient.toLowerCase().trim());
          if (match) {
            setClientName(match.client.name);
            setClientGst(match.client.gst || '');
            setClientAddress(match.client.address || '');
          } else {
            setClientName(prefillClient);
          }
        } catch (e) {
          console.error("Failed to fetch prefill client", e);
        }
      }
    }
    loadData();
  }, [isEdit, id, location.search, currentUser]);

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
    setItems([...items, { id: Date.now(), itemName: '', hsn: '', length: 0, width: 0, qty: 1, rate: 0, sqft: 0, amount: 0 }]);
  };

  const removeItemRow = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const addSectionRow = () => {
    setItems([...items, { id: Date.now(), isSection: true, sectionName: '' }]);
  };

  const subTotal = items.reduce((sum, item) => sum + (item.isSection ? 0 : (item.amount || 0)), 0);
  const cgst = showHsn ? subTotal * 0.09 : 0;
  const sgst = showHsn ? subTotal * 0.09 : 0;
  const totalAmount = subTotal + cgst + sgst;

  const handleSave = async () => {
    if (!currentUser) {
      alert("You must be logged in to save.");
      return;
    }
    const newId = isEdit && id ? id : Date.now().toString();
    const newEst = {
      client: { name: clientName, gst: clientGst, address: clientAddress },
      showHsn,
      invoiceNo,
      status,
      items,
      totalAmount,
      date: estimateDate
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'estimates', newId), newEst);
      alert(isEdit && id ? 'Estimate Updated!' : 'Estimate Saved!');
      navigate('/dashboard');
    } catch (e) {
      console.error("Error saving estimate", e);
      alert("Failed to save estimate: " + e.message);
    }
  };

  const handleExportExcel = async () => {
    const fileName = prompt("Enter a name for the Excel file:", clientName ? `${clientName.trim()}_Estimate` : 'Estimate');
    if (!fileName) return; // cancelled
    try {
      const estimate = { client: { name: clientName, gst: clientGst, address: clientAddress }, totalAmount, showHsn, invoiceNo, date: estimateDate };
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
      const estimate = { client: { name: clientName, gst: clientGst, address: clientAddress }, totalAmount, showHsn, invoiceNo, date: estimateDate };
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
          <h3 style={{ marginTop: 0 }}>Estimate Details</h3>
          <input type="text" placeholder="Client Name" className="input-field" value={clientName} onChange={e => setClientName(e.target.value)} />
          <input type="text" placeholder="Client GST Number" className="input-field" value={clientGst} onChange={e => setClientGst(e.target.value)} />
          <input type="text" placeholder="Address" className="input-field" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '14px', color: '#666', fontWeight: '500' }}>Invoice No.</label>
              <input type="text" placeholder="e.g. IT-17/24-25" className="input-field" style={{ marginBottom: 0 }} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '14px', color: '#666', fontWeight: '500' }}>Date</label>
              <input type="date" className="input-field" style={{ marginBottom: 0 }} value={estimateDate} onChange={e => setEstimateDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '14px', color: '#666', fontWeight: '500' }}>Status</label>
              <select className="input-field" style={{ marginBottom: 0 }} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Items</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '14px', color: '#555', backgroundColor: '#f8f9fa', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                <input type="checkbox" checked={showHsn} onChange={e => setShowHsn(e.target.checked)} style={{ margin: 0 }} />
                Include HSN/SAC Column
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ backgroundColor: '#6c757d' }} onClick={addSectionRow}>+ Add Section</button>
                <button className="btn" onClick={addItemRow}>+ Add Row</button>
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  {showHsn && <th style={{ width: '10%' }}>Hsn/Sac</th>}
                  <th style={{ width: '10%' }}>Length (in)</th>
                  <th style={{ width: '10%' }}>Width (in)</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '10%' }}>Sqft</th>
                  <th style={{ width: '15%' }}>Rate (₹)</th>
                  <th style={{ width: '15%' }}>Amount (₹)</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {item.isSection ? (
                      <>
                        <td colSpan={showHsn ? 8 : 7}>
                          <input
                            type="text"
                            className="input-field"
                            style={{ marginBottom: 0, fontWeight: 'bold', backgroundColor: '#f0f0f0' }}
                            placeholder="Section Title (e.g., Ground Floor)"
                            value={item.sectionName}
                            onChange={e => handleItemChange(item.id, 'sectionName', e.target.value)}
                          />
                        </td>
                        <td><button className="btn" style={{ padding: '0.5rem', backgroundColor: '#dc3545' }} onClick={() => removeItemRow(item.id)}>X</button></td>
                      </>
                    ) : (
                      <>
                        <td><input type="text" className="input-field" style={{ marginBottom: 0 }} value={item.itemName} onChange={e => handleItemChange(item.id, 'itemName', e.target.value)} /></td>
                        {showHsn && <td><input type="text" className="input-field" style={{ marginBottom: 0 }} value={item.hsn || ''} onChange={e => handleItemChange(item.id, 'hsn', e.target.value)} /></td>}
                        <td><input type="number" className="input-field" style={{ marginBottom: 0 }} value={item.length || ''} onChange={e => handleItemChange(item.id, 'length', parseFloat(e.target.value) || 0)} /></td>
                        <td><input type="number" className="input-field" style={{ marginBottom: 0 }} value={item.width || ''} onChange={e => handleItemChange(item.id, 'width', parseFloat(e.target.value) || 0)} /></td>
                        <td><input type="number" className="input-field" style={{ marginBottom: 0 }} value={item.qty || ''} onChange={e => handleItemChange(item.id, 'qty', parseInt(e.target.value, 10) || 0)} /></td>
                        <td>{(item.sqft || 0).toFixed(2)}</td>
                        <td><input type="number" className="input-field" style={{ marginBottom: 0 }} value={item.rate || ''} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} /></td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary-red)' }}>₹{(item.amount || 0).toFixed(2)}</td>
                        <td><button className="btn" style={{ padding: '0.5rem', backgroundColor: '#dc3545' }} onClick={() => removeItemRow(item.id)}>X</button></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '1rem' }}>
            <h3 style={{ margin: '0.2rem 0', color: '#555' }}>Subtotal: ₹{subTotal.toFixed(2)}</h3>
            {showHsn && (
              <>
                <h4 style={{ margin: '0.2rem 0', color: '#666' }}>CGST -9%: ₹{cgst.toFixed(2)}</h4>
                <h4 style={{ margin: '0.2rem 0', color: '#666' }}>SGST -9%: ₹{sgst.toFixed(2)}</h4>
              </>
            )}
            <h2 style={{ marginTop: '0.5rem' }}>Total Amount: <span style={{ color: 'var(--primary-red)' }}>₹{totalAmount.toFixed(2)}</span></h2>
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
