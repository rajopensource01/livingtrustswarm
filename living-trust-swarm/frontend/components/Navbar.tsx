'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, FlaskConical, BookOpen } from 'lucide-react';

const NAV = [
  { href: '/',               label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/swarm-lab',      label: 'Swarm Lab',      icon: Brain           },
  { href: '/simulation-lab', label: 'Simulation Lab', icon: FlaskConical    },
  { href: '/feedback-logs',  label: 'Feedback Logs',  icon: BookOpen        },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="nav-brand">
        <div className="nav-logo">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1L12 10.5H1L6.5 1Z" fill="white" strokeWidth="0" />
          </svg>
        </div>
        <div>
          <p className="nav-brand-name">Living Trust</p>
          <p className="nav-brand-sub">Swarm Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-body">
        <p className="nav-section-label">Platform</p>

        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
            >
              <Icon
                className="nav-icon"
                style={{
                  width: 15,
                  height: 15,
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  strokeWidth: active ? 2.1 : 1.8,
                  flexShrink: 0,
                }}
              />
              <span>{label}</span>
              {active && <span className="nav-active-indicator" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="nav-footer">
        <div className="live-badge">
          <span className="live-dot" />
          System online
        </div>
      </div>
    </aside>
  );
}