import React, { useState, useEffect } from 'react';
import ActivityFeed from '../components/ActivityFeed';
import { PlusCircle, ListTodo, TrendingUp, CheckCircle2, Clock, BarChart3, Inbox } from 'lucide-react';

export default function EmployerDashboard({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState(2);
  const [toast, setToast] = useState(null);

  const fetchTasks = () => {
    fetch('http://127.0.0.1:8000/tasks/')
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
    fetch('http://127.0.0.1:8000/tasks/', {
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
        <h1>Employer Dashboard</h1>
        <p>Manage tasks, track Virtual HR performance, and monitor activity in real-time.</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card total">
          <div className="stat-icon total"><ListTodo size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
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
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Overall Completion</span>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        <div className="flex flex-col gap-6">
          {/* Create Task */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', color: 'var(--primary)' }}>
                  <PlusCircle size={16} />
                </div>
                Create New Task
              </div>
            </div>
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
              <button type="submit" className="btn btn-primary btn-lg w-full">
                <PlusCircle size={18} /> Assign Task
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', color: '#6B7280' }}>
                  <ListTodo size={16} />
                </div>
                All Tasks
              </div>
              <span className="badge badge-pending">{tasks.length} total</span>
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
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>HR</div>
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
