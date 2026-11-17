import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Newspaper,
  Users,
  Send,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Loader2,
  UserX,
  BarChart3,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Newsletter.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const EMPTY_CAMPAIGN = {
  name: '',
  subject: '',
  preview_text: '',
  content: '',
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

const getStatusClass = (status = 'draft') =>
  `newsletter-status newsletter-status-${String(status).toLowerCase()}`;

export default function Newsletter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const notify = (text, isError = false) => {
    setMessage(isError ? '' : text);
    setError(isError ? text : '');
  };

  const apiRequest = useCallback(async (path, options = {}) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    const response = await fetch(
      `${API_URL}/api/newsletter/admin${path}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || `Request failed (${response.status}).`
      );
    }

    return result;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [subscriberResult, campaignResult] = await Promise.all([
        apiRequest('/subscribers'),
        apiRequest('/campaigns'),
      ]);

      setSubscribers(subscriberResult.subscribers || []);
      setCampaigns(campaignResult.campaigns || []);
    } catch (err) {
      notify(err.message || 'Unable to load newsletter information.', true);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeSubscribers = useMemo(
    () =>
      subscribers.filter((subscriber) =>
        ['active', 'subscribed'].includes(
          String(subscriber.status).toLowerCase()
        )
      ),
    [subscribers]
  );

  const filteredSubscribers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return subscribers;

    return subscribers.filter((subscriber) =>
      String(subscriber.email || '').toLowerCase().includes(term)
    );
  }, [subscribers, searchTerm]);

  const publishedCampaigns = campaigns.filter(
    (campaign) =>
      campaign.is_published ||
      String(campaign.status).toLowerCase() === 'published'
  );

  const updateField = (event) => {
    const { name, value } = event.target;

    setCampaignForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openNewCampaign = () => {
    setCampaignForm(EMPTY_CAMPAIGN);
    setEditingId(null);
    setPreviewOpen(false);
    setActiveTab('create');
    notify('');
  };

  const editCampaign = (campaign) => {
    setCampaignForm({
      name: campaign.name || '',
      subject: campaign.subject || '',
      preview_text: campaign.preview_text || '',
      content: campaign.content || '',
    });

    setEditingId(campaign.id);
    setPreviewOpen(false);
    setActiveTab('create');
    notify('');
  };

  const saveCampaign = async (event) => {
    event.preventDefault();

    if (
      !campaignForm.name.trim() ||
      !campaignForm.subject.trim() ||
      !campaignForm.content.trim()
    ) {
      notify('Please enter the campaign name, subject and content.', true);
      return;
    }

    setSaving(true);
    notify('');

    try {
      const result = await apiRequest(
        editingId ? `/campaigns/${editingId}` : '/campaigns',
        {
          method: editingId ? 'PUT' : 'POST',
          body: JSON.stringify(campaignForm),
        }
      );

      notify(result.message || 'Campaign saved successfully.');
      setCampaignForm(EMPTY_CAMPAIGN);
      setEditingId(null);
      setActiveTab('history');
      await loadData();
    } catch (err) {
      notify(err.message || 'Unable to save campaign.', true);
    } finally {
      setSaving(false);
    }
  };

  const campaignAction = async (campaign, action) => {
    const labels = {
      publish: 'publish this campaign',
      test: 'send a test email for this campaign',
      send: 'send this campaign to all active subscribers',
      delete: 'delete this campaign',
    };

    if (!window.confirm(`Are you sure you want to ${labels[action]}?`)) {
      return;
    }

    setActionId(`${campaign.id}-${action}`);
    notify('');

    try {
      let result;

      if (action === 'delete') {
        result = await apiRequest(`/campaigns/${campaign.id}`, {
          method: 'DELETE',
        });
      } else {
        result = await apiRequest(
          `/campaigns/${campaign.id}/${action}`,
          { method: 'POST', body: JSON.stringify({}) }
        );
      }

      notify(result.message || 'Action completed successfully.');
      await loadData();
    } catch (err) {
      notify(err.message || 'The action could not be completed.', true);
    } finally {
      setActionId(null);
    }
  };

  const unsubscribeSubscriber = async (subscriber) => {
    if (
      !window.confirm(
        `Unsubscribe ${subscriber.email} from the newsletter?`
      )
    ) {
      return;
    }

    setActionId(subscriber.id);
    notify('');

    try {
      const result = await apiRequest(
        `/subscribers/${subscriber.id}/unsubscribe`,
        { method: 'PATCH', body: JSON.stringify({}) }
      );

      notify(result.message || 'Subscriber unsubscribed.');
      await loadData();
    } catch (err) {
      notify(err.message || 'Unable to unsubscribe this person.', true);
    } finally {
      setActionId(null);
    }
  };

  const renderCampaignActions = (campaign) => {
    const busy = (action) => actionId === `${campaign.id}-${action}`;

    return (
      <div className="newsletter-actions">
        <button
          type="button"
          className="newsletter-icon-button"
          title="Edit campaign"
          onClick={() => editCampaign(campaign)}
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          className="newsletter-icon-button"
          title="Send test email"
          disabled={Boolean(actionId)}
          onClick={() => campaignAction(campaign, 'test')}
        >
          {busy('test') ? (
            <Loader2 className="newsletter-spin" size={16} />
          ) : (
            <Mail size={16} />
          )}
        </button>

        {!campaign.is_published && (
          <button
            type="button"
            className="newsletter-small-button"
            disabled={Boolean(actionId)}
            onClick={() => campaignAction(campaign, 'publish')}
          >
            {busy('publish') ? 'Publishing…' : 'Publish'}
          </button>
        )}

        {(campaign.is_published ||
          String(campaign.status).toLowerCase() === 'published') && (
          <button
            type="button"
            className="newsletter-small-button newsletter-send-button"
            disabled={Boolean(actionId)}
            onClick={() => campaignAction(campaign, 'send')}
          >
            {busy('send') ? (
              <Loader2 className="newsletter-spin" size={14} />
            ) : (
              <Send size={14} />
            )}
            Send
          </button>
        )}

        <button
          type="button"
          className="newsletter-icon-button newsletter-delete-button"
          title="Delete campaign"
          disabled={Boolean(actionId)}
          onClick={() => campaignAction(campaign, 'delete')}
        >
          {busy('delete') ? (
            <Loader2 className="newsletter-spin" size={16} />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="newsletter-loading">
        <Loader2 className="newsletter-spin" size={30} />
        <p>Loading newsletter workspace...</p>
      </div>
    );
  }

  return (
    <div className="newsletter-page">
      <div className="newsletter-heading">
        <div>
          <span className="newsletter-eyebrow">EMAIL MARKETING</span>
          <h1>Newsletter Management</h1>
          <p>Manage subscribers, create campaigns and communicate with your audience.</p>
        </div>

        <button
          type="button"
          className="newsletter-primary-button"
          onClick={openNewCampaign}
        >
          <Plus size={18} />
          Create Newsletter
        </button>
      </div>

      {(message || error) && (
        <div className={`newsletter-alert ${error ? 'is-error' : 'is-success'}`}>
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || message}</span>
          <button
            type="button"
            onClick={() => {
              setMessage('');
              setError('');
            }}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="newsletter-tabs">
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={17} /> Overview
        </button>

        <button
          type="button"
          className={activeTab === 'subscribers' ? 'active' : ''}
          onClick={() => setActiveTab('subscribers')}
        >
          <Users size={17} /> Subscribers
        </button>

        <button
          type="button"
          className={activeTab === 'create' ? 'active' : ''}
          onClick={openNewCampaign}
        >
          <Plus size={17} /> Create Newsletter
        </button>

        <button
          type="button"
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={17} /> Campaign History
        </button>

        <button
          type="button"
          className="newsletter-refresh-tab"
          onClick={loadData}
          title="Refresh data"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {activeTab === 'overview' && (
        <section className="newsletter-section">
          <div className="newsletter-stat-grid">
            <div className="newsletter-stat-card">
              <div className="newsletter-stat-icon"><Users size={21} /></div>
              <span>Total subscribers</span>
              <strong>{subscribers.length}</strong>
              <small>All newsletter records</small>
            </div>

            <div className="newsletter-stat-card">
              <div className="newsletter-stat-icon"><UserX size={21} /></div>
              <span>Active subscribers</span>
              <strong>{activeSubscribers.length}</strong>
              <small>Eligible to receive campaigns</small>
            </div>

            <div className="newsletter-stat-card">
              <div className="newsletter-stat-icon"><Newspaper size={21} /></div>
              <span>Total campaigns</span>
              <strong>{campaigns.length}</strong>
              <small>Saved newsletter campaigns</small>
            </div>

            <div className="newsletter-stat-card">
              <div className="newsletter-stat-icon"><CheckCircle2 size={21} /></div>
              <span>Published campaigns</span>
              <strong>{publishedCampaigns.length}</strong>
              <small>Campaigns marked as published</small>
            </div>
          </div>

          <div className="newsletter-panel">
            <div className="newsletter-panel-heading">
              <div>
                <h2>Recent campaigns</h2>
                <p>Your latest newsletter activity</p>
              </div>
              <button
                type="button"
                className="newsletter-text-button"
                onClick={() => setActiveTab('history')}
              >
                View all
              </button>
            </div>

            <CampaignTable
              campaigns={campaigns.slice(0, 5)}
              renderActions={renderCampaignActions}
              onEdit={editCampaign}
            />
          </div>
        </section>
      )}

      {activeTab === 'subscribers' && (
        <section className="newsletter-panel">
          <div className="newsletter-panel-heading newsletter-subscriber-heading">
            <div>
              <h2>Newsletter subscribers</h2>
              <p>{activeSubscribers.length} active subscribers</p>
            </div>

            <div className="newsletter-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search email address..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="newsletter-table-wrap">
            <table className="newsletter-table">
              <thead>
                <tr>
                  <th>Email address</th>
                  <th>Date subscribed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="newsletter-empty">
                      No subscribers found.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td className="newsletter-email-cell">
                        <Mail size={16} />
                        {subscriber.email}
                      </td>
                      <td>{formatDate(subscriber.created_at || subscriber.subscribed_at)}</td>
                      <td>
                        <span className={getStatusClass(subscriber.status)}>
                          {subscriber.status || 'unknown'}
                        </span>
                      </td>
                      <td>
                        {['active', 'subscribed'].includes(
                          String(subscriber.status).toLowerCase()
                        ) ? (
                          <button
                            type="button"
                            className="newsletter-unsubscribe-button"
                            disabled={Boolean(actionId)}
                            onClick={() => unsubscribeSubscriber(subscriber)}
                          >
                            {actionId === subscriber.id ? (
                              <Loader2 className="newsletter-spin" size={14} />
                            ) : (
                              <UserX size={14} />
                            )}
                            Unsubscribe
                          </button>
                        ) : (
                          <span className="newsletter-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'create' && (
        <section className="newsletter-editor-layout">
          <form className="newsletter-panel newsletter-editor" onSubmit={saveCampaign}>
            <div className="newsletter-panel-heading">
              <div>
                <h2>{editingId ? 'Edit campaign' : 'Create a newsletter'}</h2>
                <p>Prepare the message you want to send to your subscribers.</p>
              </div>
              {editingId && (
                <span className="newsletter-editing-label">Editing campaign</span>
              )}
            </div>

            <label className="newsletter-field">
              <span>Campaign name *</span>
              <input
                name="name"
                value={campaignForm.name}
                onChange={updateField}
                placeholder="e.g. November Company Newsletter"
                required
              />
            </label>

            <label className="newsletter-field">
              <span>Email subject *</span>
              <input
                name="subject"
                value={campaignForm.subject}
                onChange={updateField}
                placeholder="Enter the email subject"
                required
              />
            </label>

            <label className="newsletter-field">
              <span>Preview text</span>
              <input
                name="preview_text"
                value={campaignForm.preview_text}
                onChange={updateField}
                placeholder="A short summary shown in the recipient's inbox"
              />
            </label>

            <label className="newsletter-field">
              <span>Newsletter content *</span>
              <textarea
                name="content"
                value={campaignForm.content}
                onChange={updateField}
                placeholder="Write your newsletter message here..."
                rows={13}
                required
              />
              <small>
                Write the main newsletter message. Use plain text for now; your
                backend will prepare the email layout.
              </small>
            </label>

            <div className="newsletter-editor-footer">
              <button
                type="button"
                className="newsletter-secondary-button"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye size={17} /> Preview
              </button>

              <button
                type="submit"
                className="newsletter-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="newsletter-spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                {saving ? 'Saving...' : editingId ? 'Update campaign' : 'Save draft'}
              </button>
            </div>
          </form>

          <aside className="newsletter-editor-aside">
            <div className="newsletter-tip-card">
              <div className="newsletter-tip-icon"><FileText size={21} /></div>
              <h3>Before you publish</h3>
              <ul>
                <li>Give your campaign a clear name.</li>
                <li>Write a useful email subject.</li>
                <li>Review the message before publishing.</li>
                <li>Send a test email before sending to subscribers.</li>
              </ul>
            </div>

            <div className="newsletter-tip-card newsletter-audience-card">
              <div className="newsletter-tip-icon"><Users size={21} /></div>
              <h3>Your audience</h3>
              <strong>{activeSubscribers.length}</strong>
              <p>Active subscribers currently eligible for newsletter emails.</p>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="newsletter-panel">
          <div className="newsletter-panel-heading">
            <div>
              <h2>Campaign history</h2>
              <p>Manage drafts and review published campaigns.</p>
            </div>
          </div>

          <CampaignTable
            campaigns={campaigns}
            renderActions={renderCampaignActions}
            onEdit={editCampaign}
          />
        </section>
      )}

      {previewOpen && (
        <div
          className="newsletter-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewOpen(false);
          }}
        >
          <div className="newsletter-preview-modal">
            <div className="newsletter-preview-header">
              <div>
                <span>EMAIL PREVIEW</span>
                <h2>{campaignForm.subject || 'Your newsletter subject'}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            {campaignForm.preview_text && (
              <p className="newsletter-preview-preheader">
                {campaignForm.preview_text}
              </p>
            )}

            <div className="newsletter-preview-body">
              <h3>{campaignForm.name || 'Newsletter title'}</h3>
              <p>{campaignForm.content || 'Your newsletter content will appear here.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignTable({ campaigns, renderActions }) {
  return (
    <div className="newsletter-table-wrap">
      <table className="newsletter-table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Recipients</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td colSpan="6" className="newsletter-empty">
                No campaigns have been created yet.
              </td>
            </tr>
          ) : (
            campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="newsletter-campaign-name">
                  <Newspaper size={16} />
                  {campaign.name || 'Untitled campaign'}
                </td>
                <td>{campaign.subject || '—'}</td>
                <td>
                  <span className={getStatusClass(
                    campaign.is_published ? 'published' : campaign.status
                  )}>
                    {campaign.is_published ? 'Published' : campaign.status || 'draft'}
                  </span>
                </td>
                <td>{campaign.recipient_count ?? campaign.sent_count ?? 0}</td>
                <td>{formatDate(campaign.created_at)}</td>
                <td>{renderActions(campaign)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}