import { useCallback, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

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

  ArrowUpRight,

  Eye,

  Menu,

  X,

  ChevronRight,

  Activity,

  TrendingUp,

  Mail,

  ShieldCheck,

  RefreshCw,

  CheckCircle2,

  XCircle,

  AlertCircle,

  Loader2,

  Newspaper,

  Sunrise,

  Sun,

  Sunset,

  MoonStar,

} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import { supabase } from '../../lib/supabase';

import Newsletter from '../components/Newsletter.jsx';

import './AdminDashboard.css';

// ==========================================

// API CONFIGURATION

// ==========================================

const API_URL = (

  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')

).replace(/\/+$/, '');

const GLOBE_EDGE_LAYERS = 12;

// ==========================================

// DASHBOARD NAVIGATION

// ==========================================

const navigation = [

  { label: 'Overview', icon: LayoutDashboard },

  { label: 'Website Content', icon: FileText },

  { label: 'Services', icon: BriefcaseBusiness },

  { label: 'Portfolio', icon: Image },

  { label: 'Team Members', icon: Users },

  { label: 'Messages', icon: Mail },

  { label: 'Newsletter', icon: Newspaper },

  { label: 'Settings', icon: Settings },

  { label: 'User Approvals', icon: ShieldCheck, ownerOnly: true },

];

// ==========================================

// QUICK ACCESS LINKS

// ==========================================

const quickLinks = [

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

  {

    label: 'Newsletter',

    description: 'Manage email subscribers',

    icon: Newspaper,

  },

];

// ==========================================

// HELPERS

// ==========================================

const getAccessToken = async () => {

  const {

    data: { session },

    error,

  } = await supabase.auth.getSession();

  if (error) throw error;

  if (!session?.access_token) {

    throw new Error('Your session has expired. Please sign in again.');

  }

  return session.access_token;

};

const formatDate = (date) => {

  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {

    return 'Date unavailable';

  }

  return parsedDate.toLocaleDateString(undefined, {

    day: 'numeric',

    month: 'short',

    year: 'numeric',

  });

};

// Greeting for the administrator's own local time of day.
//   05:00 - 11:59  Good morning
//   12:00 - 16:59  Good afternoon
//   17:00 - 20:59  Good evening
//   21:00 - 04:59  Working late
const getGreeting = (date) => {

  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      text: 'Good morning',
      icon: Sunrise,
      message:
        'A fresh start. Update your content, review messages and keep your website moving today.',
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      text: 'Good afternoon',
      icon: Sun,
      message:
        'Here is the latest across your website. Manage content, campaigns and enquiries from one place.',
    };
  }

  if (hour >= 17 && hour < 21) {
    return {
      text: 'Good evening',
      icon: Sunset,
      message:
        'Welcome back.',
    };
  }

  return {
    text: 'Working late',
    icon: MoonStar,
    message:
      'The night is quiet, but your website is still live. Review messages and manage content before tomorrow.',
  };

};

const formatClockDate = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const formatClockTime = (date) =>
  date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

// ==========================================

// MAIN DASHBOARD

// ==========================================

export default function AdminDashboard() {

  const { admin, user, logout, isOwner } = useAuth();

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('Overview');

  const [loggingOut, setLoggingOut] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [sessionLoading, setSessionLoading] = useState(true);

  // Registration approval state

  const [pendingUsers, setPendingUsers] = useState([]);

  const [approvalLoading, setApprovalLoading] = useState(false);

  const [approvalError, setApprovalError] = useState('');

  const [approvalSuccess, setApprovalSuccess] = useState('');

  const [processingUser, setProcessingUser] = useState(null);

  const [selectedRoles, setSelectedRoles] = useState({});

  // Live data used by the dashboard overview.
  const [dashboardStats, setDashboardStats] = useState({
    administrators: null,
    subscribers: null,
    campaigns: null,
    messages: null,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  // Keep the newsletter dashboard supplied with the current Supabase token.
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setAccessToken(session?.access_token || '');
          setSessionLoading(false);
        }
      } catch (error) {
        console.error('Unable to retrieve administrator session:', error);

        if (mounted) {
          setAccessToken('');
          setSessionLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAccessToken(session?.access_token || '');
        setSessionLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Live clock: re-renders on every new minute so the greeting switches
  // (e.g. morning -> afternoon) without reloading the page.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer;

    const msUntilNextMinute = () => 60000 - (Date.now() % 60000) + 50;

    const tick = () => {
      setNow(new Date());
      timer = setTimeout(tick, msUntilNextMinute());
    };

    // Browsers slow down timers in background tabs; catch up on return.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        tick();
      }
    };

    timer = setTimeout(tick, msUntilNextMinute());
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const greeting = getGreeting(now);
  const GreetingIcon = greeting.icon;

  const fullName =

    (admin?.full_name || user?.user_metadata?.full_name || '').trim() ||

    'Administrator';

  // "Jane Doe" -> "Jane"; extra spaces are ignored.
  const firstName = fullName.split(/\s+/)[0];

  // AuthContext only exposes approved administrators.
  const roleLabel = isOwner

    ? 'CMS Owner'

    : admin?.role || 'Administrator';

  // ==========================================
  // LOAD LIVE OVERVIEW DATA FROM SUPABASE
  // ==========================================

  const loadDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError('');

    const fetchCount = async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`Dashboard count failed for ${table}:`, error);
        return null;
      }

      return count ?? 0;
    };

    try {
      const [administrators, subscribers, campaigns, messages] =
        await Promise.all([
          fetchCount('admin_users'),
          fetchCount('newsletter_subscribers'),
          fetchCount('newsletter_campaigns'),
          fetchCount('contact_enquiries'),
        ]);

      setDashboardStats({
        administrators,
        subscribers,
        campaigns,
        messages,
      });

      const { data: enquiries, error: enquiriesError } = await supabase
        .from('contact_enquiries')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (enquiriesError) {
        console.error('Recent contact enquiries could not be loaded:', enquiriesError);
        setRecentActivities([]);
      } else {
        setRecentActivities(
          (enquiries || []).map((enquiry) => ({
            id: enquiry.id,
            title: 'New contact enquiry',
            description: `Received from ${enquiry.full_name || 'Website visitor'}`,
            time: formatDate(enquiry.created_at),
          }))
        );
      }

      if ([administrators, subscribers, campaigns, messages].every((value) => value === null)) {
        setDashboardError(
          'Dashboard data could not be loaded. Check your Supabase table permissions and Row Level Security policies.'
        );
      }
    } catch (error) {
      console.error('Dashboard data loading failed:', error);
      setDashboardError(error.message || 'Unable to load dashboard data.');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statistics = [
    {
      label: 'Administrators',
      value: dashboardStats.administrators,
      note: 'Registered CMS administrators',
      icon: Users,
    },
    {
      label: 'Newsletter Subscribers',
      value: dashboardStats.subscribers,
      note: 'Registered newsletter subscribers',
      icon: Mail,
    },
    {
      label: 'Newsletter Campaigns',
      value: dashboardStats.campaigns,
      note: 'Created newsletter campaigns',
      icon: Newspaper,
    },
    {
      label: 'Contact Messages',
      value: dashboardStats.messages,
      note: 'Website enquiries received',
      icon: Mail,
    },
  ];

  // ==========================================

  // CLOSE SIDEBAR WITH ESCAPE, LOCK PAGE SCROLL

  // ==========================================

  useEffect(() => {

    if (!sidebarOpen) return undefined;

    const handleKey = (event) => {

      if (event.key === 'Escape') setSidebarOpen(false);

    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKey);

    return () => {

      document.body.style.overflow = previousOverflow;

      window.removeEventListener('keydown', handleKey);

    };

  }, [sidebarOpen]);

  // ==========================================

  // LOAD PENDING REGISTRATION REQUESTS

  // ==========================================

  const loadPendingUsers = useCallback(async () => {

    if (!isOwner) {

      setPendingUsers([]);

      return;

    }

    setApprovalLoading(true);

    setApprovalError('');

    try {

      const accessToken = await getAccessToken();

      const response = await fetch(

        `${API_URL}/api/admin/pending`,

        {

          method: 'GET',

          headers: {

            Authorization: `Bearer ${accessToken}`,

            'Content-Type': 'application/json',

          },

        }

      );

      const result = await response.json();

      if (!response.ok || !result.success) {

        throw new Error(

          result.message ||

            'Unable to retrieve pending registrations.'

        );

      }

      setPendingUsers(result.administrators || []);

    } catch (error) {

      console.error(

        'Unable to load registration requests:',

        error

      );

      setApprovalError(

        error.message || 'Unable to load registration requests.'

      );

    } finally {

      setApprovalLoading(false);

    }

  }, [isOwner]);
  // ==========================================

  // APPROVE OR REJECT REGISTRATION

  // ==========================================

  const reviewRegistration = async (userId, decision) => {

    if (!isOwner || processingUser) return;

    const applicant = pendingUsers.find(

      (person) => person.id === userId

    );

    if (!applicant) return;

    const role = selectedRoles[userId] || 'admin';

    const confirmed = window.confirm(

      decision === 'approve'

        ? `Approve ${applicant.email} as ${role}?`

        : `Reject the registration request from ${applicant.email}?`

    );

    if (!confirmed) return;

    setProcessingUser(userId);

    setApprovalError('');

    setApprovalSuccess('');

    try {

      const accessToken = await getAccessToken();

      const endpoint =

        decision === 'approve'

          ? `${API_URL}/api/admin/${userId}/approve`

          : `${API_URL}/api/admin/${userId}/reject`;

      const response = await fetch(endpoint, {

        method: 'PATCH',

        headers: {

          Authorization: `Bearer ${accessToken}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify(

          decision === 'approve' ? { role } : {}

        ),

      });

      const result = await response.json();

      if (!response.ok || !result.success) {

        throw new Error(

          result.message ||

            'Unable to process this registration.'

        );

      }

      setApprovalSuccess(

        decision === 'approve'

          ? `${applicant.full_name || applicant.email} has been approved as ${role}.`

          : `${applicant.email} has been rejected.`

      );

      setSelectedRoles((previous) => {

        const updated = { ...previous };

        delete updated[userId];

        return updated;

      });

      await loadPendingUsers();

    } catch (error) {

      console.error('Registration review failed:', error);

      setApprovalError(

        error.message ||

          'Unable to process this registration.'

      );

    } finally {

      setProcessingUser(null);

    }

  };

  // ==========================================

  // LOGOUT

  // ==========================================

  const handleLogout = async () => {

    if (loggingOut) return;

    setLoggingOut(true);

    try {

      await logout();

    } catch (error) {

      console.error('Server sign-out failed:', error);

      try {

        await supabase.auth.signOut({ scope: 'local' });

      } catch (localError) {

        console.error('Local sign-out failed:', localError);

      }

    } finally {

      setSidebarOpen(false);

      setLoggingOut(false);

      navigate('/admin/login', { replace: true });

    }

  };

  // ==========================================

  // NAVIGATION

  // ==========================================

  const handleNavigation = (section) => {

    setActiveSection(section);

    setSidebarOpen(false);

    setApprovalError('');

    setApprovalSuccess('');

  };

  // ==========================================

  // LOAD OWNER APPROVALS WHEN SECTION OPENS

  // ==========================================

  useEffect(() => {

    if (activeSection === 'User Approvals' && isOwner) {

      loadPendingUsers();

    }

  }, [activeSection, isOwner, loadPendingUsers]);

  // ==========================================

  // USER APPROVALS VIEW

  // ==========================================

  const renderUserApprovals = () => (

    <section className="ag-dashboard-section">

      <div className="ag-dashboard-section-heading">

        <div>

          <span>ADMINISTRATION</span>

          <h3>Pending User Approvals</h3>

        </div>

        <button

          type="button"

          className="ag-dashboard-icon-button"

          onClick={loadPendingUsers}

          disabled={approvalLoading}

          aria-label="Refresh pending users"

          title="Refresh"

        >

          <RefreshCw

            size={17}

            className={

              approvalLoading ? 'ag-approval-spinning' : ''

            }

          />

        </button>

      </div>

      {approvalError && (

        <div className="ag-approval-alert ag-approval-alert-error">

          <AlertCircle size={18} />

          <span>{approvalError}</span>

        </div>

      )}

      {approvalSuccess && (

        <div className="ag-approval-alert ag-approval-alert-success">

          <CheckCircle2 size={18} />

          <span>{approvalSuccess}</span>

        </div>

      )}

      {approvalLoading ? (

        <div className="ag-dashboard-panel ag-approval-state">

          <Loader2

            size={26}

            className="ag-approval-spinning"

          />

          <p>Loading registration requests...</p>

        </div>

      ) : pendingUsers.length === 0 ? (

        <div className="ag-dashboard-panel ag-approval-state">

          <CheckCircle2 size={30} />

          <h3>No pending registrations</h3>

          <p>

            There are currently no users waiting for approval.

          </p>

        </div>

      ) : (

        <div className="ag-dashboard-panel ag-approval-list">

          {pendingUsers.map((person) => (

            <article

              className="ag-approval-card"

              key={person.id}

            >

              <div className="ag-approval-person">

                <div className="ag-approval-avatar">

                  {(person.full_name || person.email || 'U')

                    .charAt(0)

                    .toUpperCase()}

                </div>

                <div className="ag-approval-person-info">

                  <strong>

                    {person.full_name || 'Name not provided'}

                  </strong>

                  <span>{person.email}</span>

                  <small>

                    Registered: {formatDate(person.created_at)}

                  </small>

                </div>

              </div>

              <div className="ag-approval-actions">

                <label className="ag-approval-role">

                  <span>Assign role</span>

                  <select

                    value={selectedRoles[person.id] || 'admin'}

                    onChange={(event) =>

                      setSelectedRoles((previous) => ({

                        ...previous,

                        [person.id]: event.target.value,

                      }))

                    }

                    disabled={processingUser === person.id}

                  >

                    <option value="admin">Admin</option>

                    <option value="editor">Editor</option>

                  </select>

                </label>

                <button

                  type="button"

                  className="ag-approval-button ag-approval-approve"

                  onClick={() =>

                    reviewRegistration(person.id, 'approve')

                  }

                  disabled={Boolean(processingUser)}

                >

                  {processingUser === person.id ? (

                    <Loader2

                      size={16}

                      className="ag-approval-spinning"

                    />

                  ) : (

                    <CheckCircle2 size={16} />

                  )}

                  Approve

                </button>

                <button

                  type="button"

                  className="ag-approval-button ag-approval-reject"

                  onClick={() =>

                    reviewRegistration(person.id, 'reject')

                  }

                  disabled={Boolean(processingUser)}

                >

                  <XCircle size={16} />

                  Reject

                </button>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>

  );

  // ==========================================

  // SIDEBAR NAVIGATION

  // ==========================================

  const visibleNavigation = navigation.filter(

    (item) => !item.ownerOnly || isOwner

  );
  return (

    <div className="ag-dashboard">

      {sidebarOpen && (

        <button

          type="button"

          className="ag-dashboard-overlay"

          onClick={() => setSidebarOpen(false)}

          aria-label="Close navigation"

        />

      )}

      {/* SIDEBAR */}

      <aside

        id="ag-dashboard-sidebar"

        className={`ag-dashboard-sidebar ${

          sidebarOpen ? 'is-open' : ''

        }`}

      >

        <div className="ag-dashboard-brand">

          <div className="ag-dashboard-brand-mark">A</div>

          <div>

            <h2>ALKEBULAN</h2>

            <span>GLOBAL LLC</span>

          </div>

          <button

            type="button"

            className="ag-dashboard-close"

            onClick={() => setSidebarOpen(false)}

            aria-label="Close sidebar"

          >

            <X size={20} />

          </button>

        </div>

        <div className="ag-dashboard-menu-label">

          WORKSPACE

        </div>

        <nav className="ag-dashboard-navigation">

          {visibleNavigation.map((item) => {

            const Icon = item.icon;

            const isActive = activeSection === item.label;

            return (

              <button

                type="button"

                key={item.label}

                className={`ag-dashboard-nav-item ${

                  isActive ? 'active' : ''

                }`}

                onClick={() => handleNavigation(item.label)}

              >

                <Icon size={18} />

                <span>{item.label}</span>

                {isActive && <ChevronRight size={16} />}

                {item.label === 'User Approvals' &&

                  pendingUsers.length > 0 && (

                    <i className="ag-dashboard-nav-count">

                      {pendingUsers.length}

                    </i>

                  )}

              </button>

            );

          })}

        </nav>

        <div className="ag-dashboard-sidebar-bottom">

          <div className="ag-dashboard-sidebar-note">

            <Globe size={20} />

            <div>

              <strong>Website status</strong>

              <span>

                <i className="ag-dashboard-live-dot" />

                Live and published

              </span>

            </div>

          </div>

          <div className="ag-dashboard-sidebar-profile">

            <div className="ag-dashboard-avatar">

              {fullName.charAt(0).toUpperCase()}

            </div>

            <div>

              <strong>{fullName}</strong>

              <span>{roleLabel}</span>

            </div>

          </div>

          <button

            type="button"

            className="ag-dashboard-logout"

            onClick={handleLogout}

            disabled={loggingOut}

          >

            {loggingOut ? (

              <Loader2

                size={18}

                className="ag-approval-spinning"

              />

            ) : (

              <LogOut size={18} />

            )}

            <span>

              {loggingOut ? 'Signing out...' : 'Sign out'}

            </span>

          </button>

          <div className="ag-dashboard-sidebar-footer">

            ALKEBULAN GLOBAL LLC

            <span>Content Management System</span>

          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="ag-dashboard-main">

        {/* TOPBAR */}

        <header className="ag-dashboard-topbar">

          <div className="ag-dashboard-topbar-left">

            <button

              type="button"

              className="ag-dashboard-menu-button"

              onClick={() => setSidebarOpen(true)}

              aria-label="Open navigation"

              aria-controls="ag-dashboard-sidebar"

              aria-expanded={sidebarOpen}

            >

              <Menu size={22} />

            </button>

            <div className="ag-dashboard-heading">

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

              type="button"

              className="ag-dashboard-icon-button"

              aria-label="Notifications"

            >

              <Bell size={19} />

              {pendingUsers.length > 0 && (

                <i className="ag-dashboard-notification-dot" />

              )}

            </button>

            <div className="ag-dashboard-user">

              <div className="ag-dashboard-avatar">

                {fullName.charAt(0).toUpperCase()}

              </div>

              <div className="ag-dashboard-user-info">

                <strong>{fullName}</strong>

                <span>{roleLabel}</span>

              </div>

            </div>

            <button

              type="button"

              className="ag-dashboard-icon-button ag-dashboard-topbar-logout"

              onClick={handleLogout}

              disabled={loggingOut}

              aria-label="Sign out"

              title="Sign out"

            >

              {loggingOut ? (

                <Loader2

                  size={18}

                  className="ag-approval-spinning"

                />

              ) : (

                <LogOut size={18} />

              )}

            </button>

          </div>

        </header>

        {/* DASHBOARD BODY */}

        <div className="ag-dashboard-content">

          {/* WELCOME SECTION */}

          <section className="ag-dashboard-welcome">

            <div className="ag-dashboard-welcome-text">

              <div className="ag-dashboard-welcome-meta">

                <span className="ag-dashboard-eyebrow">

                  ALKEBULAN GLOBAL CMS

                </span>

                <span className="ag-dashboard-clock">

                  <GreetingIcon size={14} aria-hidden="true" />

                  <time dateTime={now.toISOString()}>

                    {formatClockDate(now)}

                    <i aria-hidden="true">·</i>

                    {formatClockTime(now)}

                  </time>

                </span>

              </div>

              <h2>

                {greeting.text}, {firstName}.

              </h2>

              <p>{greeting.message}</p>

              <div className="ag-dashboard-welcome-actions">

                <button

                  type="button"

                  className="ag-dashboard-welcome-primary"

                  onClick={() =>

                    handleNavigation('Website Content')

                  }

                >

                  Edit website content

                  <ArrowUpRight size={15} />

                </button>

                <a

                  href="/"

                  target="_blank"

                  rel="noreferrer"

                  className="ag-dashboard-welcome-secondary"

                >

                  View live site

                </a>

              </div>

            </div>

            <div

              className="ag-dashboard-welcome-emblem"

              aria-hidden="true"

            >

              <span className="ag-globe-glow" />

              <span className="ag-globe-orbit ag-globe-orbit--outer">

                <span className="ag-globe-orbit-dot" />

              </span>

              <span className="ag-globe-orbit ag-globe-orbit--inner">

                <span className="ag-globe-orbit-dot" />

              </span>

              <div className="ag-globe-coin-wrap">

                <div className="ag-globe-coin">

                  {Array.from(

                    { length: GLOBE_EDGE_LAYERS },

                    (_, i) => (

                      <span

                        key={i}

                        className="ag-globe-coin-edge"

                        style={{ '--layer': i }}

                      />

                    )

                  )}

                  <div className="ag-globe-coin-face ag-globe-coin-face--front">

                    <img

                      src="/images/alkebulan-emblem.jpg"

                      alt=""

                      width="160"

                      height="160"

                    />

                  </div>

                  <div className="ag-globe-coin-face ag-globe-coin-face--back">

                    <img

                      src="/images/alkebulan-emblem.jpg"

                      alt=""

                      width="160"

                      height="160"

                    />

                  </div>

                </div>

              </div>

              <span className="ag-dashboard-welcome-badge">

                <Activity size={15} />

              </span>

            </div>

          </section>

          {/* SECTION CONTENT */}

          {activeSection === 'User Approvals' && isOwner ? (

            renderUserApprovals()

           ) : activeSection === 'Newsletter' ? (
            sessionLoading ? (
              <div className="ag-dashboard-panel">
                <p>Loading administrator session...</p>
              </div>
            ) : accessToken ? (
              <Newsletter accessToken={accessToken} />
            ) : (
              <div className="ag-dashboard-panel">
                <h3>Administrator session unavailable</h3>
                <p>
                  Your session could not be retrieved. Please sign out and
                  sign in again before accessing newsletter management.
                </p>
              </div>
            )
          ) : activeSection === 'Overview' ? (

            <>

              {/* PERFORMANCE SNAPSHOT */}

              <section className="ag-dashboard-section">

                <div className="ag-dashboard-section-heading">

                  <div>

                    <span>PERFORMANCE SNAPSHOT</span>

                    <h3>Website Overview</h3>

                  </div>

                  <div className="ag-dashboard-updated">
                    <button
                      type="button"
                      className="ag-dashboard-icon-button"
                      onClick={loadDashboardData}
                      disabled={dashboardLoading}
                      aria-label="Refresh dashboard data"
                      title="Refresh dashboard data"
                    >
                      <RefreshCw size={15} className={dashboardLoading ? 'ag-approval-spinning' : ''} />
                    </button>
                    <TrendingUp size={15} />
                    Live database data
                  </div>

                </div>

                {dashboardError && (
                  <div className="ag-approval-alert ag-approval-alert-error" role="alert">
                    <AlertCircle size={18} />
                    <span>{dashboardError}</span>
                  </div>
                )}
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

                        <strong>
                          {dashboardLoading
                            ? '…'
                            : stat.value === null
                              ? '—'
                              : stat.value.toLocaleString()}
                        </strong>

                        <h4>{stat.label}</h4>

                        <p>{stat.note}</p>

                      </article>

                    );

                  })}

                </div>

              </section>

              {/* LOWER DASHBOARD GRID */}

              <section className="ag-dashboard-lower-grid">

                {/* QUICK ACCESS */}

                <div className="ag-dashboard-panel">

                  <div className="ag-dashboard-panel-heading">

                    <div>

                      <span>QUICK ACCESS</span>

                      <h3>Manage Your Website</h3>

                    </div>

                  </div>

                  <div className="ag-dashboard-quick-links">

                    {quickLinks.map((item) => {

                      const Icon = item.icon;

                      return (

                        <button

                          type="button"

                          key={item.label}

                          className="ag-dashboard-quick-link"

                          onClick={() =>

                            handleNavigation(item.label)

                          }

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

                {/* RECENT ACTIVITY */}

                <div className="ag-dashboard-panel">

                  <div className="ag-dashboard-panel-heading">

                    <div>

                      <span>WORKSPACE ACTIVITY</span>

                      <h3>Recent Activity</h3>

                    </div>

                  </div>

                  <div className="ag-dashboard-activities">
                    {dashboardLoading ? (
                      <p>Loading recent activity...</p>
                    ) : recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div
                          className="ag-dashboard-activity"
                          key={activity.id}
                        >
                          <div className="ag-dashboard-activity-dot" />
                          <div>
                            <strong>{activity.title}</strong>
                            <p>{activity.description}</p>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No recent contact enquiries found.</p>
                    )}
                  </div>

                </div>

              </section>

            </>

          ) : (

            /* OTHER CMS MODULES */

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

                type="button"

                onClick={() => handleNavigation('Overview')}

                className="ag-dashboard-back-button"

              >

                Return to Overview

              </button>

            </section>

          )}

          {/* FOOTER */}

          <footer className="ag-dashboard-footer">

            <span>

              © {new Date().getFullYear()} Alkebulan Global LLC.

            </span>

            <span>

              Strategic Commerce &amp; Development

            </span>

          </footer>

        </div>

      </main>

    </div>

  );

}