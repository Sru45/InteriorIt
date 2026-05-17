import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, MapPin, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export default function ClientDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const decodedName = decodeURIComponent(name);
  
  const [client, setClient] = useState(null);
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    async function loadClientEstimates() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'users', currentUser.uid, 'estimates'));
        const snap = await getDocs(q);
        const allEstimates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const clientEstimates = allEstimates.filter(e => 
          e.client && e.client.name.toLowerCase().trim() === decodedName.toLowerCase().trim()
        ).sort((a, b) => new Date(b.date || b.id) - new Date(a.date || a.id));
        
        if (clientEstimates.length > 0) {
          setEstimates(clientEstimates);
          setClient({
            name: decodedName,
            gst: clientEstimates[0].client.gst || '',
            address: clientEstimates[0].client.address || '',
            totalRevenue: clientEstimates.reduce((sum, e) => sum + (e.totalAmount || 0), 0)
          });
        }
      } catch (e) {
        console.error("Failed to load client details", e);
      }
    }
    loadClientEstimates();
  }, [decodedName, currentUser]);

  if (!client) {
    return (
      <div style={{ padding: '40px' }}>
        <div onClick={() => navigate('/clients')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '24px' }}>
          <ArrowLeft size={18} /> Back to Clients
        </div>
        <div>Loading or Client not found...</div>
      </div>
    );
  }

  return (
    <div>
      <div 
        onClick={() => navigate('/clients')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', cursor: 'pointer', marginBottom: '24px', fontWeight: '500' }}
      >
        <ArrowLeft size={18} /> Back to Clients
      </div>

      {/* Client Profile Header */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e0e0e0', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '32px' }}>{client.name}</h1>
          <div style={{ display: 'flex', gap: '24px', color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} />
              <span>{client.gst ? `GSTIN: ${client.gst}` : 'No GST provided'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} />
              <span>{client.address || 'No address provided'}</span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Total Revenue Generated</p>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '28px', color: '#BC1F24' }}>
            ₹ {client.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <button 
            onClick={() => navigate(`/create-estimate?clientName=${encodeURIComponent(client.name)}`)}
            className="btn" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}
          >
            <Plus size={18} /> New Estimate
          </button>
        </div>
      </div>

      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={20} /> Work History
      </h2>
      
      {/* Estimates List */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#444' }}>Date</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#444' }}>Invoice No.</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#444', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((est) => (
              <tr key={est.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px 24px', color: '#666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#888" />
                    {new Date(est.date || est.id).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                  {est.invoiceNo || <span style={{color: '#aaa', fontStyle: 'italic'}}>Draft</span>}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>
                  ₹ {(est.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button 
                    onClick={() => navigate(`/edit-estimate/${est.id}`)}
                    style={{ 
                      padding: '8px 16px', backgroundColor: '#f0f0f0', border: 'none', 
                      borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#333'
                    }}
                  >
                    View / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
