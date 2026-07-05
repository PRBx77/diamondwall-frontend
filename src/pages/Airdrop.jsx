import { useState, useEffect } from "react";
import { getProvider, getContracts, formatTokens } from "../utils/web3";
import { useLang } from "../i18n/LanguageContext";

const AIRDROP_AMOUNT = 100;
const MAX_CLAIMS = 250;

export default function Airdrop({ account, signer, onUpdate }) {
  const { lang } = useLang();
  const [stats, setStats] = useState(null);
  const [userClaimed, setUserClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetVerified, setTweetVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { loadStats(); }, [account]);

  const loadStats = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);
      const ps = await c.airdrop.getPublicClaimStats();
      const as2 = await c.airdrop.getAirdropStats();
      setStats({
        claimAmount: AIRDROP_AMOUNT,
        maxClaims: Number(ps[1]),
        totalClaimed: Number(ps[2]),
        claimsRemaining: Number(ps[3]),
        totalDistributed: formatTokens(as2[1]),
        totalRecipients: Number(as2[2]),
        remaining: formatTokens(as2[3])
      });
      if (account) {
        const info = await c.airdrop.getUserAirdropInfo(account);
        setUserClaimed(info[2]);
      }
    } catch (e) { console.error("loadStats error:", e); }
  };

  const buildTweetText = () => {
    const text = `🚀 Just joined the @diamondwallcoin airdrop! Claim 100 $DWALL free on BSC → diamondwallcoin.vercel.app/airdrop\n\n#DWALL #DeFi #BSC #Airdrop\n\nwallet: ${account}`;
    return encodeURIComponent(text);
  };

  const openTweet = () => {
    window.open(`https://twitter.com/intent/tweet?text=${buildTweetText()}`, '_blank');
  };

  const verifyTweet = async () => {
    if (!tweetUrl || !account) return;
    setVerifying(true); setMsg(null);
    try {
      const res = await fetch('/api/verify-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl, wallet: account })
      });
      const data = await res.json();
      if (data.ok) {
        setTweetVerified(true);
        setMsg({ type: "success", text: lang === "es" ? "✅ Tweet verificado. Ya puedes reclamar tu airdrop." : "✅ Tweet verified. You can now claim your airdrop." });
      } else {
        setMsg({ type: "error", text: data.error || (lang === "es" ? "Verificación fallida" : "Verification failed") });
      }
    } catch (e) {
      setMsg({ type: "error", text: (lang === "es" ? "Error de conexión: " : "Connection error: ") + e.message });
    } finally { setVerifying(false); }
  };

  const claimAirdrop = async () => {
    if (!signer || userClaimed || !tweetVerified) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const tx = await c.airdrop.claimAirdrop();
      await tx.wait();
      setMsg({ type: "success", text: lang === "es"
        ? `¡Has recibido ${AIRDROP_AMOUNT} DWALL! Ya están en tu wallet.`
        : `You received ${AIRDROP_AMOUNT} DWALL! They're in your wallet.` });
      setUserClaimed(true);
      await loadStats();
      onUpdate?.();
    } catch (e) {
      const reason = e.reason || e.message;
      if (reason.includes("AlreadyClaimed")) {
        setMsg({ type: "error", text: lang === "es" ? "Ya has reclamado tu airdrop" : "You already claimed your airdrop" });
        setUserClaimed(true);
      } else {
        setMsg({ type: "error", text: reason });
      }
    } finally { setLoading(false); }
  };

  const totalClaimed = stats?.totalClaimed || 0;
  const maxClaims = stats?.maxClaims || MAX_CLAIMS;
  const progress = maxClaims > 0 ? (totalClaimed / maxClaims) * 100 : 0;
  const soldOut = totalClaimed >= maxClaims;

  return (
    <div>
      <h1 className="page-title">{lang === "es" ? "🎁 Airdrop $DWALL" : "🎁 $DWALL Airdrop"}</h1>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card" style={{textAlign:'center',padding:'2rem',background:'linear-gradient(135deg,#1e293b,#0f172a)',borderTop:'3px solid #f59e0b'}}>
        <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🎁</div>
        <h2 style={{color:'#f59e0b',fontSize:'1.8rem',marginBottom:'0.5rem'}}>
          {lang === "es" ? "Airdrop Gratuito" : "Free Airdrop"}
        </h2>
        <p style={{color:'#94a3b8',fontSize:'1.1rem',marginBottom:'1rem'}}>
          {lang === "es"
            ? `Tuitea + reclama ${AIRDROP_AMOUNT} $DWALL gratis. Solo 1 tweet por wallet.`
            : `Tweet + claim ${AIRDROP_AMOUNT} $DWALL free. Only 1 tweet per wallet.`}
        </p>
        <div style={{display:'flex',justifyContent:'center',gap:'2rem',flexWrap:'wrap'}}>
          <div><div style={{color:'#f59e0b',fontSize:'1.8rem',fontWeight:700}}>{AIRDROP_AMOUNT}</div><div style={{color:'#94a3b8',fontSize:'0.85rem'}}>DWALL / wallet</div></div>
          <div><div style={{color:'#10b981',fontSize:'1.8rem',fontWeight:700}}>{(AIRDROP_AMOUNT * MAX_CLAIMS).toLocaleString()}</div><div style={{color:'#94a3b8',fontSize:'0.85rem'}}>{lang==="es"?"Total disponible":"Total available"}</div></div>
          <div><div style={{color:'#60a5fa',fontSize:'1.8rem',fontWeight:700}}>{MAX_CLAIMS}</div><div style={{color:'#94a3b8',fontSize:'0.85rem'}}>{lang==="es"?"Wallets máximo":"Max wallets"}</div></div>
        </div>
      </div>

      <div className="card" style={{marginTop:'1rem'}}>
        <div className="card-title">{lang==="es"?"📊 Progreso":"📊 Progress"}</div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
          <span style={{color:'#94a3b8'}}>{totalClaimed} / {maxClaims} {lang==="es"?"reclamados":"claimed"}</span>
          <span style={{color:soldOut?'#ef4444':'#10b981',fontWeight:600}}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{background:'#1e293b',borderRadius:'8px',height:'12px',overflow:'hidden'}}>
          <div style={{width:`${Math.min(progress,100)}%`,height:'100%',borderRadius:'8px',background:soldOut?'#ef4444':'linear-gradient(90deg,#10b981,#f59e0b)',transition:'width 0.5s'}}></div>
        </div>
        <div className="stats-grid" style={{marginTop:'1rem'}}>
          <div className="stat-card"><div className="stat-value">{stats?.totalDistributed||"0"}</div><div className="stat-label">{lang==="es"?"Distribuidos":"Distributed"}</div></div>
          <div className="stat-card"><div className="stat-value">{stats?.totalRecipients||0}</div><div className="stat-label">Wallets</div></div>
          <div className="stat-card"><div className="stat-value">{stats?.remaining||"0"}</div><div className="stat-label">{lang==="es"?"Restantes":"Remaining"}</div></div>
        </div>
      </div>

      <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
        {!account ? (
          <div>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🔗</div>
            <p style={{color:'#94a3b8',fontSize:'1.1rem'}}>{lang==="es"?"Conecta tu wallet para reclamar":"Connect your wallet to claim"}</p>
          </div>
        ) : soldOut ? (
          <div>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>⛔</div>
            <p style={{color:'#ef4444',fontSize:'1.1rem',fontWeight:600}}>{lang==="es"?"Airdrop agotado":"Airdrop sold out"}</p>
          </div>
        ) : userClaimed ? (
          <div>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>✅</div>
            <p style={{color:'#10b981',fontSize:'1.1rem',fontWeight:600}}>
              {lang==="es"?`Ya reclamaste tus ${AIRDROP_AMOUNT} DWALL`:`You already claimed your ${AIRDROP_AMOUNT} DWALL`}
            </p>
          </div>
        ) : (
          <div>
            {!tweetVerified && (
              <>
                <div style={{marginBottom:'1.5rem'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🐦 {lang==="es"?"Paso 1: Tuitea":"Step 1: Tweet"}</div>
                  <button className="btn" onClick={openTweet}
                    style={{padding:'0.8rem 2rem',fontSize:'1rem',background:'#1DA1F2',color:'#fff',border:'none',borderRadius:'8px',fontWeight:600}}>
                    {lang==="es"?"📢 Abrir tweet pre-formateado":"📢 Open pre-formatted tweet"}
                  </button>
                </div>
                <div>
                  <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🔗 {lang==="es"?"Paso 2: Pega el link del tweet":"Step 2: Paste tweet link"}</div>
                  <input type="text" value={tweetUrl} onChange={e => setTweetUrl(e.target.value)}
                    placeholder="https://x.com/tu_usuario/status/..."
                    style={{width:'100%',maxWidth:'500px',padding:'0.8rem',fontSize:'0.95rem',background:'#0f172a',color:'#f1f5f9',border:'1px solid #334155',borderRadius:'8px',marginBottom:'0.8rem'}} />
                  <br/>
                  <button className="btn" onClick={verifyTweet} disabled={!tweetUrl || verifying}
                    style={{padding:'0.8rem 2rem',fontSize:'1rem',background:'#10b981',color:'#fff',border:'none',borderRadius:'8px',fontWeight:600,opacity:(!tweetUrl||verifying)?0.5:1}}>
                    {verifying ? (lang==="es"?"Verificando...":"Verifying...") : (lang==="es"?"✅ Verificar tweet":"✅ Verify tweet")}
                  </button>
                </div>
              </>
            )}
            {tweetVerified && (
              <div>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🎉</div>
                <p style={{color:'#f1f5f9',fontSize:'1.1rem',marginBottom:'1rem'}}>
                  {lang==="es"?`¡Reclama tus ${AIRDROP_AMOUNT} $DWALL!`:`Claim your ${AIRDROP_AMOUNT} $DWALL!`}
                </p>
                <button className="btn btn-primary" onClick={claimAirdrop} disabled={loading}
                  style={{padding:'1rem 3rem',fontSize:'1.1rem',background:'linear-gradient(135deg,#f59e0b,#ec4899)',border:'none'}}>
                  {loading?(lang==="es"?"Procesando...":"Processing..."):(lang==="es"?`🎁 Reclamar ${AIRDROP_AMOUNT} DWALL`:`🎁 Claim ${AIRDROP_AMOUNT} DWALL`)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{marginTop:'1rem'}}>
        <div className="card-title">{lang==="es"?"ℹ️ ¿Cómo funciona?":"ℹ️ How does it work?"}</div>
        <div className="steps-grid">
          <div className="step"><div className="step-number">1</div><div className="step-title">{lang==="es"?"Conecta":"Connect"}</div><div className="step-desc">{lang==="es"?"Conecta tu wallet":"Connect your wallet"}</div></div>
          <div className="step"><div className="step-number">2</div><div className="step-title">{lang==="es"?"Tuitea":"Tweet"}</div><div className="step-desc">{lang==="es"?"Publica el tweet pre-formateado":"Post the pre-formatted tweet"}</div></div>
          <div className="step"><div className="step-number">3</div><div className="step-title">{lang==="es"?"Verifica":"Verify"}</div><div className="step-desc">{lang==="es"?"Pega el link del tweet":"Paste tweet link"}</div></div>
          <div className="step"><div className="step-number">4</div><div className="step-title">{lang==="es"?"Reclama":"Claim"}</div><div className="step-desc">{lang==="es"?"100 DWALL directo a tu wallet":"100 DWALL straight to wallet"}</div></div>
        </div>
      </div>
    </div>
  );
}
