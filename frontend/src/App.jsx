import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Briefcase, Users, UserCircle, Calendar, LogOut, LayoutDashboard, ClipboardList, Zap, MessageCircle, Video, User, Bell, Search, FileText, ArrowUp, Menu, X } from 'lucide-react';

import EmployerDashboard from './pages/EmployerDashboard';
import HRDashboard from './pages/HRDashboard';
import ScheduleInterview from './pages/ScheduleInterview';
import CallRoom from './pages/CallRoom';
import ChatRoom from './pages/ChatRoom';
import CandidateProfile from './pages/CandidateProfile';
import AllJobs from './pages/AllJobs';
import JobsApplied from './pages/JobsApplied';
import InterviewQueue from './pages/InterviewQueue';
import CandidateNotifications from './pages/CandidateNotifications';

function App() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!role) {
    return (
      <div className="login-container">
        <div className="login-card animate-fadeIn">
          <div className="login-logo">
            <Zap size={32} />
          </div>
          <div className="login-title">Salarite</div>
          <p className="login-subtitle">Virtual HR & ATS Platform</p>

          <div className="login-divider">Select your role</div>

          <button className="login-btn login-btn-employer" onClick={() => { setRole('employer'); setUserId(1); }}>
            <span className="login-btn-icon"><Briefcase size={20} /></span>
            <div style={{ textAlign: 'left' }}>
              <div>Login as Employer</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>Manage tasks & monitor HR activity</div>
            </div>
          </button>
          
          <button className="login-btn login-btn-hr" onClick={() => { setRole('hr'); setUserId(2); }}>
            <span className="login-btn-icon"><Users size={20} /></span>
            <div style={{ textAlign: 'left' }}>
              <div>Login as Virtual HR</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.5 }}>Execute tasks & schedule interviews</div>
            </div>
          </button>

          <button className="login-btn login-btn-candidate" onClick={() => { setRole('candidate'); setUserId(4); }}>
            <span className="login-btn-icon"><User size={20} /></span>
            <div style={{ textAlign: 'left' }}>
              <div>Login as Candidate</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.5 }}>Apply for jobs & track status</div>
            </div>
          </button>

          <p className="login-footer">Demo credentials pre-configured • No sign-up needed</p>
        </div>
      </div>
    );
  }

  let userName = 'User';
  if (role === 'employer') userName = 'John (Employer)';
  else if (role === 'hr') userName = 'Virtual HR 1';
  else if (role === 'candidate') userName = 'Alice (Candidate)';

  return (
    <BrowserRouter>
      <div className="app-container">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div 
          className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <Sidebar 
          role={role} 
          onLogout={() => { setRole(null); setUserId(null); }} 
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={role === 'employer' ? '/employer' : role === 'hr' ? '/hr' : '/profile'} replace />} />
            {role === 'employer' && (
              <Route path="/employer" element={<EmployerDashboard userId={userId} />} />
            )}
            {role === 'hr' && (
              <Route path="/hr" element={<HRDashboard userId={userId} />} />
            )}
            {role === 'candidate' && (
              <>
                <Route path="/profile" element={<CandidateProfile />} />
                <Route path="/jobs" element={<AllJobs />} />
                <Route path="/applications" element={<JobsApplied />} />
                <Route path="/interviews-queue" element={<InterviewQueue />} />
                <Route path="/notifications" element={<CandidateNotifications />} />
              </>
            )}
            
            {/* Shared routes among internal team */}
            {(role === 'employer' || role === 'hr') && (
              <>
                <Route path="/schedule-interview" element={<ScheduleInterview userId={userId} />} />
                <Route path="/chat" element={<ChatRoom userId={userId} userName={userName} userRole={role} />} />
              </>
            )}
            
             {/* Public routes (Call wrapper) */}
            <Route path="/call-room/:id" element={<CallRoom />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ScrollToTop />
      </div>
    </BrowserRouter>
  );
}

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const handleScroll = () => {
      // Show when scrolled down more than 50px
      if (mainContent.scrollTop > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    // Check initially
    handleScroll();
    
    mainContent.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      mainContent.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={scrollToTop}
      title="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 100,
        transition: 'all 0.2s ease',
        animation: 'bounceUp 2s infinite'
      }}
      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)'; }}
    >
      <ArrowUp size={20} />
      <style>{`
        @keyframes bounceUp {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          60% { transform: translateY(-3px); }
        }
      `}</style>
    </button>
  );
}

function Sidebar({ role, onLogout, isOpen, setIsOpen }) {
  const location = useLocation();

  const employerLinks = [
    { to: '/employer', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/schedule-interview', label: 'Interviews', icon: <Video size={18} /> },
    { to: '/chat', label: 'Team Chat', icon: <MessageCircle size={18} /> }
  ];

  const hrLinks = [
    { to: '/hr', label: 'My Tasks', icon: <ClipboardList size={18} /> },
    { to: '/schedule-interview', label: 'Interviews', icon: <Video size={18} /> },
    { to: '/chat', label: 'Team Chat', icon: <MessageCircle size={18} /> }
  ];

  const candidateLinks = [
    { to: '/profile', label: 'Profile', icon: <UserCircle size={18} /> },
    { to: '/jobs', label: 'All Jobs', icon: <Search size={18} /> },
    { to: '/applications', label: 'Jobs Applied', icon: <FileText size={18} /> },
    { to: '/interviews-queue', label: 'Interview in Queue', icon: <Calendar size={18} /> },
    { to: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  const links = role === 'employer' ? employerLinks : role === 'hr' ? hrLinks : candidateLinks;
  
  let userName = 'User';
  let initials = 'U';
  if (role === 'employer') { userName = 'John (Employer)'; initials = 'JE'; }
  else if (role === 'hr') { userName = 'Virtual HR 1'; initials = 'HR'; }
  else if (role === 'candidate') { userName = 'Alice (Candidate)'; initials = 'AC'; }

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <Link to="/" className="sidebar-brand" onClick={() => setIsOpen && setIsOpen(false)}>
        <div className="sidebar-brand-icon">
          <Zap size={20} />
        </div>
        <div>
          <div className="sidebar-brand-text">Salarite</div>
          <div className="sidebar-brand-sub">ATS Platform</div>
        </div>
      </Link>

      <div className="sidebar-section-label">Navigation</div>
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => setIsOpen(false)}
          className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{userName}</span>
            <span className="sidebar-user-role" style={{textTransform: 'capitalize'}}>{role}</span>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </nav>
  );
}

export default App;
