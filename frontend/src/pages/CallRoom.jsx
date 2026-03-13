import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, Users, Clock, Shield, Camera, AlertCircle, Calendar, ArrowLeft } from 'lucide-react';

export default function CallRoom() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Interview context from URL params
  const candidateName = searchParams.get('candidate') || 'Participant';
  const meetType = searchParams.get('type') || 'Video Call';
  const meetDate = searchParams.get('date') || '';
  const meetTime = searchParams.get('time') || '';

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(meetType === 'Video Call');
  const [elapsed, setElapsed] = useState(0);
  const [joined, setJoined] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [stream, setStream] = useState(null);

  const localVideoRef = useRef(null);
  const audioAnimRef = useRef(null);

  useEffect(() => {
    document.title = `Meet: ${candidateName} | Salarite ATS`;
  }, [candidateName]);

  useEffect(() => {
    if (!joined) return;
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [joined]);

  // Attach stream to video element whenever stream or videoOn changes
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, videoOn, joined]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const formatTimeElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const requestPermissions = async (withVideo) => {
    try {
      const constraints = { audio: true };
      if (withVideo) constraints.video = { width: 640, height: 480, facingMode: 'user' };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setVideoOn(withVideo);
      setJoined(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setPermissionError('Permission denied. Please allow camera/mic access in your browser settings.');
      } else {
        setPermissionError(`Device error: ${err.message}. Joining in demo mode.`);
        setVideoOn(false);
        setJoined(true);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => { track.enabled = !track.enabled; });
    }
    setMicOn(!micOn);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => { track.enabled = !track.enabled; });
        setVideoOn(!videoOn);
      } else if (!videoOn) {
        // Need to get video stream if we joined audio-only
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
          .then(videoStream => {
            const videoTrack = videoStream.getVideoTracks()[0];
            stream.addTrack(videoTrack);
            setVideoOn(true);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {});
      }
    }
    else { setVideoOn(!videoOn); }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  // Pre-join screen
  if (!joined) {
    return (
      <div className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 4rem)' }}>
        <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}>
            {meetType === 'Voice Call' ? <Mic size={28} /> : <Video size={28} />}
          </div>

          <h2 style={{ marginBottom: '0.25rem' }}>Salarite Meet</h2>
          <p className="text-sm text-muted mb-2">All interviews happen on this platform</p>

          <div style={{ background: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '1rem 0', textAlign: 'left' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} color="var(--primary)" />
              <span className="text-sm"><strong>Meeting with:</strong> {candidateName}</span>
            </div>
            {meetDate && (
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} color="var(--primary)" />
                <span className="text-sm"><strong>Scheduled:</strong> {meetDate} at {meetTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              {meetType === 'Video Call' ? <Video size={14} color="var(--primary)" /> : <Mic size={14} color="var(--primary)" />}
              <span className="text-sm"><strong>Mode:</strong> {meetType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} color="var(--secondary)" />
              <span className="text-xs text-muted">Room ID: {id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center mb-4" style={{ padding: '0.5rem 0.75rem', background: '#EDE9FE', borderRadius: 'var(--radius-md)' }}>
            <Camera size={14} color="#6D28D9" />
            <span className="text-xs" style={{ color: '#4C1D95' }}>Your browser will request camera & microphone access</span>
          </div>

          {permissionError && (
            <div className="flex items-center gap-2 mb-4" style={{ padding: '0.75rem 1rem', background: '#FEF2F2', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem', textAlign: 'left' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {permissionError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {meetType === 'Video Call' && (
              <button className="btn btn-primary btn-lg w-full" onClick={() => requestPermissions(true)}>
                <Camera size={18} /> Join with Video & Audio
              </button>
            )}
            <button className="btn btn-secondary btn-lg w-full" onClick={() => requestPermissions(false)} style={{ border: '1.5px solid var(--border-color)' }}>
              <Mic size={18} /> {meetType === 'Voice Call' ? 'Join Voice Call' : 'Join Audio Only'}
            </button>
            <button className="btn w-full" style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8125rem' }} onClick={() => { setJoined(true); setVideoOn(false); setMicOn(false); }}>
              Join as Observer (no mic/camera)
            </button>
          </div>

          <button className="btn w-full mt-3" style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8125rem' }} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  // In-call screen
  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', gap: '0.75rem' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Video size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Salarite Meet</div>
            <div className="text-xs text-muted">Meeting with {candidateName}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} color="var(--danger)" />
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--danger)' }}>{formatTimeElapsed(elapsed)}</span>
          </div>
          <div className="live-pulse">
            <span className="live-pulse-dot"></span>
            Live
          </div>
          <span className="badge badge-inprogress">{videoOn ? '📹 Video' : '🎙 Audio'}</span>
        </div>
      </div>

      {/* Video area */}
      <div style={{ flex: 1, background: '#0F172A', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        {/* YOUR Video/Audio Tile */}
        <div style={{ width: '48%', maxWidth: 500, aspectRatio: '16/9', background: 'linear-gradient(135deg, #1E293B, #334155)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative', border: '2px solid rgba(99,102,241,0.2)', overflow: 'hidden' }}>
          
          {/* Live Camera Feed */}
          {videoOn && stream && stream.getVideoTracks().length > 0 ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          ) : (
            <>
              {/* Audio-only or no-video avatar */}
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: 'white', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}>
                {!videoOn && micOn ? (
                  <div style={{ position: 'relative' }}>
                    <Mic size={28} />
                    <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                ) : (
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>You</span>
                )}
              </div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem' }}>You</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                {videoOn ? 'Camera starting...' : micOn ? 'Audio connected' : 'Observer'}
              </p>
            </>
          )}

          {/* Name overlay for video */}
          {videoOn && stream && stream.getVideoTracks().length > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem 1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>You</span>
            </div>
          )}

          {/* Status badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.375rem' }}>
            <span style={{ background: micOn ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: micOn ? '#34D399' : '#FCA5A5', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
              {micOn ? '🎙 On' : '🔇 Muted'}
            </span>
            <span style={{ background: videoOn ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: videoOn ? '#34D399' : '#FCA5A5', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
              {videoOn ? '📹 On' : '📵 Off'}
            </span>
          </div>
        </div>

        {/* CANDIDATE Tile (simulated — waiting to join) */}
        <div style={{ width: '48%', maxWidth: 500, aspectRatio: '16/9', background: 'linear-gradient(135deg, #1F2937, #111827)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative', border: '2px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary-light), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 800, color: 'white', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
            {candidateName.charAt(0).toUpperCase()}
          </div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem' }}>{candidateName}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Waiting to join...</p>
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{ background: 'rgba(251,191,36,0.2)', color: '#FBBF24', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 600 }}>
              ⏳ Not joined yet
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <button title={micOn ? 'Mute' : 'Unmute'} className="btn" style={{ backgroundColor: micOn ? '#F3F4F6' : '#FEE2E2', color: micOn ? 'var(--text-main)' : '#DC2626', borderRadius: '50%', width: 52, height: 52, padding: 0, border: `2px solid ${micOn ? 'var(--border-color)' : '#FECACA'}`, transition: 'all 0.2s' }} onClick={toggleMic}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button title={videoOn ? 'Camera off' : 'Camera on'} className="btn" style={{ backgroundColor: videoOn ? '#F3F4F6' : '#FEE2E2', color: videoOn ? 'var(--text-main)' : '#DC2626', borderRadius: '50%', width: 52, height: 52, padding: 0, border: `2px solid ${videoOn ? 'var(--border-color)' : '#FECACA'}`, transition: 'all 0.2s' }} onClick={toggleVideo}>
          {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button title="Share screen" className="btn" style={{ backgroundColor: '#F3F4F6', color: 'var(--text-main)', borderRadius: '50%', width: 52, height: 52, padding: 0, border: '2px solid var(--border-color)' }}>
          <Monitor size={20} />
        </button>
        <div style={{ width: 1, height: 36, background: 'var(--border-color)', alignSelf: 'center', margin: '0 0.5rem' }}></div>
        <button className="btn" onClick={endCall} style={{ backgroundColor: '#DC2626', color: 'white', borderRadius: '999px', height: 52, padding: '0 1.5rem', border: 'none', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
          <PhoneOff size={18} /> End Meet
        </button>
      </div>
    </div>
  );
}
