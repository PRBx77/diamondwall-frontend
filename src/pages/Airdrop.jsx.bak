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

  useEffect(() => { if (account) loadStats(); }, [account]);

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
        setUserClaimed(info[2]); // hasClaimedFree (3er valor)
      }
    } catch (e) { console.error("loadStats error:", e); }
  };

  const claimAirdrop = async () => {
    if (!signer || userClaimed) return;
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
            ? `Conecta tu wallet y recibe ${AIRDROP_AMOUNT} $DWALL gratis. Sin condiciones — tokens directo a tu wallet.`
            : `Connect your wallet and receive ${AIRDROP_AMOUNT} $DWALL for free. No conditions — tokens straight to your wallet.`}
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

      <div className="card" style={{marginTop:'1rem'}}>
        <div className="card-title">{lang==="es"?"ℹ️ ¿Cómo funciona?":"ℹ️ How does it work?"}</div>
        <div className="steps-grid">
          <div className="step"><div className="step-number">1</div><div className="step-title">{lang==="es"?"Conecta":"Connect"}</div><div className="step-desc">{lang==="es"?"Conecta tu wallet":"Connect your wallet"}</div></div>
          <div className="step"><div className="step-number">2</div><div className="step-title">{lang==="es"?"Reclama":"Claim"}</div><div className="step-desc">{lang==="es"?"Pulsa el botón y confirma":"Press button and confirm"}</div></div>
          <div className="step"><div className="step-number">3</div><div className="step-title">{lang==="es"?"Recibe":"Receive"}</div><div className="step-desc">{lang==="es"?"100 DWALL directo a tu wallet":"100 DWALL straight to wallet"}</div></div>
        </div>
      </div>
    </div>
  );
}
