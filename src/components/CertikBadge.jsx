import { useLang } from '../i18n/LanguageContext';

export default function CertikBadge({ variant = 'full', className = '' }) {
  const { lang } = useLang();
  const SKYNET_URL = 'https://skynet.certik.com/tools/token-scan/bsc/0xd8Dbf478436A5770A274658ab424c66139142839';

  const t = {
    es: { audited: 'Auditado por', alerts: '0 Alertas Críticas', passed: '17 Checks Superados', viewReport: 'Ver informe completo' },
    en: { audited: 'Audited by', alerts: '0 Critical Alerts', passed: '17 Security Checks Passed', viewReport: 'View full report' },
  }[lang];

  if (variant === 'compact') {
    return (
      <a href={SKYNET_URL} target="_blank" rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-400/50 rounded-full px-4 py-2 hover:border-emerald-300 transition ${className}`}>
        <span className="text-emerald-300 font-bold text-sm">CertiK</span>
        <span className="text-white font-bold">86.27</span>
        <span className="text-emerald-200 text-xs">/100</span>
      </a>
    );
  }

  return (
    <a href={SKYNET_URL} target="_blank" rel="noopener noreferrer"
      className={`block bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-emerald-900/30 border border-emerald-400/40 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20 transition ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-emerald-300 text-xs uppercase tracking-wider mb-1">{t.audited}</div>
          <div className="text-white text-2xl font-bold">CertiK Skynet</div>
          <div className="text-emerald-200 text-sm mt-1">{t.viewReport} →</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-white">86.27<span className="text-emerald-300 text-lg">/100</span></div>
          <div className="text-xs text-emerald-200 mt-1">✓ {t.alerts}</div>
          <div className="text-xs text-emerald-200">✓ {t.passed}</div>
        </div>
      </div>
    </a>
  );
}
