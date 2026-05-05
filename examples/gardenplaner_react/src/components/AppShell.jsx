import React from 'react';

export function AppShell({ header, stickyActions, children }) {
  return (
    <main className="app-shell">
      {header && <header className="app-shell-header">{header}</header>}
      {stickyActions && <div className="app-shell-sticky">{stickyActions}</div>}
      <div className="app-shell-content">{children}</div>
    </main>
  );
}
