export default function SocialLinks({ variant = 'full', style = {} }) {
  const links = [
    { name: 'Telegram', url: 'https://t.me/diamondwallcoinofficial', icon: '💬', color: '#0088cc' },
    { name: 'Discord', url: 'https://discord.gg/uFxxrD857', icon: '🎮', color: '#5865F2' },
    { name: 'X (Twitter)', url: 'https://x.com/diamondwallcoin', icon: '🐦', color: '#000' },
    { name: 'Announcements', url: 'https://t.me/DIAMONDWALLCOINNEWS', icon: '📢', color: '#0088cc' },
  ];

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', ...style }}>
        {links.map(l => (
          <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
             style={{
               display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
               background: 'rgba(255,255,255,0.08)', border: `1px solid ${l.color}`,
               color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '999px',
               textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
             }}>
            <span>{l.icon}</span>
            <span>{l.name}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      ...style,
    }}>
      {links.map(l => (
        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
           style={{
             display: 'flex', alignItems: 'center', gap: '0.8rem',
             background: 'rgba(15,20,45,0.85)',
             border: `2px solid ${l.color}`,
             color: '#fff', padding: '1rem 1.2rem',
             borderRadius: '12px',
             textDecoration: 'none',
             fontWeight: 700,
             transition: 'transform 0.15s',
           }}
           onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
           onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <span style={{ fontSize: '1.8rem' }}>{l.icon}</span>
          <div>
            <div style={{ fontSize: '1rem' }}>{l.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Join now →</div>
          </div>
        </a>
      ))}
    </div>
  );
}
