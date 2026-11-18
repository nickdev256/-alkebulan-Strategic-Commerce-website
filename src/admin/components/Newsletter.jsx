import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Mail,
  Users,
  Send,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Edit,
  Eye,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  Ban,
} from 'lucide-react';

import './Newsletter.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_URL = `${API_BASE_URL}/api/newsletter`;

// While a campaign is sending, refresh progress this often.
const SENDING_POLL_MS = 10000;
// Must match STALE_SENDING_MS in newsletterController.js.
const STALE_SENDING_MS = 10 * 60 * 1000;

const SENDABLE_STATUSES = ['subscribed', 'active'];

const initialForm = {
  name: '',
  subject: '',
  preview_text: '',
  content: '',
  images: [],
  sections: [],
};

const formatDate = (date) => {
  if (!date) return 'Not available';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toLocaleString();
};

const formatStatus = (status) =>
  String(status || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusClass = (status) => {
  switch (status) {
    case 'subscribed':
    case 'active':
    case 'sent':
      return 'success';
    case 'sending':
      return 'sending';
    case 'failed':
    case 'unsubscribed':
      return 'danger';
    case 'draft':
    case 'pending':
      return 'pending';
    default:
      return 'neutral';
  }
};

const isStaleSending = (campaign) =>
  campaign.status === 'sending' &&
  (!campaign.updated_at ||
    Date.now() - new Date(campaign.updated_at).getTime() > STALE_SENDING_MS);

const canResume = (campaign) =>
  Boolean(campaign.is_published) &&
  (campaign.status === 'failed' || isStaleSending(campaign));

const canDelete = (campaign) =>
  campaign.status !== 'sending' || isStaleSending(campaign);

const imageSrc = (image) =>
  typeof image === 'string'
    ? image
    : image?.url || image?.src || image?.publicUrl || '';

export default function Newsletter({ accessToken }) {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [form, setForm] = useState(initialForm);

  const successTimer = useRef(null);

  // ========================================
  // API REQUEST HELPER
  // ========================================

  const apiRequest = useCallback(
    async (path, options = {}) => {
      if (!accessToken) {
        throw new Error('Administrator session missing. Please sign in again.');
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || `Request failed (${response.status})`);
      }

      return result;
    },
    [accessToken]
  );

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  const loadDashboard = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        setError('');

        const [subscriberResult, campaignResult] = await Promise.all([
          apiRequest('/admin/subscribers'),
          apiRequest('/admin/campaigns'),
        ]);

        setSubscribers(
          Array.isArray(subscriberResult.subscribers)
            ? subscriberResult.subscribers
            : []
        );
        setCampaigns(
          Array.isArray(campaignResult.campaigns) ? campaignResult.campaigns : []
        );
      } catch (err) {
        console.error('Newsletter dashboard error:', err);
        setError(err.message);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [apiRequest]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Refresh automatically only while a campaign is being sent.
  const hasSendingCampaign = campaigns.some(
    (campaign) => campaign.status === 'sending'
  );

  useEffect(() => {
    if (!hasSendingCampaign) return undefined;

    const interval = setInterval(() => loadDashboard(false), SENDING_POLL_MS);
    return () => clearInterval(interval);
  }, [hasSendingCampaign, loadDashboard]);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  // ========================================
  // NOTIFICATIONS
  // ========================================

  const notifySuccess = (message) => {
    setSuccess(message);
    setError('');
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(''), 5000);
  };

  const notifyError = (message) => {
    setError(message);
    setSuccess('');
  };

  // ========================================
  // FORM HANDLING
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowEditor(true);
  };

  const openEditEditor = (campaign) => {
    if (campaign.status !== 'draft') {
      notifyError('Only draft campaigns can be edited.');
      return;
    }

    setEditingId(campaign.id);
    setForm({
      name: campaign.name || '',
      subject: campaign.subject || '',
      preview_text: campaign.preview_text || '',
      content: campaign.content || '',
      images: Array.isArray(campaign.images) ? campaign.images : [],
      sections: Array.isArray(campaign.sections) ? campaign.sections : [],
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setShowEditor(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // ========================================
  // CREATE / UPDATE CAMPAIGN
  // ========================================

  const saveCampaign = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      notifyError('Campaign name is required.');
      return;
    }

    if (!form.subject.trim()) {
      notifyError('Email subject is required.');
      return;
    }

    if (!form.content.trim() && !form.sections.length && !form.images.length) {
      notifyError('Add some campaign content before saving.');
      return;
    }

    try {
      setSaving(true);

      const path = editingId ? `/admin/campaigns/${editingId}` : '/admin/campaigns';

      const result = await apiRequest(path, {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      });

      notifySuccess(
        editingId ? 'Campaign updated successfully.' : 'Campaign created successfully.'
      );

      setShowEditor(false);
      setEditingId(null);
      setForm(initialForm);

      if (result.campaign) setSelectedCampaign(result.campaign);

      await loadDashboard(false);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // CAMPAIGN ACTIONS
  // ========================================

  const runCampaignAction = async (campaign, action, path, fallbackMessage) => {
    try {
      setActionLoading(`${action}-${campaign.id}`);

      const result = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      notifySuccess(result.message || fallbackMessage);
      await loadDashboard(false);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const sendTestEmail = (campaign) =>
    runCampaignAction(
      campaign,
      'test',
      `/admin/campaigns/${campaign.id}/test`,
      'Test email sent successfully.'
    );

  const publishCampaign = (campaign) => {
    const confirmed = window.confirm(
      `Publish "${campaign.name}" and send it to all active subscribers? This action cannot be undone.`
    );
    if (!confirmed) return;

    runCampaignAction(
      campaign,
      'publish',
      `/admin/campaigns/${campaign.id}/publish`,
      'Newsletter publishing has started.'
    );
  };

  const resumeCampaign = (campaign) => {
    const confirmed = window.confirm(
      `Resume sending "${campaign.name}"? Subscribers who already received it will be skipped.`
    );
    if (!confirmed) return;

    runCampaignAction(
      campaign,
      'resume',
      `/admin/campaigns/${campaign.id}/resume`,
      'Newsletter delivery has resumed.'
    );
  };

  const deleteCampaign = async (campaign) => {
    const confirmed = window.confirm(
      `Permanently delete "${campaign.name}"? This also removes its campaign delivery history. This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(`delete-${campaign.id}`);

      await apiRequest(`/admin/campaigns/${campaign.id}`, { method: 'DELETE' });

      notifySuccess('Campaign deleted successfully.');

      if (selectedCampaign?.id === campaign.id) {
        setSelectedCampaign(null);
        setShowPreview(false);
      }

      await loadDashboard(false);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  // ========================================
  // ADMIN UNSUBSCRIBE
  // ========================================

  const unsubscribeUser = async (subscriber) => {
    const confirmed = window.confirm(`Unsubscribe ${subscriber.email}?`);
    if (!confirmed) return;

    try {
      setActionLoading(`unsubscribe-${subscriber.id}`);

      await apiRequest(`/admin/subscribers/${subscriber.id}/unsubscribe`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      notifySuccess('Subscriber successfully unsubscribed.');
      await loadDashboard(false);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  // ========================================
  // PREVIEW CAMPAIGN
  // ========================================

  const previewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setShowPreview(true);
  };

  // ========================================
  // FILTERING & STATISTICS
  // ========================================

  const query = search.trim().toLowerCase();

  const filteredSubscribers = subscribers.filter((subscriber) =>
    String(subscriber.email || '').toLowerCase().includes(query)
  );

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      String(campaign.name || '').toLowerCase().includes(query) ||
      String(campaign.subject || '').toLowerCase().includes(query)
  );

  const activeSubscribers = subscribers.filter((subscriber) =>
    SENDABLE_STATUSES.includes(subscriber.status)
  ).length;

  const unsubscribedCount = subscribers.filter(
    (subscriber) => subscriber.status === 'unsubscribed'
  ).length;

  const sentCampaigns = campaigns.filter((campaign) => campaign.status === 'sent').length;
  const draftCampaigns = campaigns.filter((campaign) => campaign.status === 'draft').length;

  const isBusy = (key) => actionLoading === key;

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="newsletter-dashboard">
        <p>
          <Loader2 size={18} className="spin" /> Loading newsletter dashboard...
        </p>
      </div>
    );
  }

  // ========================================
  // MAIN DASHBOARD
  // ========================================

  return (
    <div className="newsletter-dashboard">
      {/* HEADER */}
      <div className="newsletter-header">
        <div>
          <span className="newsletter-eyebrow">COMMUNICATION MANAGEMENT</span>
          <h1>Newsletter Management</h1>
          <p>Manage subscribers, create campaigns and communicate with your community.</p>
        </div>

        <div className="newsletter-header-actions">
          <button
            type="button"
            className="newsletter-secondary-btn"
            onClick={() => loadDashboard()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="newsletter-primary-btn"
            onClick={openCreateEditor}
          >
            <Plus size={17} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="newsletter-alert error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="newsletter-alert success" role="status">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} aria-label="Dismiss success">
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="newsletter-stats-grid">
        <div className="newsletter-stat-card">
          <div className="newsletter-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <span>Total Subscribers</span>
            <h2>{subscribers.length}</h2>
          </div>
        </div>

        <div className="newsletter-stat-card">
          <div className="newsletter-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>Active Subscribers</span>
            <h2>{activeSubscribers}</h2>
          </div>
        </div>

        <div className="newsletter-stat-card">
          <div className="newsletter-stat-icon orange">
            <Ban size={22} />
          </div>
          <div>
            <span>Unsubscribed</span>
            <h2>{unsubscribedCount}</h2>
          </div>
        </div>

        <div className="newsletter-stat-card">
          <div className="newsletter-stat-icon purple">
            <Send size={22} />
          </div>
          <div>
            <span>Campaigns Sent</span>
            <h2>{sentCampaigns}</h2>
          </div>
        </div>

        <div className="newsletter-stat-card">
          <div className="newsletter-stat-icon yellow">
            <FileText size={22} />
          </div>
          <div>
            <span>Draft Campaigns</span>
            <h2>{draftCampaigns}</h2>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="newsletter-tabs">
        <button
          type="button"
          className={activeTab === 'campaigns' ? 'active' : ''}
          onClick={() => {
            setActiveTab('campaigns');
            setSearch('');
          }}
        >
          <Mail size={17} />
          Campaigns ({campaigns.length})
        </button>

        <button
          type="button"
          className={activeTab === 'subscribers' ? 'active' : ''}
          onClick={() => {
            setActiveTab('subscribers');
            setSearch('');
          }}
        >
          <Users size={17} />
          Subscribers ({subscribers.length})
        </button>
      </div>

      {/* SEARCH */}
      <div className="newsletter-toolbar">
        <div className="newsletter-search">
          <Search size={18} />
          <input
            type="search"
            placeholder={
              activeTab === 'campaigns'
                ? 'Search campaigns...'
                : 'Search subscribers by email...'
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="newsletter-result-count">
          {activeTab === 'campaigns' ? filteredCampaigns.length : filteredSubscribers.length}{' '}
          results
        </span>
      </div>

      {/* CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="newsletter-table-wrapper">
          <table className="newsletter-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Sent</th>
                <th>Failed</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="newsletter-empty">
                    <Mail size={30} />
                    <strong>No campaigns found</strong>
                    <span>Create your first newsletter campaign.</span>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <strong>{campaign.name}</strong>
                    </td>
                    <td>{campaign.subject}</td>
                    <td>
                      <span className={`newsletter-status ${getStatusClass(campaign.status)}`}>
                        {formatStatus(campaign.status)}
                      </span>
                      {campaign.last_error && campaign.status !== 'draft' && (
                        <small className="newsletter-error-hint" title={campaign.last_error}>
                          {' '}
                          <AlertCircle size={13} />
                        </small>
                      )}
                    </td>
                    <td>{campaign.recipient_count ?? 0}</td>
                    <td>{campaign.sent_count ?? 0}</td>
                    <td>{campaign.failed_count ?? 0}</td>
                    <td>{formatDate(campaign.created_at)}</td>
                    <td>
                      <div className="newsletter-actions">
                        <button
                          type="button"
                          title="Preview"
                          aria-label="Preview"
                          onClick={() => previewCampaign(campaign)}
                        >
                          <Eye size={16} />
                        </button>

                        {campaign.status === 'draft' && (
                          <>
                            <button
                              type="button"
                              title="Edit"
                              aria-label="Edit"
                              onClick={() => openEditEditor(campaign)}
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              title="Send test email"
                              aria-label="Send test email"
                              disabled={Boolean(actionLoading)}
                              onClick={() => sendTestEmail(campaign)}
                            >
                              {isBusy(`test-${campaign.id}`) ? (
                                <Loader2 size={16} className="spin" />
                              ) : (
                                <Mail size={16} />
                              )}
                            </button>

                            <button
                              type="button"
                              title="Publish campaign"
                              aria-label="Publish campaign"
                              disabled={Boolean(actionLoading)}
                              onClick={() => publishCampaign(campaign)}
                            >
                              {isBusy(`publish-${campaign.id}`) ? (
                                <Loader2 size={16} className="spin" />
                              ) : (
                                <Send size={16} />
                              )}
                            </button>
                          </>
                        )}

                        {canResume(campaign) && (
                          <button
                            type="button"
                            title="Resume sending"
                            aria-label="Resume sending"
                            disabled={Boolean(actionLoading)}
                            onClick={() => resumeCampaign(campaign)}
                          >
                            {isBusy(`resume-${campaign.id}`) ? (
                              <Loader2 size={16} className="spin" />
                            ) : (
                              <RotateCcw size={16} />
                            )}
                          </button>
                        )}

                        {canDelete(campaign) && (
                          <button
                            type="button"
                            title="Delete campaign"
                            aria-label="Delete campaign"
                            className="delete"
                            disabled={Boolean(actionLoading)}
                            onClick={() => deleteCampaign(campaign)}
                          >
                            {isBusy(`delete-${campaign.id}`) ? (
                              <Loader2 size={16} className="spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div className="newsletter-table-wrapper">
          <table className="newsletter-table">
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Status</th>
                <th>Subscribed</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="newsletter-empty">
                    <Users size={30} />
                    <strong>No subscribers found</strong>
                    <span>Subscribers will appear here when they sign up.</span>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>
                      <strong>{subscriber.email}</strong>
                    </td>
                    <td>
                      <span className={`newsletter-status ${getStatusClass(subscriber.status)}`}>
                        {formatStatus(subscriber.status)}
                      </span>
                    </td>
                    <td>{formatDate(subscriber.created_at)}</td>
                    <td>
                      {SENDABLE_STATUSES.includes(subscriber.status) && (
                        <button
                          type="button"
                          className="newsletter-unsubscribe-btn"
                          disabled={isBusy(`unsubscribe-${subscriber.id}`)}
                          onClick={() => unsubscribeUser(subscriber)}
                        >
                          {isBusy(`unsubscribe-${subscriber.id}`) ? (
                            <Loader2 size={15} className="spin" />
                          ) : (
                            <Ban size={15} />
                          )}
                          Unsubscribe
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CAMPAIGN EDITOR */}
      {showEditor && (
        <div className="newsletter-modal-overlay">
          <div
            className="newsletter-modal newsletter-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-editor-title"
          >
            <div className="newsletter-modal-header">
              <div>
                <h2 id="newsletter-editor-title">
                  {editingId ? 'Edit Campaign' : 'Create Newsletter Campaign'}
                </h2>
                <p>Prepare your newsletter for your subscribers.</p>
              </div>

              <button type="button" onClick={closeEditor} aria-label="Close editor">
                <X size={21} />
              </button>
            </div>

            <form onSubmit={saveCampaign}>
              <div className="newsletter-form-group">
                <label htmlFor="campaign-name">Campaign Name</label>
                <input
                  id="campaign-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. November Newsletter"
                  required
                />
              </div>

              <div className="newsletter-form-group">
                <label htmlFor="campaign-subject">Email Subject</label>
                <input
                  id="campaign-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div className="newsletter-form-group">
                <label htmlFor="campaign-preview">Preview Text</label>
                <input
                  id="campaign-preview"
                  name="preview_text"
                  value={form.preview_text}
                  onChange={handleChange}
                  placeholder="A short summary shown in the inbox"
                />
              </div>

              <div className="newsletter-form-group">
                <label htmlFor="campaign-content">Newsletter Content</label>
                <textarea
                  id="campaign-content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Write your newsletter content here..."
                />
              </div>

              <div className="newsletter-form-note">
                <AlertCircle size={16} />
                This editor currently supports text content. Your existing template
                service is used to generate the email layout.
              </div>

              <div className="newsletter-modal-actions">
                <button
                  type="button"
                  className="newsletter-secondary-btn"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="newsletter-primary-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={17} />
                      {editingId ? 'Save Changes' : 'Create Campaign'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMPAIGN PREVIEW */}
      {showPreview && selectedCampaign && (
        <div className="newsletter-modal-overlay">
          <div
            className="newsletter-modal newsletter-preview"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-preview-title"
          >
            <div className="newsletter-modal-header">
              <div>
                <h2 id="newsletter-preview-title">Campaign Preview</h2>
                <p>{selectedCampaign.name}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                <X size={21} />
              </button>
            </div>

            <div className="newsletter-preview-content">
              <div className="newsletter-preview-meta">
                <strong>Subject:</strong>
                <span>{selectedCampaign.subject}</span>
              </div>

              {selectedCampaign.preview_text && (
                <div className="newsletter-preview-meta">
                  <strong>Preview:</strong>
                  <span>{selectedCampaign.preview_text}</span>
                </div>
              )}

              {selectedCampaign.last_error && (
                <div className="newsletter-preview-meta">
                  <strong>Last error:</strong>
                  <span>{selectedCampaign.last_error}</span>
                </div>
              )}

              <hr />

              <h2>{selectedCampaign.name}</h2>

              <p className="newsletter-preview-body" style={{ whiteSpace: 'pre-line' }}>
                {selectedCampaign.content || 'No main content available.'}
              </p>

              {(Array.isArray(selectedCampaign.sections) ? selectedCampaign.sections : []).map(
                (section, index) => (
                  <div key={index}>
                    {section?.title && <h3>{section.title}</h3>}
                    <p>{section?.content || section?.text || ''}</p>
                  </div>
                )
              )}

              {(Array.isArray(selectedCampaign.images) ? selectedCampaign.images : []).map(
                (image, index) => {
                  const src = imageSrc(image);
                  if (!src) return null;

                  const alt =
                    typeof image === 'object' && image?.alt ? image.alt : 'Newsletter image';

                  return <img key={index} src={src} alt={alt} />;
                }
              )}
            </div>

            <div className="newsletter-modal-actions">
              <button
                type="button"
                className="newsletter-secondary-btn"
                onClick={() => setShowPreview(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}