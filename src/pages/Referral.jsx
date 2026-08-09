import { useState, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { getProvider, getContracts, formatTokens } from "../utils/web3";
import { ethers } from "ethers";

const REFERRAL_ACTIVE = true;
const CODES_PER_PAGE = 20;

export default function Referral({ account, signer }) {
  const { lang } = useLang();
  const [globalStats, setGlobalStats] = useState(null);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [availableStart, setAvailableStart] = useState(0);
  const [myCode, setMyCode] = useState("");
  const [myStats, setMyStats] = useState(null);
  const [claimable, setClaimable] = useState("0");
  const [pending, setPending] = useState("0");
  const [vestingActive, setVestingActive] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const bgStyle = { minHeight: "100vh", padding: "2rem 1rem", color: "#fff" };
  const cardStyle = {
    background: "rgba(15,20,45,0.88)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    maxWidth: "900px",
    margin: "0 auto 1.5rem",
  };

  useEffect(() => { loadAll(); }, [account]);

  const loadAll = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);
      
      // Global stats
      const total = await c.referralRegistry.totalCodesCreated();
      const claimed = await c.referralRegistry.getClaimedCodesCount();
      const vStart = await c.referralRegistry.vestingStartTime();
      setGlobalStats({
        total: Number(total),
        claimed: Number(claimed),
        available: Number(total) - Number(claimed),
      });
      setVestingActive(vStart > 0n);

      // Load available codes (first 20)
      const avail = await c.referralRegistry.getAvailableCodesPaginated(0, CODES_PER_PAGE);
      setAvailableCodes(avail);

      // User-specific data
      if (account) {
        const userCode = await c.referralRegistry.getMyCode(account);
        if (userCode && userCode.length > 0) {
          setMyCode(userCode);
          const data = await c.referralRegistry.getCodeData(userCode);
          setMyStats({
            uniqueWallets: Number(data[3]),
            totalBnbBrought: ethers.formatEther(data[4]),
            totalCommissionBnb: ethers.formatEther(data[6]),
            commissionClaimed: ethers.formatEther(data[7]),
          });

          if (vStart > 0n) {
            const cl = await c.referralRegistry.getClaimableAmount(userCode);
            const pe = await c.referralRegistry.getPendingCommission(userCode);
            setClaimable(ethers.formatEther(cl));
            setPending(ethers.formatEther(pe));
          } else {
            const totalTokens = await c.referralRegistry.getCommissionInTokens(userCode);
            setPending(ethers.formatEther(totalTokens));
          }
        }
      }
    } catch (e) {
      console.error("Referral loadAll error:", e);
    }
  };

  const handleClaimCode = async () => {
    if (!signer || !selectedCode) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const tx = await c.referralRegistry.claimCode(selectedCode);
      await tx.wait();
      setMsg({ type: "success", text: `✓ ${selectedCode} ${lang==="es"?"reclamado":"claimed"}!` });
      setSelectedCode("");
      await loadAll();
    } catch (e) {
      setMsg({ type: "error", text: e.reason || e.shortMessage || e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCommission = async () => {
    if (!signer || !myCode) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const tx = await c.referralRegistry.claimCommission(myCode);
      await tx.wait();
      setMsg({ type: "success", text: lang==="es"?"✓ Comisión reclamada!":"✓ Commission claimed!" });
      await loadAll();
    } catch (e) {
      setMsg({ type: "error", text: e.reason || e.shortMessage || e.message });
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/presale?ref=${myCode}`;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setMsg({ type: "success", text: lang==="es"?"✓ Link copiado":"✓ Link copied" });
  };

  const loadMoreAvailable = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);
      const nextStart = availableStart + CODES_PER_PAGE;
      const more = await c.referralRegistry.getAvailableCodesPaginated(nextStart, CODES_PER_PAGE);
      setAvailableCodes([...availableCodes, ...more]);
      setAvailableStart(nextStart);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={bgStyle}>
      <h1 className="page-title" style={{ textAlign: "center", fontSize: "2rem" }}>
        💎 DiamondWall Referral Program
      </h1>

      {msg && <div style={{...cardStyle, background: msg.type==="success"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)", border:`1px solid ${msg.type==="success"?"#10b981":"#ef4444"}`}}>
        {msg.text}
      </div>}

      {/* Global Stats */}
      {globalStats && (
        <div style={cardStyle}>
          <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.3rem" }}>
            📊 {lang==="es"?"Estado del Programa":"Program Status"}
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"1rem"}}>
            <div style={{textAlign:"center",padding:"1rem",background:"rgba(16,185,129,0.1)",borderRadius:"8px"}}>
              <div style={{fontSize:"1.8rem",fontWeight:800,color:"#10b981"}}>{globalStats.available}</div>
              <div style={{fontSize:"0.85rem",color:"#94a3b8"}}>{lang==="es"?"Disponibles":"Available"}</div>
            </div>
            <div style={{textAlign:"center",padding:"1rem",background:"rgba(245,158,11,0.1)",borderRadius:"8px"}}>
              <div style={{fontSize:"1.8rem",fontWeight:800,color:"#f59e0b"}}>{globalStats.claimed}</div>
              <div style={{fontSize:"0.85rem",color:"#94a3b8"}}>{lang==="es"?"Reclamados":"Claimed"}</div>
            </div>
            <div style={{textAlign:"center",padding:"1rem",background:"rgba(139,92,246,0.1)",borderRadius:"8px"}}>
              <div style={{fontSize:"1.8rem",fontWeight:800,color:"#8b5cf6"}}>{globalStats.total}</div>
              <div style={{fontSize:"0.85rem",color:"#94a3b8"}}>{lang==="es"?"Total":"Total"}</div>
            </div>
            <div style={{textAlign:"center",padding:"1rem",background:"rgba(236,72,153,0.1)",borderRadius:"8px"}}>
              <div style={{fontSize:"1.8rem",fontWeight:800,color:"#ec4899"}}>5%</div>
              <div style={{fontSize:"0.85rem",color:"#94a3b8"}}>{lang==="es"?"Comisión":"Commission"}</div>
            </div>
          </div>
        </div>
      )}

      {/* My Dashboard */}
      {account && myCode && (
        <div style={{...cardStyle, border:"2px solid #10b981"}}>
          <h2 style={{ color: "#10b981", marginBottom: "1rem", fontSize: "1.3rem" }}>
            🎯 {lang==="es"?"Mi Código":"My Code"}
          </h2>
          <div style={{fontSize:"1.8rem",fontWeight:800,color:"#f59e0b",textAlign:"center",marginBottom:"1rem"}}>
            {myCode}
          </div>
          
          <div style={{background:"rgba(0,0,0,0.3)",padding:"0.8rem",borderRadius:"8px",marginBottom:"1rem",wordBreak:"break-all",fontSize:"0.85rem"}}>
            {shareUrl}
          </div>
          <button onClick={copyLink} className="btn btn-primary" style={{width:"100%",marginBottom:"1rem"}}>
            📋 {lang==="es"?"Copiar Link":"Copy Link"}
          </button>

          {myStats && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"0.8rem",marginBottom:"1rem"}}>
              <div style={{padding:"0.8rem",background:"rgba(15,20,45,0.5)",borderRadius:"8px",textAlign:"center"}}>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:"#10b981"}}>{myStats.uniqueWallets}</div>
                <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>{lang==="es"?"Wallets Referidas":"Referred Wallets"}</div>
              </div>
              <div style={{padding:"0.8rem",background:"rgba(15,20,45,0.5)",borderRadius:"8px",textAlign:"center"}}>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:"#f59e0b"}}>{parseFloat(myStats.totalBnbBrought).toFixed(3)}</div>
                <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>BNB {lang==="es"?"Captado":"Brought"}</div>
              </div>
              <div style={{padding:"0.8rem",background:"rgba(15,20,45,0.5)",borderRadius:"8px",textAlign:"center"}}>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:"#8b5cf6"}}>{parseFloat(myStats.totalCommissionBnb).toFixed(4)}</div>
                <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>BNB {lang==="es"?"Comisión":"Commission"}</div>
              </div>
              <div style={{padding:"0.8rem",background:"rgba(15,20,45,0.5)",borderRadius:"8px",textAlign:"center"}}>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:"#ec4899"}}>{parseFloat(pending).toFixed(2)}</div>
                <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>DWALL {lang==="es"?"Pendiente":"Pending"}</div>
              </div>
            </div>
          )}

          {vestingActive ? (
            <div>
              <div style={{padding:"1rem",background:"rgba(16,185,129,0.15)",borderRadius:"8px",marginBottom:"0.8rem",textAlign:"center"}}>
                <div style={{fontSize:"0.9rem",color:"#94a3b8",marginBottom:"0.3rem"}}>{lang==="es"?"Disponible para reclamar":"Available to claim"}</div>
                <div style={{fontSize:"1.6rem",fontWeight:800,color:"#10b981"}}>{parseFloat(claimable).toFixed(2)} DWALL</div>
              </div>
              <button onClick={handleClaimCommission} disabled={loading || parseFloat(claimable)===0} className="btn btn-primary" style={{width:"100%"}}>
                {loading ? "..." : `💰 ${lang==="es"?"Reclamar Comisión":"Claim Commission"}`}
              </button>
            </div>
          ) : (
            <div style={{padding:"1rem",background:"rgba(245,158,11,0.1)",borderRadius:"8px",textAlign:"center",fontSize:"0.9rem",color:"#f59e0b"}}>
              ⏳ {lang==="es"?"Vesting inactivo. Se activará cuando abra el trading en DEX.":"Vesting inactive. Will activate when DEX trading opens."}
            </div>
          )}
        </div>
      )}

      {/* Claim Code UI */}
      {REFERRAL_ACTIVE && account && !myCode && (
        <div style={cardStyle}>
          <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.3rem" }}>
            🎫 {lang==="es"?"Reclama Tu Código":"Claim Your Code"}
          </h2>
          <p style={{color:"#94a3b8",marginBottom:"1rem",fontSize:"0.9rem"}}>
            {lang==="es"?"Elige un código disponible. Se asignará permanentemente a tu wallet.":"Choose an available code. It will be permanently assigned to your wallet."}
          </p>
          
          {selectedCode && (
            <div style={{padding:"1rem",background:"rgba(16,185,129,0.15)",border:"1px solid #10b981",borderRadius:"8px",marginBottom:"1rem",textAlign:"center"}}>
              <div style={{color:"#94a3b8",fontSize:"0.85rem",marginBottom:"0.5rem"}}>{lang==="es"?"Código seleccionado:":"Selected code:"}</div>
              <div style={{fontSize:"1.4rem",fontWeight:800,color:"#f59e0b",marginBottom:"0.8rem"}}>{selectedCode}</div>
              <button onClick={handleClaimCode} disabled={loading} className="btn btn-primary" style={{marginRight:"0.5rem"}}>
                {loading ? "..." : `✓ ${lang==="es"?"Confirmar":"Confirm Claim"}`}
              </button>
              <button onClick={() => setSelectedCode("")} className="btn" style={{background:"#334155",color:"#fff"}}>
                {lang==="es"?"Cancelar":"Cancel"}
              </button>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"0.5rem"}}>
            {availableCodes.map(code => (
              <button
                key={code}
                onClick={() => setSelectedCode(code)}
                style={{
                  padding:"0.7rem",
                  background: selectedCode === code ? "#10b981" : "rgba(15,20,45,0.6)",
                  border: selectedCode === code ? "2px solid #10b981" : "1px solid #334155",
                  borderRadius:"8px",
                  color:"#fff",
                  fontSize:"0.85rem",
                  fontWeight:600,
                  cursor:"pointer",
                }}
              >
                {code}
              </button>
            ))}
          </div>
          {availableCodes.length >= CODES_PER_PAGE && (
            <button onClick={loadMoreAvailable} className="btn" style={{width:"100%",marginTop:"1rem",background:"#334155",color:"#fff"}}>
              {lang==="es"?"Cargar más":"Load more"}
            </button>
          )}
        </div>
      )}

      {REFERRAL_ACTIVE && !account && (
        <div style={cardStyle}>
          <p style={{ color: "#f59e0b", textAlign: "center", fontSize:"1.1rem" }}>
            ⚠️ {lang==="es"?"Conecta tu wallet para reclamar un código":"Connect your wallet to claim a code"}
          </p>
        </div>
      )}

      {/* How it works */}
      <div style={cardStyle}>
        <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.3rem" }}>
          📋 {lang === "es" ? "Cómo funciona" : "How it works"}
        </h2>
        <ol style={{ lineHeight: 1.9, paddingLeft: "1.5rem", color: "#e2e8f0" }}>
          <li>{lang === "es" ? "Conecta tu wallet y reclama un código disponible" : "Connect your wallet and claim an available code"}</li>
          <li>{lang === "es" ? "Comparte tu link único con tu comunidad" : "Share your unique link with your community"}</li>
          <li>{lang === "es" ? "Ganas 5% de comisión en $DWALL por cada compra referida" : "Earn 5% commission in $DWALL for every referred purchase"}</li>
          <li>{lang === "es" ? "Los tokens se liberan durante 4 meses tras abrir DEX" : "Tokens vest over 4 months after DEX opens"}</li>
        </ol>
      </div>

      {/* Rules */}
      <div style={cardStyle}>
        <h2 style={{ color: "#ec4899", marginBottom: "1rem", fontSize: "1.3rem" }}>
          📜 {lang === "es" ? "Reglas" : "Rules"}
        </h2>
        <ul style={{ lineHeight: 1.8, paddingLeft: "1.5rem", color: "#e2e8f0", fontSize: "0.95rem" }}>
          <li>{lang === "es" ? "Un código por wallet, permanente e intransferible" : "One code per wallet, permanent"}</li>
          <li>{lang === "es" ? "Auto-referral bloqueado a nivel de contrato" : "Self-referral blocked at contract level"}</li>
          <li>{lang === "es" ? "Comisión pagada en $DWALL al precio de presale" : "Commission paid in $DWALL at presale price"}</li>
          <li>{lang === "es" ? "Vesting 4 meses lineal tras abrir trading en DEX" : "4-month linear vesting after DEX opens"}</li>
          <li>{lang === "es" ? "Códigos abusivos pueden ser deshabilitados" : "Abusive codes can be disabled"}</li>
        </ul>
      </div>
    </div>
  );
}
