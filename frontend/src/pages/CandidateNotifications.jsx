import React from 'react';

export default function CandidateNotifications() {
  return (
    <div className="page-header animate-fadeIn">
      <h1>Notifications</h1>
      <p>Important updates regarding your applications and interviews.</p>
      
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="card-title">Recent Alerts</h2>
        </div>
        <div className="p-4 text-muted text-sm">
          You have no new notifications.
        </div>
      </div>
    </div>
  );
}
