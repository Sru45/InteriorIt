import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, IndianRupee, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export default function Clients() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadClients() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'users', currentUser.uid, 'estimates'));
        const snap = await getDocs(q);
        const estimates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Group by client name
        const clientMap = {};
        
        estimates.forEach(est => {
          if (!est.client || !est.client.name) return;
          
          const key = est.client.name.toLowerCase().trim();
          if (!clientMap[key]) {
            clientMap[key] = {
              name: est.client.name,
              gst: est.client.gst || '',
              address: est.client.address || '',
              totalEstimates: 0,
              totalRevenue: 0,
              lastEstimateDate: est.date || est.id
            };
          }
          
          clientMap[key].totalEstimates += 1;
          clientMap[key].totalRevenue += (est.totalAmount || 0);
          // Track most recent date
          if (new Date(est.date || est.id) > new Date(clientMap[key].lastEstimateDate)) {
            clientMap[key].lastEstimateDate = est.date || est.id;
            clientMap[key].gst = est.client.gst || clientMap[key].gst;
            clientMap[key].address = est.client.address || clientMap[key].address;
          }
        });
        
        const clientArray = Object.values(clientMap).sort((a, b) => 
          new Date(b.lastEstimateDate) - new Date(a.lastEstimateDate)
        );
        setClients(clientArray);
      } catch (e) {
        console.error("Failed to load clients", e);
      }
    }
    loadClients();
  }, [currentUser]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Clients Directory</h1>
          <p style={{ color: '#666', margin: 0 }}>Manage your clients and view their history</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={20} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input 
            type="text" 
            placeholder="Search clients..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', 
              border: '1px solid #e0e0e0', outline: 'none', fontSize: '15px' 
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredClients.length === 0 ? (
          <p style={{ color: '#666' }}>No clients found.</p>
        ) : filteredClients.map((client, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(`/clients/${encodeURIComponent(client.name)}`)}
            style={{ 
              backgroundColor: '#fff', borderRadius: '12px', padding: '24px', 
              border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#ffe5e5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users color="#BC1F24" size={24} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</h2>
                <p style={{ margin: 0, color: '#888', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.gst ? `GST: ${client.gst}` : 'No GST'}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#888', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} /> Estimates
                </p>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '16px' }}>{client.totalEstimates}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px 0', color: '#888', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <IndianRupee size={14} /> Revenue
                </p>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#BC1F24' }}>
                  ₹ {client.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
