import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Phone, MessageSquare, CalendarPlus, Calendar, CheckCircle2, Users, Inbox, Mail, Send, Link2, Clock, PhoneCall, ExternalLink } from 'lucide-react';

export default function ScheduleInterview({ userId }) {
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('Video Call');
  const [interviews, setInterviews] = useState([]);
  const [toast, setToast] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchInterviews = () => {
    fetch(`${API_URL}/interviews/`)
      .then(res => res.json())
      .then(data => setInterviews(data));
  };

  useEffect(() => { fetchInterviews(); }, []);

  const handleSchedule = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/interviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_name: candidateName,
        candidate_email: candidateEmail || null,
        date, time, mode,
        scheduled_by: userId
      })
    })
    .then(res => res.json())
    .then((data) => {
      fetchInterviews();
      if (candidateEmail) {
        showToastMsg(`📧 Interview invite sent to ${candidateEmail}`);
      } else {
        showToastMsg(`Interview scheduled with ${candidateName}`);
      }
      setCandidateName('');
      setCandidateEmail('');
      setDate('');
      setTime('');
    });
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const joinMeet = (interview) => {
    // Navigate within the app — no external platform needed
    const params = new URLSearchParams({
      candidate: interview.candidate_name,
      type: interview.mode,
      date: interview.date,
      time: interview.time
    });
    navigate(`/call-room/${interview.call_room_id}?${params.toString()}`);
  };

  const getModeIcon = (m) => {
    if (m === 'Voice Call') return <Phone size={15} />;
    if (m === 'Video Call') return <Video size={15} />;
    return <MessageSquare size={15} />;
  };

  const getModeBadge = (m) => {
    if (m === 'Video Call') return <span className="badge badge-inprogress flex items-center gap-1">{getModeIcon(m)} {m}</span>;
    if (m === 'Voice Call') return <span className="badge badge-completed flex items-center gap-1">{getModeIcon(m)} {m}</span>;
    return <span className="badge badge-scheduled flex items-center gap-1">{getModeIcon(m)} {m}</span>;
  };

  return (
    <div className="animate-fadeIn">
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} color="var(--secondary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast}</span>
        </div>
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEmailPreview(null)}>
          <div className="card animate-slideUp" style={{ maxWidth: 520, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '1.5rem', color: 'white' }}>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={20} />
                <span style={{ fontWeight: 700 }}>Email Invite Preview</span>
              </div>
              <div className="text-xs" style={{ opacity: 0.7 }}>This is the invite the candidate receives</div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-muted">TO:</span>
                  <span className="text-sm">{showEmailPreview.candidate_email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">SUBJECT:</span>
                  <span className="text-sm font-bold">Interview Invitation – Salarite ATS</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Dear <strong>{showEmailPreview.candidate_name}</strong>,</p>
              <p className="text-sm" style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                We are pleased to inform you that your interview has been scheduled on the <strong>Salarite platform</strong>. All communication will happen through our built-in meet — no external tools required.
              </p>
              <div style={{ background: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div className="flex items-center gap-2 mb-2"><Calendar size={14} color="var(--primary)" /><span className="text-sm"><strong>Date:</strong> {showEmailPreview.date}</span></div>
                <div className="flex items-center gap-2 mb-2"><Clock size={14} color="var(--primary)" /><span className="text-sm"><strong>Time:</strong> {showEmailPreview.time}</span></div>
                <div className="flex items-center gap-2 mb-2">{getModeIcon(showEmailPreview.mode)}<span className="text-sm"><strong>Mode:</strong> {showEmailPreview.mode}</span></div>
                <div className="flex items-center gap-2"><Link2 size={14} color="var(--secondary)" /><span className="text-sm"><strong>Meet Room:</strong> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>salarite.com/call-room/{showEmailPreview.call_room_id}</span></span></div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #EDE9FE, #E0E7FF)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div className="flex items-center gap-2">
                  <PhoneCall size={14} color="#6D28D9" />
                  <span className="text-sm" style={{ color: '#4C1D95', fontWeight: 500 }}>
                    All meetings happen on Salarite's built-in platform — no Google Meet, Zoom, or external links needed.
                  </span>
                </div>
              </div>
              <p className="text-sm" style={{ marginTop: '1rem' }}>Best regards,<br /><strong>Salarite HR Team</strong></p>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowEmailPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>Interview Scheduler</h1>
        <p>Schedule & conduct candidate interviews on Salarite's built-in meet — no external platforms needed.</p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card total">
          <div className="stat-icon total"><Calendar size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{interviews.length}</div>
            <div className="stat-label">Total Interviews</div>
          </div>
        </div>
        <div className="stat-card inprogress">
          <div className="stat-icon inprogress"><Video size={22} /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#D97706' }}>{interviews.filter(i => i.mode === 'Video Call').length}</div>
            <div className="stat-label">Video Calls</div>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon completed"><Phone size={22} /></div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#059669' }}>{interviews.filter(i => i.mode !== 'Video Call').length}</div>
            <div className="stat-label">Voice / Chat</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-equal">
        {/* Form */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#7C3AED' }}>
                <CalendarPlus size={16} />
              </div>
              New Interview
            </div>
          </div>
          <form onSubmit={handleSchedule}>
            <div className="form-group">
              <label className="form-label">Candidate Name</label>
              <input required className="form-control" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="e.g., Rahul Sharma" />
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="flex items-center gap-1"><Mail size={14} /> Candidate Email</span>
              </label>
              <input type="email" className="form-control" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} placeholder="candidate@email.com" />
              <div className="text-xs text-muted mt-1" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Send size={10} /> Meet link with room ID will be sent to this email
              </div>
            </div>
            <div className="flex gap-4">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Date</label>
                <input required type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Time</label>
                <input required type="time" className="form-control" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Interview Mode</label>
              <select className="form-control" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="Video Call">📹 Video Call (Camera + Audio)</option>
                <option value="Voice Call">📞 Voice Call (Audio Only)</option>
                <option value="Chat Interview">💬 Chat Interview</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full">
              <CalendarPlus size={18} /> Schedule & Send Invite
            </button>
          </form>
        </div>

        {/* Interviews List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', color: '#6B7280' }}>
                <Calendar size={16} />
              </div>
              Scheduled Interviews
            </div>
            <span className="badge badge-scheduled">{interviews.length} scheduled</span>
          </div>

          {/* Description banner */}
          <div className="flex items-center gap-2 mb-4" style={{ padding: '0.625rem 0.875rem', background: 'linear-gradient(135deg, #EDE9FE, #E0E7FF)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: '#4C1D95', fontWeight: 500 }}>
            <PhoneCall size={14} />
            All meets are conducted on this platform — click "Join Meet" to start
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Date & Time</th>
                  <th>Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviews.length === 0 && (
                  <tr><td colSpan="4">
                    <div className="empty-state">
                      <div className="empty-state-icon"><Inbox size={24} /></div>
                      <p className="text-sm text-muted">No interviews scheduled yet.</p>
                    </div>
                  </td></tr>
                )}
                {interviews.map(i => (
                  <tr key={i.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C7D2FE, #A5B4FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730A3', fontSize: '0.75rem', fontWeight: 700 }}>
                          {i.candidate_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{i.candidate_name}</div>
                          {i.candidate_email && <div className="text-xs text-muted flex items-center gap-1"><Mail size={10} /> {i.candidate_email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{i.date} at {i.time}</td>
                    <td>{getModeBadge(i.mode)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-primary btn-sm" onClick={() => joinMeet(i)} style={{ boxShadow: '0 2px 6px rgba(99,102,241,0.25)' }}>
                          <Video size={13} /> Join Meet
                        </button>
                        {i.candidate_email && (
                          <button className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#7C3AED', border: 'none' }} onClick={() => setShowEmailPreview(i)}>
                            <Mail size={12} /> Invite
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
