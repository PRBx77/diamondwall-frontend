export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { tweetUrl, wallet } = req.body || {};
  if (!tweetUrl || !wallet) return res.status(400).json({ ok: false, error: 'Missing tweetUrl or wallet' });

  const m = tweetUrl.match(/(?:x|twitter)\.com\/([^\/]+)\/status\/(\d+)/i);
  if (!m) return res.status(400).json({ ok: false, error: 'Invalid tweet URL' });
  const [, username, tweetId] = m;

  try {
    const oembed = await fetch(`https://publish.twitter.com/oembed?url=https://twitter.com/${username}/status/${tweetId}&omit_script=true`);
    if (!oembed.ok) return res.status(404).json({ ok: false, error: 'Tweet not found or private' });
    const data = await oembed.json();
    const html = (data.html || '').toLowerCase();
    const walletLower = wallet.toLowerCase();
    const walletShort = walletLower.slice(2, 10);

    const hasWallet = html.includes(walletLower) || html.includes(walletShort);
    const hasMention = html.includes('diamondwallcoin') || html.includes('$dwall') || html.includes('dwall');

    if (!hasWallet) return res.status(400).json({ ok: false, error: 'Tweet does not contain your wallet address' });
    if (!hasMention) return res.status(400).json({ ok: false, error: 'Tweet does not mention @diamondwallcoin or $DWALL' });

    return res.status(200).json({ ok: true, tweetId, username });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Verification failed: ' + err.message });
  }
}
