import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, History as HistoryIcon, FileText, IndianRupee, Users } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const res = await fetch('/.netlify/functions/api/estimate/all', {
          headers: { 'x-auth-token': localStorage.getItem('auth_token') }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(d => ({
            id: d._id,
            client: { 
              name: d.clientId?.name || 'Unknown', 
              mobile: d.clientId?.mobile || '', 
              address: d.clientId?.address || '' 
            },
            totalAmount: d.totalAmount,
            date: d.date
          }));
          setEstimates(formatted);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    };
    fetchEstimates();
  }, []);

  const totalRevenue = estimates.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const uniqueClients = new Set(estimates.map(e => e.client.name.toLowerCase().trim())).size;

  return (
    <div>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Dashboard</h1>
      <p style={{ color: '#666', margin: '0 0 32px 0' }}>Welcome to Interior IT Estimate Manager</p>

      {/* Primary Actions */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div 
          onClick={() => navigate('/create-estimate')}
          style={{ 
            flex: 1, backgroundColor: '#fff', border: '2px dashed #BC1F24', borderRadius: '12px', padding: '24px', 
            display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s' 
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(188,31,36,0.1)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <div style={{ backgroundColor: '#BC1F24', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus color="#fff" size={32} strokeWidth={3} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>New Estimate</h2>
            <p style={{ margin: 0, color: '#666' }}>Create a new client estimate</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/history')}
          style={{ 
            flex: 1, backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', 
            display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
        >
          <div style={{ backgroundColor: '#111', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HistoryIcon color="#fff" size={32} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>View History</h2>
            <p style={{ margin: 0, color: '#666' }}>Browse all past estimates</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px', fontWeight: '500' }}>Total Estimates</p>
              <h2 style={{ margin: 0, fontSize: '32px' }}>{estimates.length}</h2>
            </div>
            <div style={{ backgroundColor: '#ffe5e5', padding: '12px', borderRadius: '50%' }}>
              <FileText color="#BC1F24" size={24} />
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px', fontWeight: '500' }}>Total Revenue</p>
              <h2 style={{ margin: 0, fontSize: '28px' }}>₹ {totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
            </div>
            <div style={{ backgroundColor: '#ffe5e5', padding: '12px', borderRadius: '50%' }}>
              <IndianRupee color="#BC1F24" size={24} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px', fontWeight: '500' }}>Unique Clients</p>
              <h2 style={{ margin: 0, fontSize: '32px' }}>{uniqueClients}</h2>
            </div>
            <div style={{ backgroundColor: '#ffe5e5', padding: '12px', borderRadius: '50%' }}>
              <Users color="#BC1F24" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Estimates (Top 3) */}
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Recent Estimates</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {estimates.slice(0, 3).length === 0 ? (
           <p style={{ color: '#666' }}>No recent estimates.</p>
        ) : estimates.slice(0, 3).map((est) => (
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
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>₹ {est.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>draft</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
