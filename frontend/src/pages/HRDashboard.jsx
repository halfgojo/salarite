import React, { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle2, ClipboardList, TrendingUp, Clock, BarChart3, Inbox } from 'lucide-react';

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

  const getStatusBadge = (status) => {
    if (status === 'Completed') return <span className="badge badge-completed">✓ Completed</span>;
    if (status === 'In Progress') return <span className="badge badge-inprogress">● In Progress</span>;
    return <span className="badge badge-pending">○ Pending</span>;
  };

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} color="var(--secondary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast}</span>
        </div>
      )}

      <div className="page-header">
        <h1>Virtual HR Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card total">
          <div className="stat-icon total"><ClipboardList size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Assigned Tasks</div>
          </div>
        </div>
        <div className="stat-card inprogress">
          <div className="stat-icon inprogress"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#D97706' }}>{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon completed"><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#059669' }}>{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon pending"><Clock size={22} /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#6B7280' }}>{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="card mb-6" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>My Progress</span>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      )}

      {/* Task Table */}
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
                  <td>{getStatusBadge(t.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {t.status === 'Pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateTaskStatus(t.id, 'start', t.title)}>
                        <PlayCircle size={14} /> Start
                      </button>
                    )}
                    {t.status === 'In Progress' && (
                      <button className="btn btn-success btn-sm" onClick={() => updateTaskStatus(t.id, 'complete', t.title)}>
                        <CheckCircle2 size={14} /> Complete
                      </button>
                    )}
                    {t.status === 'Completed' && (
                      <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
