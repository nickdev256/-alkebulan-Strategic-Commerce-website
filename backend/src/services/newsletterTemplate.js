
export const buildCampaignEmail = ({
  subject = '',
  content = '',
  title = '',
  previewText = '',
  unsubscribeUrl = '',
}) => {
  const safeSubject = escapeHtml(subject);
  const safeTitle = escapeHtml(title || subject);
  const safePreview = escapeHtml(previewText);

  const formattedContent = String(content || '')
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(paragraph).replace(/\n/g, '<br>');
      return `<p style="margin:0 0 16px;line-height:1.7;">${safeParagraph}</p>`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;color:#222;">
        <div style="display:none;max-height:0;overflow:hidden;">
          ${safePreview}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f4;padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;">
                <tr>
                  <td style="padding:35px 30px;background:#142b24;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;">Alkebulan Global</h1>
                    <p style="margin:8px 0 0;font-size:13px;">Strategic Commerce &amp; Development</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:35px 30px;">
                    <h2 style="margin:0 0 20px;font-size:22px;">${safeTitle}</h2>
                    ${formattedContent}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 30px;background:#f7f7f7;font-size:12px;line-height:1.6;color:#666;">
                    <p style="margin:0 0 10px;">You are receiving this email because you subscribed to Alkebulan Global updates.</p>
                    ${
                      unsubscribeUrl
                        ? `<p style="margin:0;"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#142b24;">Unsubscribe</a></p>`
                        : ''
                    }
                    <p style="margin:12px 0 0;">&copy; ${new Date().getFullYear()} Alkebulan Global. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

function escapeHtml(value) {
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
}
