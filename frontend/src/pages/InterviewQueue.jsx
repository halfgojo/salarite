import React from 'react';

export default function InterviewQueue() {
  return (
    <div className="page-header animate-fadeIn">
      <h1>Interview in Queue</h1>
      <p>Your upcoming scheduled interviews will appear here.</p>
      
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="card-title">Pending Interviews</h2>
        </div>
        <div className="p-4 text-muted text-sm">
          No interviews scheduled at the moment.
        </div>
      </div>
    </div>
  );
}
