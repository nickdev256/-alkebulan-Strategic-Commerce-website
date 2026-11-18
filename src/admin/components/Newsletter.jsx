import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Ban,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  FileText,
  ImageIcon,
  Images,
  Loader2,
  Mail,
  Minus,
  MousePointerClick,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  Type,
  Upload,
  Users,
  X,
} from 'lucide-react';

import './Newsletter.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_URL = `${API_BASE_URL}/api/newsletter`;

// While a campaign is sending, refresh progress this often.
const SENDING_POLL_MS = 10000;
// Must match STALE_SENDING_MS in newsletterController.js.
const STALE_SENDING_MS = 10 * 60 * 1000;

const SENDABLE_STATUSES = ['subscribed', 'active'];

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

// ==========================================================================
// CAMPAIGN EDITOR + EMAIL PREVIEW
// ==========================================================================

// Must match MAX_SECTIONS / MAX_GALLERY_IMAGES in newsletterController.js.
const MAX_SECTIONS = 60;
const MAX_GALLERY_IMAGES = 30;

// Images are resized in the browser before upload: emails are 600px wide,
// so 1600px is sharp on high-DPI screens while keeping files small.
const MAX_IMAGE_WIDTH = 1600;
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/gif,image/webp';

const SECTION_TYPES = {
  text: { label: 'Text', icon: Type },
  image: { label: 'Image', icon: ImageIcon },
  gallery: { label: 'Gallery', icon: Images },
  button: { label: 'Button', icon: MousePointerClick },
  divider: { label: 'Divider', icon: Minus },
};

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const createSection = (type) => {
  switch (type) {
    case 'image':
      return { id: newId(), type, url: '', alt: '', caption: '', link: '' };
    case 'gallery':
      return { id: newId(), type, columns: 2, images: [] };
    case 'button':
      return { id: newId(), type, label: '', url: '' };
    case 'divider':
      return { id: newId(), type };
    default:
      return { id: newId(), type: 'text', title: '', content: '' };
  }
};

const imageUrlOf = (image) =>
  typeof image === 'string'
    ? image
    : image?.url || image?.src || image?.publicUrl || image?.image_url || '';

const toImage = (image) => ({
  url: imageUrlOf(image),
  alt: typeof image === 'object' && image ? image.alt || '' : '',
  caption: typeof image === 'object' && image ? image.caption || '' : '',
});

// Turns a saved campaign into editor state. Older campaigns kept images in a
// separate `images` list; they become a gallery section so they can be edited.
const campaignToForm = (campaign) => {
  const sections = (Array.isArray(campaign?.sections) ? campaign.sections : []).map(
    (section) => {
      const type = SECTION_TYPES[section?.type] ? section.type : 'text';
      const base = { ...createSection(type), ...section, type };

      if (!base.id) base.id = newId();
      if (type === 'text') base.content = section?.content || section?.text || '';
      if (type === 'gallery') base.images = (section.images || []).map(toImage);

      return base;
    }
  );

  const legacyImages = (Array.isArray(campaign?.images) ? campaign.images : [])
    .map(toImage)
    .filter((image) => image.url);

  if (legacyImages.length) {
    sections.unshift({ ...createSection('gallery'), columns: 1, images: legacyImages });
  }

  return {
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    preview_text: campaign?.preview_text || '',
    content: campaign?.content || '',
    sections,
  };
};

const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(String(value || '').trim());

const sectionHasContent = (section) => {
  switch (section.type) {
    case 'text':
      return Boolean(section.title.trim() || section.content.trim());
    case 'image':
      return isHttpUrl(section.url);
    case 'gallery':
      return section.images.some((image) => isHttpUrl(image.url));
    case 'button':
      return Boolean(section.label.trim() && isHttpUrl(section.url));
    default:
      return false;
  }
};

// Problems that would make a section silently disappear from the email.
const sectionProblem = (section) => {
  if (section.type === 'image' && !isHttpUrl(section.url)) {
    return 'Upload an image or paste an image link.';
  }
  if (section.type === 'gallery' && !section.images.length) {
    return 'Add at least one image to this gallery.';
  }
  if (section.type === 'button') {
    if (!section.label.trim()) return 'Give the button a label.';
    if (!isHttpUrl(section.url)) return 'The button link must start with https://';
  }
  if (section.type === 'image' && section.link && !isHttpUrl(section.link)) {
    return 'The image link must start with https://';
  }
  return '';
};

// ==========================================
// IMAGE PREPARATION + UPLOAD
// ==========================================

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`"${file.name}" could not be read as an image.`));
    };
    img.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(blob);
  });

// Resizes large photos and converts WebP to JPG (Outlook cannot show WebP).
// GIFs are uploaded unchanged so animations keep working.
const prepareImage = async (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not an image.`);
  }

  if (file.type === 'image/gif') {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`"${file.name}" is too large. GIFs must be under 3.5 MB.`);
    }
    return { blob: file, contentType: 'image/gif' };
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_WIDTH / img.naturalWidth);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // PNGs keep transparency; everything else becomes a compressed JPG.
  if (file.type === 'image/png') {
    context.drawImage(img, 0, 0, width, height);
    const png = await canvasToBlob(canvas, 'image/png');
    if (png && png.size <= MAX_UPLOAD_BYTES) {
      return { blob: png, contentType: 'image/png' };
    }
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(img, 0, 0, width, height);

  for (const quality of [0.85, 0.72, 0.6]) {
    const jpg = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (jpg && jpg.size <= MAX_UPLOAD_BYTES) {
      return { blob: jpg, contentType: 'image/jpeg' };
    }
  }

  throw new Error(`"${file.name}" is too large to upload.`);
};

// ==========================================
// EMAIL PREVIEW (rendered by the backend)
// ==========================================

function EmailPreview({ campaign, apiRequest, onClose }) {
  const [html, setHtml] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiRequest('/admin/campaigns/preview', {
      method: 'POST',
      body: JSON.stringify({
        name: campaign.name,
        subject: campaign.subject,
        preview_text: campaign.preview_text,
        content: campaign.content,
        images: campaign.images || [],
        sections: campaign.sections || [],
      }),
    })
      .then((result) => {
        if (cancelled) return;
        setHtml(result.html || '');
        setSubject(result.subject || '');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [apiRequest, campaign]);

  return (
    <div className="newsletter-modal-overlay campaign-preview-overlay">
      <div
        className="newsletter-modal campaign-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-email-preview-title"
      >
        <div className="newsletter-modal-header">
          <div>
            <h2 id="campaign-email-preview-title">Email Preview</h2>
            <p>
              {subject ? (
                <>
                  <strong>Subject:</strong> {subject}
                </>
              ) : (
                'This is how subscribers will see the email.'
              )}
            </p>
          </div>

          <button type="button" onClick={onClose} aria-label="Close preview">
            <X size={21} />
          </button>
        </div>

        {error && (
          <div className="newsletter-alert error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!error && !html && (
          <p className="campaign-preview-loading">
            <Loader2 size={18} className="spin" /> Rendering preview...
          </p>
        )}

        {html && (
          <iframe
            title="Email preview"
            className="campaign-preview-frame"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            srcDoc={html}
          />
        )}

        <div className="newsletter-modal-actions">
          <button type="button" className="newsletter-secondary-btn" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// IMAGE PICKER (upload button + paste link)
// ==========================================

function ImageDrop({ multiple = false, disabled, onFiles, label }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      className={`campaign-drop ${dragging ? 'dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
    >
      <Upload size={20} />
      <span>{label}</span>
      <small>JPG, PNG, GIF or WebP. Large photos are resized automatically.</small>
      <button
        type="button"
        className="newsletter-secondary-btn"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {multiple ? 'Choose images' : 'Choose image'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        multiple={multiple}
        hidden
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
// ==========================================
// CAMPAIGN EDITOR
// ==========================================

function CampaignEditor({
  campaign,
  isEditing,
  saving,
  apiRequest,
  onSave,
  onClose,
}) {
  const [initialForm] = useState(() => campaignToForm(campaign));
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState({});
  const [formError, setFormError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const uploadCount = Object.values(uploading).reduce((sum, count) => sum + count, 0);
  const busy = saving || uploadCount > 0;

  // ---------- field helpers ----------

  const setField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const updateSection = (id, changes) =>
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.map((section) =>
        section.id === id
          ? { ...section, ...(typeof changes === 'function' ? changes(section) : changes) }
          : section
      ),
    }));

  const addSection = (type) => {
    if (form.sections.length >= MAX_SECTIONS) {
      setFormError(`A campaign can have at most ${MAX_SECTIONS} sections.`);
      return;
    }
    setForm((previous) => ({ ...previous, sections: [...previous.sections, createSection(type)] }));
  };

  const removeSection = (id) =>
    setForm((previous) => ({
      ...previous,
      sections: previous.sections.filter((section) => section.id !== id),
    }));

  const duplicateSection = (id) =>
    setForm((previous) => {
      if (previous.sections.length >= MAX_SECTIONS) return previous;
      const index = previous.sections.findIndex((section) => section.id === id);
      const copy = {
        ...previous.sections[index],
        id: newId(),
        images: previous.sections[index].images?.map((image) => ({ ...image })),
      };
      const sections = [...previous.sections];
      sections.splice(index + 1, 0, copy);
      return { ...previous, sections };
    });

  const moveSection = (id, direction) =>
    setForm((previous) => {
      const index = previous.sections.findIndex((section) => section.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= previous.sections.length) return previous;
      const sections = [...previous.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...previous, sections };
    });

  // ---------- uploads ----------

  const uploadFile = async (file) => {
    const { blob, contentType } = await prepareImage(file);
    const data = await blobToDataUrl(blob);
    const result = await apiRequest('/admin/uploads/images', {
      method: 'POST',
      body: JSON.stringify({ contentType, data }),
    });
    return result.url;
  };

  const trackUploads = (id, delta) =>
    setUploading((previous) => {
      const next = { ...previous, [id]: (previous[id] || 0) + delta };
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const uploadToImageSection = async (section, files) => {
    setFormError('');
    trackUploads(section.id, 1);
    try {
      const url = await uploadFile(files[0]);
      const altFromName = files[0].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      updateSection(section.id, (current) => ({ url, alt: current.alt || altFromName }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      trackUploads(section.id, -1);
    }
  };

  const uploadToGallery = async (section, files) => {
    setFormError('');

    const room = MAX_GALLERY_IMAGES - section.images.length;
    if (room <= 0) {
      setFormError(`A gallery can hold at most ${MAX_GALLERY_IMAGES} images. Add another gallery section.`);
      return;
    }
    if (files.length > room) {
      setFormError(
        `Only ${room} more image(s) fit in this gallery. Add another gallery section for the rest.`
      );
    }

    // Upload one after another so the images keep the order they were picked in.
    for (const file of files.slice(0, room)) {
      trackUploads(section.id, 1);
      try {
        const url = await uploadFile(file);
        updateSection(section.id, (current) => ({
          images: [...current.images, { url, alt: '', caption: '' }],
        }));
      } catch (err) {
        setFormError(err.message);
      } finally {
        trackUploads(section.id, -1);
      }
    }
  };

  const updateGalleryImage = (sectionId, index, changes) =>
    updateSection(sectionId, (current) => ({
      images: current.images.map((image, i) => (i === index ? { ...image, ...changes } : image)),
    }));

  const moveGalleryImage = (sectionId, index, direction) =>
    updateSection(sectionId, (current) => {
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return {};
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { images };
    });

  const removeGalleryImage = (sectionId, index) =>
    updateSection(sectionId, (current) => ({
      images: current.images.filter((_, i) => i !== index),
    }));

  // ---------- save / preview ----------

  const buildPayload = () => ({
    name: form.name,
    subject: form.subject,
    preview_text: form.preview_text,
    content: form.content,
    images: [],
    sections: form.sections,
  });

  const validate = () => {
    if (!form.name.trim()) return 'Campaign name is required.';
    if (!form.subject.trim()) return 'Email subject is required.';

    const problem = form.sections.find((section) => sectionProblem(section));
    if (problem) {
      const number = form.sections.indexOf(problem) + 1;
      return `Section ${number} (${SECTION_TYPES[problem.type].label}): ${sectionProblem(problem)}`;
    }

    if (!form.content.trim() && !form.sections.some(sectionHasContent)) {
      return 'Add an introduction or at least one section before saving.';
    }

    return '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }

    setFormError('');
    Promise.resolve(onSave(buildPayload())).catch((err) => {
      setFormError(err?.message || 'The campaign could not be saved.');
    });
  };

  const openPreview = () => {
    setPreviewSnapshot(buildPayload());
    setShowPreview(true);
  };

  const requestClose = () => {
    if (busy) return;
    const dirty = JSON.stringify(initialForm) !== JSON.stringify(form);
    if (dirty && !window.confirm('Close the editor? Unsaved changes will be lost.')) return;
    onClose();
  };

  // ---------- section bodies ----------

  const renderSectionBody = (section) => {
    const isUploading = Boolean(uploading[section.id]);

    switch (section.type) {
      case 'text':
        return (
          <>
            <div className="newsletter-form-group">
              <label htmlFor={`title-${section.id}`}>Heading (optional)</label>
              <input
                id={`title-${section.id}`}
                value={section.title}
                maxLength={200}
                onChange={(event) => updateSection(section.id, { title: event.target.value })}
                placeholder="e.g. Upcoming Trade Mission"
              />
            </div>
            <div className="newsletter-form-group">
              <label htmlFor={`content-${section.id}`}>Text</label>
              <textarea
                id={`content-${section.id}`}
                className="campaign-textarea"
                value={section.content}
                onChange={(event) => updateSection(section.id, { content: event.target.value })}
                placeholder="Write this section. Leave a blank line between paragraphs."
              />
            </div>
          </>
        );

      case 'image':
        return (
          <>
            {section.url ? (
              <div className="campaign-image-preview">
                <img src={section.url} alt={section.alt || 'Selected'} />
                <div className="campaign-image-preview-actions">
                  <button
                    type="button"
                    className="newsletter-secondary-btn"
                    onClick={() => updateSection(section.id, { url: '' })}
                    disabled={isUploading}
                  >
                    <X size={15} /> Remove image
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ImageDrop
                  label={isUploading ? 'Uploading...' : 'Drag an image here'}
                  disabled={isUploading}
                  onFiles={(files) => uploadToImageSection(section, files)}
                />
                <div className="newsletter-form-group campaign-url-row">
                  <label htmlFor={`url-${section.id}`}>Or paste an image link</label>
                  <input
                    id={`url-${section.id}`}
                    type="url"
                    placeholder="https://... then press Enter"
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return;
                      event.preventDefault();
                      const value = event.currentTarget.value.trim();
                      if (value) updateSection(section.id, { url: value });
                    }}
                    onBlur={(event) => {
                      const value = event.target.value.trim();
                      if (value) updateSection(section.id, { url: value });
                    }}
                  />
                </div>
              </>
            )}

            {isUploading && (
              <p className="campaign-uploading">
                <Loader2 size={15} className="spin" /> Uploading image...
              </p>
            )}

            <div className="campaign-field-grid">
              <div className="newsletter-form-group">
                <label htmlFor={`alt-${section.id}`}>Description (for screen readers)</label>
                <input
                  id={`alt-${section.id}`}
                  value={section.alt}
                  maxLength={300}
                  onChange={(event) => updateSection(section.id, { alt: event.target.value })}
                  placeholder="What the image shows"
                />
              </div>
              <div className="newsletter-form-group">
                <label htmlFor={`caption-${section.id}`}>Caption (optional)</label>
                <input
                  id={`caption-${section.id}`}
                  value={section.caption}
                  maxLength={500}
                  onChange={(event) => updateSection(section.id, { caption: event.target.value })}
                  placeholder="Shown under the image"
                />
              </div>
            </div>
            <div className="newsletter-form-group">
              <label htmlFor={`link-${section.id}`}>Open this link when clicked (optional)</label>
              <input
                id={`link-${section.id}`}
                type="url"
                value={section.link}
                onChange={(event) => updateSection(section.id, { link: event.target.value })}
                placeholder="https://alkebulan-global.com/..."
              />
            </div>
          </>
        );

      case 'gallery':
        return (
          <>
            <div className="campaign-gallery-toolbar">
              <label htmlFor={`columns-${section.id}`}>Images per row</label>
              <select
                id={`columns-${section.id}`}
                value={section.columns}
                onChange={(event) =>
                  updateSection(section.id, { columns: Number(event.target.value) })
                }
              >
                <option value={1}>1 (full width)</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
              <span>
                {section.images.length} / {MAX_GALLERY_IMAGES} images
              </span>
            </div>

            {section.images.length > 0 && (
              <div
                className="campaign-gallery-grid"
                style={{ '--campaign-columns': Math.min(section.columns, 3) }}
              >
                {section.images.map((image, index) => (
                  <div className="campaign-gallery-item" key={`${image.url}-${index}`}>
                    <img src={image.url} alt={image.alt || `Gallery image ${index + 1}`} />
                    <div className="campaign-gallery-item-actions">
                      <button
                        type="button"
                        title="Move left"
                        aria-label="Move image earlier"
                        disabled={index === 0}
                        onClick={() => moveGalleryImage(section.id, index, -1)}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        title="Move right"
                        aria-label="Move image later"
                        disabled={index === section.images.length - 1}
                        onClick={() => moveGalleryImage(section.id, index, 1)}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        title="Remove image"
                        aria-label="Remove image"
                        className="danger"
                        onClick={() => removeGalleryImage(section.id, index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      value={image.caption}
                      maxLength={500}
                      aria-label={`Caption for image ${index + 1}`}
                      placeholder="Caption (optional)"
                      onChange={(event) =>
                        updateGalleryImage(section.id, index, { caption: event.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {uploading[section.id] > 0 && (
              <p className="campaign-uploading">
                <Loader2 size={15} className="spin" /> Uploading {uploading[section.id]} image(s)...
              </p>
            )}

            {section.images.length < MAX_GALLERY_IMAGES && (
              <ImageDrop
                multiple
                label="Drag several images here"
                onFiles={(files) => uploadToGallery(section, files)}
              />
            )}
          </>
        );

      case 'button':
        return (
          <div className="campaign-field-grid">
            <div className="newsletter-form-group">
              <label htmlFor={`label-${section.id}`}>Button text</label>
              <input
                id={`label-${section.id}`}
                value={section.label}
                maxLength={80}
                onChange={(event) => updateSection(section.id, { label: event.target.value })}
                placeholder="e.g. Read the full report"
              />
            </div>
            <div className="newsletter-form-group">
              <label htmlFor={`button-url-${section.id}`}>Link</label>
              <input
                id={`button-url-${section.id}`}
                type="url"
                value={section.url}
                onChange={(event) => updateSection(section.id, { url: event.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        );

      default:
        return <p className="campaign-divider-note">A thin line that separates sections.</p>;
    }
  };

  // ---------- render ----------

  return (
    <>
      <div className="newsletter-modal-overlay">
        <div
          className="newsletter-modal newsletter-editor campaign-editor"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-editor-title"
        >
          <div className="newsletter-modal-header">
            <div>
              <h2 id="newsletter-editor-title">
                {isEditing ? 'Edit Campaign' : 'Create Newsletter Campaign'}
              </h2>
              <p>Build the email from sections. Add as many images and sections as you need.</p>
            </div>

            <button type="button" onClick={requestClose} aria-label="Close editor" disabled={busy}>
              <X size={21} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="campaign-field-grid">
              <div className="newsletter-form-group">
                <label htmlFor="campaign-name">Campaign name (internal)</label>
                <input
                  id="campaign-name"
                  name="name"
                  value={form.name}
                  onChange={setField}
                  placeholder="e.g. November Newsletter"
                  aria-invalid={submitted && !form.name.trim()}
                />
              </div>

              <div className="newsletter-form-group">
                <label htmlFor="campaign-subject">Email subject</label>
                <input
                  id="campaign-subject"
                  name="subject"
                  value={form.subject}
                  onChange={setField}
                  placeholder="What subscribers see in their inbox"
                  aria-invalid={submitted && !form.subject.trim()}
                />
              </div>
            </div>

            <div className="newsletter-form-group">
              <label htmlFor="campaign-preview">Preview text (optional)</label>
              <input
                id="campaign-preview"
                name="preview_text"
                value={form.preview_text}
                onChange={setField}
                placeholder="A short summary shown next to the subject in the inbox"
              />
            </div>

            <div className="newsletter-form-group">
              <label htmlFor="campaign-content">Introduction</label>
              <textarea
                id="campaign-content"
                name="content"
                className="campaign-textarea"
                value={form.content}
                onChange={setField}
                placeholder="Opening message at the top of the email..."
              />
            </div>

            {/* SECTIONS */}
            <div className="campaign-sections-header">
              <h3>Sections</h3>
              <span>
                {form.sections.length} / {MAX_SECTIONS}
              </span>
            </div>

            {form.sections.length === 0 && (
              <p className="campaign-sections-empty">
                No sections yet. Use the buttons below to add text, images, galleries and buttons.
              </p>
            )}

            <ol className="campaign-sections">
              {form.sections.map((section, index) => {
                const meta = SECTION_TYPES[section.type];
                const Icon = meta.icon;
                const problem = submitted ? sectionProblem(section) : '';

                return (
                  <li
                    key={section.id}
                    className={`campaign-section ${problem ? 'has-problem' : ''}`}
                  >
                    <div className="campaign-section-header">
                      <span className="campaign-section-title">
                        <Icon size={16} />
                        {index + 1}. {meta.label}
                      </span>

                      <div className="campaign-section-actions">
                        <button
                          type="button"
                          title="Move up"
                          aria-label="Move section up"
                          disabled={index === 0}
                          onClick={() => moveSection(section.id, -1)}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          aria-label="Move section down"
                          disabled={index === form.sections.length - 1}
                          onClick={() => moveSection(section.id, 1)}
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          title="Duplicate"
                          aria-label="Duplicate section"
                          onClick={() => duplicateSection(section.id)}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          aria-label="Delete section"
                          className="danger"
                          disabled={Boolean(uploading[section.id])}
                          onClick={() => removeSection(section.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {problem && (
                      <p className="campaign-section-problem">
                        <AlertCircle size={14} /> {problem}
                      </p>
                    )}

                    <div className="campaign-section-body">{renderSectionBody(section)}</div>
                  </li>
                );
              })}
            </ol>

            <div className="campaign-add-bar" role="group" aria-label="Add a section">
              <span>Add section:</span>
              {Object.entries(SECTION_TYPES).map(([type, meta]) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    className="newsletter-secondary-btn"
                    disabled={form.sections.length >= MAX_SECTIONS}
                    onClick={() => addSection(type)}
                  >
                    <Icon size={15} />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {formError && (
              <div className="newsletter-alert error campaign-form-error" role="alert">
                <AlertCircle size={18} />
                <span>{formError}</span>
                <button type="button" onClick={() => setFormError('')} aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="newsletter-modal-actions campaign-editor-actions">
              <button
                type="button"
                className="newsletter-secondary-btn"
                onClick={requestClose}
                disabled={busy}
              >
                Cancel
              </button>

              <button
                type="button"
                className="newsletter-secondary-btn"
                onClick={openPreview}
                disabled={uploadCount > 0}
              >
                <Eye size={16} />
                Preview email
              </button>

              <button type="submit" className="newsletter-primary-btn" disabled={busy}>
                {saving ? (
                  <>
                    <Loader2 size={17} className="spin" />
                    Saving...
                  </>
                ) : uploadCount > 0 ? (
                  <>
                    <Loader2 size={17} className="spin" />
                    Uploading images...
                  </>
                ) : (
                  <>
                    <CheckCircle size={17} />
                    {isEditing ? 'Save Changes' : 'Create Campaign'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPreview && previewSnapshot && (
        <EmailPreview
          campaign={previewSnapshot}
          apiRequest={apiRequest}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
// ==========================================================================
// NEWSLETTER DASHBOARD
// ==========================================================================

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
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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

        const [subscriberResult, campaignResult] = await Promise.all([
          apiRequest('/admin/subscribers'),
          apiRequest('/admin/campaigns'),
        ]);

        setError('');

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

  // `loading` already starts as true, so the first load only has to turn it
  // off when finished. Starting it from a callback keeps state changes out
  // of the effect body itself.
  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => (cancelled ? undefined : loadDashboard(false)))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

  const openCreateEditor = () => {
    setEditingCampaign(null);
    setShowEditor(true);
  };

  const openEditEditor = (campaign) => {
    if (campaign.status !== 'draft') {
      notifyError('Only draft campaigns can be edited.');
      return;
    }

    setEditingCampaign(campaign);
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setShowEditor(false);
    setEditingCampaign(null);
  };

  // ========================================
  // CREATE / UPDATE CAMPAIGN
  // ========================================

  // The editor validates the form and hands over a ready payload.
  const saveCampaign = async (payload) => {
    const editingId = editingCampaign?.id;

    try {
      setSaving(true);

      const path = editingId ? `/admin/campaigns/${editingId}` : '/admin/campaigns';

      const result = await apiRequest(path, {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });

      notifySuccess(
        editingId ? 'Campaign updated successfully.' : 'Campaign created successfully.'
      );

      setShowEditor(false);
      setEditingCampaign(null);

      if (result.campaign) setSelectedCampaign(result.campaign);

      await loadDashboard(false);
    } catch (err) {
      notifyError(err.message);
      throw err; // lets the open editor show the error too
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
        <CampaignEditor
          key={editingCampaign?.id || 'new'}
          campaign={editingCampaign}
          isEditing={Boolean(editingCampaign)}
          saving={saving}
          apiRequest={apiRequest}
          onSave={saveCampaign}
          onClose={closeEditor}
        />
      )}

      {/* CAMPAIGN PREVIEW (rendered exactly like the real email) */}
      {showPreview && selectedCampaign && (
        <EmailPreview
          campaign={selectedCampaign}
          apiRequest={apiRequest}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}