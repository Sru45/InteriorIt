import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2 } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('interior_estimates');
    if (saved) setEstimates(JSON.parse(saved));
  }, []);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this estimate?')) {
      const newEstimates = estimates.filter(e => e.id !== id);
      setEstimates(newEstimates);
      localStorage.setItem('interior_estimates', JSON.stringify(newEstimates));
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Estimate History</h1>
      <p style={{ color: '#666', margin: '0 0 32px 0' }}>Browse and edit all past client estimates</p>

      {estimates.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <p>No estimates found. Create a new one!</p>
          <button className="btn" style={{marginTop: '16px'}} onClick={() => navigate('/create-estimate')}>+ New Estimate</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {estimates.map((est) => (
            <div key={est.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffe5e5', padding: '12px', borderRadius: '12px' }}>
                  <FileText color="#BC1F24" size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>{est.client.name}</h3>
                  <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{new Date(est.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>₹ {est.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => navigate(`/edit-estimate/${est.id}`)} style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.2s' }} onMouseOver={e=>e.currentTarget.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'} onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                    <Edit size={18} color="#333" />
                  </button>
                  <button onClick={() => handleDelete(est.id)} style={{ backgroundColor: '#fff0f0', border: '1px solid #ffcccc', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.2s' }} onMouseOver={e=>e.currentTarget.style.boxShadow='0 2px 4px rgba(188,31,36,0.15)'} onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                    <Trash2 size={18} color="#BC1F24" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
