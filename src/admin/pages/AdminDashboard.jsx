
import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Image,
  BriefcaseBusiness,
  Users,
  Settings,
  Globe,
  LogOut,
  Bell,
  Search,
  ArrowUpRight,
  Eye,
  Pencil,
  Plus,
  Menu,
  X,
  ChevronRight,
  Activity,
  TrendingUp,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Website Content', icon: FileText },
  { label: 'Services', icon: BriefcaseBusiness },
  { label: 'Portfolio', icon: Image },
  { label: 'Team Members', icon: Users },
  { label: 'Messages', icon: Mail },
  { label: 'Settings', icon: Settings },
];

const statistics = [
  {
    label: 'Website Pages',
    value: '12',
    note: 'Content sections',
    icon: FileText,
  },
  {
    label: 'Portfolio Projects',
    value: '08',
    note: 'Published projects',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Team Members',
    value: '06',
    note: 'Active profiles',
    icon: Users,
  },
  {
    label: 'Contact Messages',
    value: '24',
    note: 'Enquiries received',
    icon: Mail,
  },
];

const activities = [
  {
    title: 'CMS dashboard initialized',
    description: 'Your administration workspace is ready.',
    time: 'Just now',
  },
  {
    title: 'Website content',
    description: 'Manage your public website information.',
    time: 'Workspace',
  },
  {
    title: 'Portfolio management',
    description: 'Review and update your projects.',
    time: 'Workspace',
  },
];

export default function AdminDashboard() {
  const { admin, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('Overview');

  const fullName =
    admin?.full_name ||
    user?.user_metadata?.full_name ||
    'Administrator';

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (label) => {
    setActiveSection(label);
    setSidebarOpen(false);
  };

  return (
    <div className="ag-dashboard">
      {sidebarOpen && (
        <button
          className="ag-dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`ag-dashboard-sidebar ${
          sidebarOpen ? 'ag-dashboard-sidebar--open' : ''
        }`}
      >
        <div className="ag-dashboard-brand">
          <div className="ag-dashboard-brand-mark">A</div>
          <div>
            <h2>ALKEBULAN</h2>
            <span>GLOBAL LLC</span>
          </div>
          <button
            className="ag-dashboard-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="ag-dashboard-menu-label">
          WORKSPACE
        </div>

        <nav className="ag-dashboard-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.label;

            return (
              <button
                key={item.label}
                className={`ag-dashboard-nav-item ${
                  active ? 'active' : ''
                }`}
                onClick={() => handleNavigation(item.label)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight size={15} />}
              </button>
            );
          })}
        </nav>

        <div className="ag-dashboard-sidebar-bottom">
          <div className="ag-dashboard-sidebar-note">
            <Globe size={20} />
            <div>
              <strong>Website status</strong>
              <span>Administration workspace</span>
            </div>
          </div>

          <button
            className="ag-dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>

          <div className="ag-dashboard-sidebar-footer">
            ALKEBULAN GLOBAL LLC
            <span>Content Management System</span>
          </div>
        </div>
      </aside>

      <main className="ag-dashboard-main">
        <header className="ag-dashboard-topbar">
          <div className="ag-dashboard-topbar-left">
            <button
              className="ag-dashboard-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="ag-dashboard-breadcrumb">
                ADMINISTRATION / {activeSection.toUpperCase()}
              </span>
              <h1>{activeSection}</h1>
            </div>
          </div>

          <div className="ag-dashboard-topbar-right">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="ag-dashboard-view-site"
            >
              <Eye size={16} />
              <span>View Website</span>
              <ArrowUpRight size={15} />
            </a>

            <button
              className="ag-dashboard-notification"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <div className="ag-dashboard-user">
              <div className="ag-dashboard-avatar">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="ag-dashboard-user-info">
                <strong>{fullName}</strong>
                <span>{admin?.role || 'Administrator'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="ag-dashboard-content">
          <section className="ag-dashboard-welcome">
            <div>
              <span className="ag-dashboard-eyebrow">
                ALKEBULAN GLOBAL CMS
              </span>
              <h2>Welcome back, {fullName.split(' ')[0]}.</h2>
              <p>
                Manage your website, update your content and oversee
                your digital presence from one place.
              </p>
            </div>

            <div className="ag-dashboard-welcome-icon">
              <Activity size={35} />
            </div>
          </section>

          {activeSection === 'Overview' ? (
            <>
              <section className="ag-dashboard-section">
                <div className="ag-dashboard-section-heading">
                  <div>
                    <span>PERFORMANCE SNAPSHOT</span>
                    <h3>Website Overview</h3>
                  </div>
                  <span className="ag-dashboard-updated">
                    <TrendingUp size={15} />
                    CMS workspace
                  </span>
                </div>

                <div className="ag-dashboard-stat-grid">
                  {statistics.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <article
                        className="ag-dashboard-stat-card"
                        key={stat.label}
                      >
                        <div className="ag-dashboard-stat-top">
                          <div className="ag-dashboard-stat-icon">
                            <Icon size={20} />
                          </div>
                          <ArrowUpRight size={17} />
                        </div>

                        <strong>{stat.value}</strong>
                        <h4>{stat.label}</h4>
                        <p>{stat.note}</p>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="ag-dashboard-lower-grid">
                <div className="ag-dashboard-panel">
                  <div className="ag-dashboard-panel-heading">
                    <div>
                      <span>QUICK ACCESS</span>
                      <h3>Manage Your Website</h3>
                    </div>
                  </div>

                  <div className="ag-dashboard-quick-links">
                    {[
                      {
                        label: 'Website Content',
                        description: 'Edit homepage and website information',
                        icon: FileText,
                      },
                      {
                        label: 'Services',
                        description: 'Manage your service offerings',
                        icon: BriefcaseBusiness,
                      },
                      {
                        label: 'Portfolio',
                        description: 'Update projects and case studies',
                        icon: Image,
                      },
                      {
                        label: 'Team Members',
                        description: 'Manage team profiles',
                        icon: Users,
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          className="ag-dashboard-quick-link"
                          onClick={() => handleNavigation(item.label)}
                        >
                          <div className="ag-dashboard-quick-icon">
                            <Icon size={19} />
                          </div>
                          <div>
                            <strong>{item.label}</strong>
                            <span>{item.description}</span>
                          </div>
                          <ChevronRight size={17} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="ag-dashboard-panel">
                  <div className="ag-dashboard-panel-heading">
                    <div>
                      <span>WORKSPACE ACTIVITY</span>
                      <h3>Recent Activity</h3>
                    </div>
                  </div>

                  <div className="ag-dashboard-activities">
                    {activities.map((activity, index) => (
                      <div
                        className="ag-dashboard-activity"
                        key={index}
                      >
                        <div className="ag-dashboard-activity-dot" />
                        <div>
                          <strong>{activity.title}</strong>
                          <p>{activity.description}</p>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="ag-dashboard-panel ag-dashboard-placeholder">
              <div className="ag-dashboard-placeholder-icon">
                <Settings size={30} />
              </div>
              <span>CMS MODULE</span>
              <h3>{activeSection}</h3>
              <p>
                This section is ready for its content management
                functionality. It has not yet been connected to the
                database.
              </p>
              <button
                onClick={() => setActiveSection('Overview')}
                className="ag-dashboard-back-button"
              >
                Return to Overview
              </button>
            </section>
          )}

          <footer className="ag-dashboard-footer">
            <span>© {new Date().getFullYear()} Alkebulan Global LLC.</span>
            <span>Strategic Commerce & Development</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
