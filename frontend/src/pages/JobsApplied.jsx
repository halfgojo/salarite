import React from 'react';

export default function JobsApplied() {
  return (
    <div className="page-header animate-fadeIn">
      <h1>Jobs Applied</h1>
      <p>Track the status of your applications.</p>
      
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="card-title">Application History</h2>
        </div>
        <div className="p-4 text-muted text-sm">
          No applications found yet.
        </div>
      </div>
    </div>
  );
}
