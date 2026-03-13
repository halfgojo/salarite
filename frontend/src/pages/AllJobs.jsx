import React from 'react';

export default function AllJobs() {
  return (
    <div className="page-header animate-fadeIn">
      <h1>All Jobs</h1>
      <p>Browse open positions and apply.</p>
      
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="card-title">Available Openings</h2>
        </div>
        <div className="p-4 text-muted text-sm">
          Job listings coming soon.
        </div>
      </div>
    </div>
  );
}
