
const escapeHtml = (value = '') => {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
};

// ==========================================
// URL VALIDATION
// ==========================================

const getSafeUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  try {
    const parsed = new URL(value.trim());

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    // Reject URLs containing embedded credentials.
    if (parsed.username || parsed.password) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
};

// ==========================================
// TEXT FORMATTING
// ==========================================

const formatTextAsHtml = (value = '') => {
  return String(value ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(
        paragraph.trim()
      ).replace(/\n/g, '<br>');

      if (!safeParagraph) return '';

      return `
        <p style="margin:0 0 16px;line-height:1.7;">
          ${safeParagraph}
        </p>
      `;
    })
    .filter(Boolean)
    .join('');
};

const formatTextAsPlainText = (value = '') => {
  return String(value ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join('\n\n');
};

// ==========================================
// IMAGE HANDLING
// ==========================================

const getImageUrl = (image) => {
  if (typeof image === 'string') {
    return getSafeUrl(image);
  }

  if (!image || typeof image !== 'object') {
    return '';
  }

  return getSafeUrl(
    image.url ||
    image.src ||
    image.image_url ||
    ''
  );
};

const renderImages = (images = []) => {
  if (!Array.isArray(images)) return '';

  return images
    .map((image) => {
      const imageUrl = getImageUrl(image);

      if (!imageUrl) return '';

      const alt =
        typeof image === 'object'
          ? image.alt || image.caption || 'Newsletter image'
          : 'Newsletter image';

      const caption =
        typeof image === 'object'
          ? image.caption || ''
          : '';

      return `
        <div style="margin:0 0 24px;">

          <img
            src="${escapeHtml(imageUrl)}"
            alt="${escapeHtml(alt)}"
            width="540"
            style="
              display:block;
              width:100%;
              max-width:540px;
              height:auto;
              border:0;
              border-radius:6px;
            "
          />

          ${
            caption
              ? `
                <p style="
                  margin:8px 0 0;
                  color:#777;
                  font-size:12px;
                  line-height:1.5;
                ">
                  ${escapeHtml(caption)}
                </p>
              `
              : ''
          }

        </div>
      `;
    })
    .filter(Boolean)
    .join('');
};

const formatImagesAsPlainText = (images = []) => {
  if (!Array.isArray(images)) return '';

  return images
    .map((image) => {
      const url = getImageUrl(image);

      if (!url) return '';

      const caption =
        typeof image === 'object'
          ? image.caption || ''
          : '';

      return caption
        ? `${String(caption)}\n${url}`
        : url;
    })
    .filter(Boolean)
    .join('\n\n');
};

// ==========================================
// SECTION HANDLING
// ==========================================

const getSectionContent = (section) => {
  return (
    section?.content ||
    section?.text ||
    section?.html ||
    ''
  );
};

const renderSections = (sections = []) => {
  if (!Array.isArray(sections)) return '';

  return sections
    .map((section) => {
      if (!section || typeof section !== 'object') {
        return '';
      }

      const title = String(
        section.title || ''
      ).trim();

      // Section HTML is deliberately treated as text.
      // Raw HTML supplied through the editor is never rendered.

      const sectionContent = getSectionContent(section);

      if (
        !title &&
        !String(sectionContent).trim()
      ) {
        return '';
      }

      return `
        <div style="margin:0 0 26px;">

          ${
            title
              ? `
                <h3 style="
                  margin:0 0 12px;
                  color:#142b24;
                  font-size:18px;
                  line-height:1.4;
                ">
                  ${escapeHtml(title)}
                </h3>
              `
              : ''
          }

          <div style="
            color:#444;
            font-size:15px;
            line-height:1.7;
          ">
            ${formatTextAsHtml(sectionContent)}
          </div>

        </div>
      `;
    })
    .filter(Boolean)
    .join('');
};

const formatSectionsAsPlainText = (sections = []) => {
  if (!Array.isArray(sections)) return '';

  return sections
    .map((section) => {
      if (!section || typeof section !== 'object') {
        return '';
      }

      const sectionTitle = String(
        section.title || ''
      ).trim();

      const sectionContent = formatTextAsPlainText(
        getSectionContent(section)
      );

      return [sectionTitle, sectionContent]
        .filter(Boolean)
        .join('\n\n');
    })
    .filter(Boolean)
    .join('\n\n');
};

// ==========================================
// MAIN NEWSLETTER EMAIL BUILDER
// ==========================================

export const buildCampaignEmail = ({
  subject = '',
  content = '',
  title = '',
  preview_text = '',
  previewText = '',
  images = [],
  sections = [],
  unsubscribeUrl = '',
} = {}) => {
  const cleanSubject = String(
    subject || ''
  ).trim();

  const cleanTitle = String(
    title || cleanSubject
  ).trim();

  const cleanContent = String(
    content ?? ''
  );

  const cleanPreview = String(
    preview_text || previewText || ''
  ).trim();

  const safeTitle = escapeHtml(cleanTitle);
  const safePreview = escapeHtml(cleanPreview);

  const safeUnsubscribeUrl = getSafeUrl(
    unsubscribeUrl
  );

  // Generate HTML content.

  const formattedContent = formatTextAsHtml(
    cleanContent
  );

  const formattedImages = renderImages(images);

  const formattedSections = renderSections(
    sections
  );

  // Generate plain-text content.

  const plainTextContent = formatTextAsPlainText(
    cleanContent
  );

  const plainTextImages = formatImagesAsPlainText(
    images
  );

  const plainTextSections = formatSectionsAsPlainText(
    sections
  );

  // ==========================================
  // PLAIN-TEXT EMAIL
  // ==========================================

  const textParts = [
    cleanTitle,
    plainTextContent,
    plainTextImages,
    plainTextSections,
    'Alkebulan Global LLC',
    'Strategic Commerce & Development',
    'Global Partners. Real Impact.',
  ].filter(Boolean);

  if (safeUnsubscribeUrl) {
    textParts.push(
      'Unsubscribe from Alkebulan Global updates:',
      safeUnsubscribeUrl
    );
  }

  const text = textParts.join('\n\n');

  // ==========================================
  // HTML EMAIL
  // ==========================================

  const html = `
    <!DOCTYPE html>
    <html lang="en">

      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <meta
          name="color-scheme"
          content="light"
        />

        <title>${safeTitle}</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f4f4f4;
        font-family:Arial,Helvetica,sans-serif;
        color:#222;
      ">

        <!-- Preview text -->

        <div style="
          display:none;
          max-height:0;
          overflow:hidden;
          opacity:0;
          color:transparent;
          visibility:hidden;
          mso-hide:all;
        ">
          ${safePreview}
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            background:#f4f4f4;
            padding:30px 12px;
          "
        >

          <tr>
            <td align="center">

              <table
                role="presentation"
                width="600"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  max-width:600px;
                  width:100%;
                  background:#ffffff;
                  border-collapse:collapse;
                "
              >

                <!-- HEADER -->

                <tr>
                  <td style="
                    padding:35px 30px;
                    background:#142b24;
                    color:#ffffff;
                  ">

                    <h1 style="
                      margin:0;
                      font-size:24px;
                      font-weight:700;
                      color:#ffffff;
                    ">
                      Alkebulan Global
                    </h1>

                    <p style="
                      margin:8px 0 0;
                      font-size:13px;
                      color:#e5e5e5;
                    ">
                      Strategic Commerce &amp; Development
                    </p>

                  </td>
                </tr>

                <!-- MAIN CONTENT -->

                <tr>
                  <td style="
                    padding:35px 30px;
                    color:#263247;
                  ">

                    <h2 style="
                      margin:0 0 20px;
                      font-size:22px;
                      line-height:1.4;
                      color:#142b24;
                    ">
                      ${safeTitle}
                    </h2>

                    <div style="
                      font-size:15px;
                      line-height:1.7;
                      color:#444;
                    ">
                      ${formattedContent}
                    </div>

                    ${formattedImages}

                    ${formattedSections}

                  </td>
                </tr>

                <!-- FOOTER -->

                <tr>
                  <td style="
                    padding:24px 30px;
                    background:#f7f7f7;
                    font-size:12px;
                    line-height:1.6;
                    color:#666;
                  ">

                    <p style="margin:0 0 10px;">
                      You are receiving this email because you subscribed
                      to Alkebulan Global updates.
                    </p>

                    ${
                      safeUnsubscribeUrl
                        ? `
                          <p style="margin:0 0 12px;">

                            <a
                              href="${escapeHtml(safeUnsubscribeUrl)}"
                              style="
                                color:#142b24;
                                text-decoration:underline;
                              "
                            >
                              Unsubscribe from these updates
                            </a>

                          </p>
                        `
                        : ''
                    }

                    <p style="margin:0 0 8px;">
                      <strong>Alkebulan Global LLC</strong>
                    </p>

                    <p style="margin:0 0 8px;">
                      Strategic Commerce &amp; Development
                    </p>

                    <p style="margin:0 0 8px;">
                      Global Partners. Real Impact.
                    </p>

                    <p style="margin:0 0 8px;">

                      <a
                        href="https://alkebulan-global.com"
                        style="color:#142b24;"
                      >
                        www.alkebulan-global.com
                      </a>

                    </p>

                    <p style="margin:12px 0 0;">
                      &copy; ${new Date().getFullYear()}
                      Alkebulan Global LLC. All rights reserved.
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

        </table>

      </body>
    </html>
  `;

  return {
    subject: cleanSubject,
    html,
    text,
  };
};
