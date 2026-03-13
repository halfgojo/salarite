import React, { useState, useEffect } from 'react';
import ActivityFeed from '../components/ActivityFeed';
import { PlayCircle, CheckCircle2, ClipboardList, Clock, BarChart3, Inbox } from 'lucide-react';

export default function HRDashboard({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchTasks = () => {
    fetch(`${API_URL}/tasks/?assigned_to=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setTasks(data))
      .catch(err => console.error("Could not fetch tasks. Is the backend running?"));
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const updateTaskStatus = (taskId, action, taskTitle) => {
    fetch(`${API_URL}/tasks/${taskId}/${action}`, { method: 'PATCH' })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        fetchTasks();
        showToast(action === 'start' ? `Started: ${taskTitle}` : `Completed: ${taskTitle}`);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to update status. Please ensure the backend server is running on port 8000.");
      });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} color="var(--secondary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast}</span>
        </div>
      )}

      <div className="page-header">
        <h1>My Workspace</h1>
      </div>

      {/* My Progress — unique to HR */}
      <div className="card mb-6" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>My Progress</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{completionRate}%</span>
        </div>
        <div className="progress-bar-container" style={{ height: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${completionRate}%`, height: '100%' }}></div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }}></div>
            <span className="text-sm"><strong>{inProgress}</strong> In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }}></div>
            <span className="text-sm"><strong>{completed}</strong> Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#9CA3AF' }}></div>
            <span className="text-sm"><strong>{pending}</strong> Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        <div>
          {/* Task List with Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', color: 'var(--primary)' }}>
                  <ClipboardList size={16} />
                </div>
                My Tasks
              </div>
              <span className="badge badge-pending">{tasks.length} assigned</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Task Details</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr><td colSpan="4">
                      <div className="empty-state">
                        <div className="empty-state-icon"><Inbox size={24} /></div>
                        <p className="text-sm text-muted">No tasks assigned to you yet. Check back soon!</p>
                      </div>
                    </td></tr>
                  )}
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        {t.description && <div className="text-xs text-muted mt-1">{t.description}</div>}
                        {t.completed_at && (
                          <div className="text-xs mt-1" style={{ color: 'var(--secondary)', fontWeight: 500 }}>
                            ✓ Completed at {new Date(t.completed_at).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      <td>
                        {t.status === 'Completed' && <span className="badge badge-completed">✓ Done</span>}
                        {t.status === 'In Progress' && <span className="badge badge-inprogress">● Active</span>}
                        {t.status === 'Pending' && <span className="badge badge-pending">○ Waiting</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {t.status === 'Pending' && (
                          <button className="btn btn-primary btn-sm btn-action-hover" onClick={() => updateTaskStatus(t.id, 'start', t.title)}>
                            <PlayCircle size={14} /> Start
                          </button>
                        )}
                        {t.status === 'In Progress' && (
                          <button className="btn btn-success btn-sm btn-action-hover" onClick={() => updateTaskStatus(t.id, 'complete', t.title)}>
                            <CheckCircle2 size={14} /> Complete
                          </button>
                        )}
                        {t.status === 'Completed' && (
                          <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Feed Column */}
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
