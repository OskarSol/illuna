import React from 'react';

export function AppShell({ children }) {
  return (
    <main className="container">
      <h1>🌱 Gartenplaner (React)</h1>
      {children}
    </main>
  );
}
