import React, { useEffect, useState, useRef } from 'react';
import { Activity, Zap } from 'lucide-react';

export default function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const feedRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/activity')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(console.error);

    const ws = new WebSocket('ws://127.0.0.1:8000/activity/ws');
    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prev => [newLog, ...prev]);
    };
    return () => ws.close();
  }, []);

  const getActivityColor = (action) => {
    if (action.includes('completed')) return 'green';
    if (action.includes('started')) return 'blue';
    if (action.includes('scheduled') || action.includes('📅')) return 'amber';
    return 'blue';
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#7C3AED' }}>
            <Activity size={16} />
          </div>
          Activity Feed
        </div>
        <div className="live-pulse">
          <span className="live-pulse-dot"></span>
          Live
        </div>
      </div>

      <div className="activity-feed" ref={feedRef}>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Zap size={24} /></div>
            <p className="text-sm text-muted">Activity will appear here in real-time when actions are performed.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="activity-item">
              <div className={`activity-dot ${getActivityColor(log.action)}`}></div>
              <div>
                <div className="activity-text">{log.action}</div>
                <div className="activity-time">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
