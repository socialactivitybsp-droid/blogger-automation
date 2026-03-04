export const MASTER_TEMPLATE = `
<script async src="https://www.googletagmanager.com/gtag/js?id={{GA_MEASUREMENT_ID}}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{GA_MEASUREMENT_ID}}');
</script>
<header style="background:#d60000;color:#fff;padding:20px;text-align:center;border-radius:12px 12px 0 0;">
  <h1 style="margin:0;font-family:Arial,sans-serif;">AI Blogger Newsroom</h1>
  <p style="margin:8px 0 0;">Automated publishing workflow</p>
</header>
<section style="padding:16px;border:1px solid #f0b6b6;border-top:0;">
  <img src="{{HERO_IMAGE}}" alt="Hero" style="width:100%;max-height:420px;object-fit:cover;border-radius:10px;" />
</section>
<article style="padding:18px;border:1px solid #f0b6b6;border-top:0;border-bottom:0;line-height:1.8;color:#222;">
  {{CONTENT_HTML}}
</article>
<footer style="padding:20px;background:#fff4f4;border:1px solid #f0b6b6;border-radius:0 0 12px 12px;text-align:center;">
  <p style="margin:0 0 8px;"><strong>Author:</strong> AI Blogger Editorial Desk</p>
  <p style="margin:0 0 10px;">Join our updates for fresh stories and SEO-ready content.</p>
  <a href="https://blogger.com" target="_blank" rel="noreferrer" style="display:inline-block;background:#d60000;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;">Join & Follow</a>
</footer>
`;

export const injectTemplate = ({ heroImage, contentHtml, gaMeasurementId = 'G-XXXXXXXXXX' }) => {
  return MASTER_TEMPLATE.replaceAll('{{HERO_IMAGE}}', heroImage || '')
    .replace('{{CONTENT_HTML}}', contentHtml || '')
    .replaceAll('{{GA_MEASUREMENT_ID}}', gaMeasurementId);
};
