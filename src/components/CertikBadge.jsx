import { useLang } from '../i18n/LanguageContext';

export default function CertikBadge({ variant = 'full', style = {} }) {
  const { lang } = useLang();
  const SKYNET_URL = 'https://skynet.certik.com/tools/token-scan/bsc/0xd8Dbf478436A5770A274658ab424c66139142839';

  const t = {
    es: { scanned: 'Escaneado por', alerts: '0 Alertas Críticas', passed: '17 Checks Superados', viewReport: 'Ver informe completo' },
    en: { scanned: 'Scanned by', alerts: '0 Critical Alerts', passed: '17 Security Checks Passed', viewReport: 'View full report' },
  }[lang];

  if (variant === 'compact') {
    return (
      <a href={SKYNET_URL} target="_blank" rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'linear-gradient(90deg, rgba(6,78,59,0.5), rgba(19,78,74,0.5))',
          border: '1px solid rgba(52,211,153,0.6)', borderRadius: '999px',
          padding: '0.4rem 0.9rem', textDecoration: 'none', ...style
        }}>
        <img src="/certik.png" alt="CertiK Skynet" style={{ height: '16px', width: 'auto' }} />
        <span style={{ color: '#000', fontWeight: 800 }}>86.27</span>
        <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>/100</span>
      </a>
    );
  }

  return (
    <a href={SKYNET_URL} target="_blank" rel="noopener noreferrer"
      style={{
        display: 'block',
        background: 'linear-gradient(135deg, rgba(6,78,59,0.35), rgba(19,78,74,0.25), rgba(6,78,59,0.35))',
        border: '1px solid rgba(52,211,153,0.45)', borderRadius: '1rem',
        padding: '1.25rem', textDecoration: 'none', ...style
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#000', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 800 }}>{t.scanned}</div>
          <img src="/certik.png" alt="CertiK Skynet" style={{ height: '32px', width: 'auto', marginBottom: '0.5rem' }} />
          <div style={{ color: '#000', fontSize: '0.875rem', fontWeight: 700 }}>{t.viewReport} →</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#000', lineHeight: 1 }}>86.27<span style={{ color: '#000', fontSize: '1.125rem', fontWeight: 800 }}>/100</span></div>
          <div style={{ fontSize: '0.75rem', color: '#000', marginTop: '0.25rem', fontWeight: 700 }}>✓ {t.alerts}</div>
          <div style={{ fontSize: '0.75rem', color: '#000', fontWeight: 700 }}>✓ {t.passed}</div>
        </div>
      </div>
    </a>
  );
}
