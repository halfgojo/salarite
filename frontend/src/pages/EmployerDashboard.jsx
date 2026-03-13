import React, { useState, useEffect } from 'react';
import ActivityFeed from '../components/ActivityFeed';
import { PlusCircle, ListTodo, Users, CheckCircle2, Clock, Inbox, TrendingUp } from 'lucide-react';

export default function EmployerDashboard({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState(2);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchTasks = () => {
    fetch(`${API_URL}/tasks/`)
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
  }, []);

  const handleCreateTask = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority, assigned_to: parseInt(assignedTo) })
    })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(() => {
      fetchTasks();
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      showToast(`Task "${title}" assigned successfully!`);
    })
    .catch(err => {
      console.error(err);
      alert("Failed to create task. Please ensure the backend server is running on port 8000.");
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

  // Team breakdown
  const hr1Tasks = tasks.filter(t => t.assigned_to === 2);
  const hr2Tasks = tasks.filter(t => t.assigned_to === 3);

  const getHRStats = (hrTasks) => ({
    total: hrTasks.length,
    completed: hrTasks.filter(t => t.status === 'Completed').length,
    inProgress: hrTasks.filter(t => t.status === 'In Progress').length,
    pending: hrTasks.filter(t => t.status === 'Pending').length,
  });

  const hr1Stats = getHRStats(hr1Tasks);
  const hr2Stats = getHRStats(hr2Tasks);

  return (
    <div className="animate-fadeIn">
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} color="var(--secondary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast}</span>
        </div>
      )}

      <div className="page-header">
        <h1>Employer Dashboard</h1>
      </div>

      {/* Team Overview — unique to Employer */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#7C3AED' }}>
              <Users size={16} />
            </div>
            Team Overview
          </div>
          <span className="badge badge-scheduled">{tasks.length} total tasks</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* HR 1 Card */}
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>HR</div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Virtual HR 1</span>
            </div>
            <div className="flex gap-3 mt-2" style={{ flexWrap: 'wrap' }}>
              <div className="text-xs"><span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{hr1Stats.total}</span> <span className="text-muted">assigned</span></div>
              <div className="text-xs"><span style={{ fontWeight: 700, color: '#D97706', fontSize: '1rem' }}>{hr1Stats.inProgress}</span> <span className="text-muted">active</span></div>
              <div className="text-xs"><span style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>{hr1Stats.completed}</span> <span className="text-muted">done</span></div>
              <div className="text-xs"><span style={{ fontWeight: 700, color: '#6B7280', fontSize: '1rem' }}>{hr1Stats.pending}</span> <span className="text-muted">pending</span></div>
            </div>
            {hr1Stats.total > 0 && (
              <div className="progress-bar-container" style={{ marginTop: '0.75rem' }}>
                <div className="progress-bar-fill" style={{ width: `${Math.round((hr1Stats.completed / hr1Stats.total) * 100)}%` }}></div>
              </div>
            )}
          </div>

          {/* HR 2 Card */}
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>HR</div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Virtual HR 2</span>
            </div>
            <div className="flex gap-3 mt-2" style={{ flexWrap: 'wrap' }}>
              <div className="text-xs"><span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{hr2Stats.total}</span> <span className="text-muted">assigned</span></div>
              <div className="text-xs"><span style={{ fontWeight: 700, color: '#D97706', fontSize: '1rem' }}>{hr2Stats.inProgress}</span> <span className="text-muted">active</span></div>
              <div className="text-xs"><span style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>{hr2Stats.completed}</span> <span className="text-muted">done</span></div>
              <div className="text-xs"><span style={{ fontWeight: 700, color: '#6B7280', fontSize: '1rem' }}>{hr2Stats.pending}</span> <span className="text-muted">pending</span></div>
            </div>
            {hr2Stats.total > 0 && (
              <div className="progress-bar-container" style={{ marginTop: '0.75rem' }}>
                <div className="progress-bar-fill" style={{ width: `${Math.round((hr2Stats.completed / hr2Stats.total) * 100)}%`, background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', color: 'var(--primary)', width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}>
                <PlusCircle size={16} />
              </div>
              Create New Task
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input required className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Screen React Developer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows="2" placeholder="Describe the task requirements..."></textarea>
                </div>
                <div className="flex gap-4">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Priority</label>
                    <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🔵 Low</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Assign To</label>
                    <select className="form-control" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                      <option value={2}>Virtual HR 1</option>
                      <option value={3}>Virtual HR 2</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <PlusCircle size={18} /> Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Task List + Activity Feed */}
      <div className="dashboard-grid">
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', color: '#6B7280' }}>
                  <ListTodo size={16} />
                </div>
                All Tasks
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-pending">{tasks.length} total</span>
                <button className="btn btn-primary btn-sm btn-action-hover" onClick={() => setIsModalOpen(true)}>
                  <PlusCircle size={14} /> New Task
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr><td colSpan="4">
                      <div className="empty-state">
                        <div className="empty-state-icon"><Inbox size={24} /></div>
                        <p className="text-sm text-muted">No tasks created yet. Create your first task above!</p>
                      </div>
                    </td></tr>
                  )}
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        {t.description && <div className="text-xs text-muted mt-1">{t.description}</div>}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.assigned_to === 2 ? 'linear-gradient(135deg, var(--primary-light), var(--secondary))' : 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>HR</div>
                          <span className="text-sm">Virtual HR {t.assigned_to === 2 ? '1' : '2'}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      <td>{getStatusBadge(t.status)}</td>
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
