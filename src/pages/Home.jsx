import { useState, useEffect } from "react";
import { getProvider, getContracts, formatTokens, formatETH } from "../utils/web3";
import { useLang } from "../i18n/LanguageContext";

export default function Home({ account }) {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); const i = setInterval(loadStats, 15000); return () => clearInterval(i); }, []);

  const loadStats = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);
      const [totalSupply, presaleInfo, stakingInfo, treasuryStats] = await Promise.all([
        c.token.totalSupply(), c.presale.getPresaleInfo(), c.staking.getStakingInfo(), c.treasury.getTreasuryStats()
      ]);
      setStats({
        totalSupply: formatTokens(totalSupply), presaleActive: presaleInfo[7],
        bnbRaised: formatETH(presaleInfo[3]), tokensSold: formatTokens(presaleInfo[4]),
        participants: presaleInfo[5].toString(), totalStaked: formatTokens(stakingInfo[0]),
        stakers: stakingInfo[1].toString(), treasuryBNB: formatETH(treasuryStats[3]),
        totalYields: formatETH(treasuryStats[2])
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="home-page">
      <div style={{
        position:'relative',
        width:'100%',
        minHeight:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        overflow:'hidden'
      }}>
        <img src="/hero.jpg" alt="DiamondWall Hero" style={{
          position:'absolute',
          top:0, left:0,
          width:'100%',
          height:'100%',
          objectFit:'cover', objectPosition:'center center', mixBlendMode:'lighten', transform:'scaleX(2.4)',
          zIndex:0
        }} />
        <div style={{
          position:'absolute',
          top:0, left:0,
          width:'100%',
          height:'100%',
          background:'rgba(0,0,0,0.55)',
          zIndex:1
        }} />
        <div style={{
          position:'relative',
          zIndex:2,
          textAlign:'center',
          padding:'2rem',
          color:'white'
        }}>
          
          <h1 style={{fontSize:'3.5rem',fontWeight:800,color:'#f59e0b',textShadow:'0 2px 20px rgba(0,0,0,0.8)',margin:'0 0 1rem'}}>DiamondWall</h1>
          <p style={{fontSize:'1.5rem',fontWeight:600,color:'#fff',textShadow:'0 2px 10px rgba(0,0,0,0.8)',margin:'0 0 1rem'}}>{t("home_tagline")}</p>
          <p style={{fontSize:'1.1rem',color:'rgba(255,255,255,0.85)',textShadow:'0 1px 8px rgba(0,0,0,0.8)',maxWidth:'600px',margin:'0 auto'}}>{t("home_description")}</p>
        </div>
      </div>
      <div className="card how-it-works">
        <div className="card-title">{t("home_how")}</div>
        <div className="steps-grid">
          {[1,2,3,4].map(n => (
            <div key={n} className="step">
              <div className="step-number">{n}</div>
              <div className="step-title">{t(`home_step${n}_title`)}</div>
              <div className="step-desc">{t(`home_step${n}_desc`)}</div>
            </div>
          ))}
        </div>
      </div>
      {!account && <div className="alert alert-info">{t("home_connect_msg")}</div>}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats?.totalSupply}</div><div className="stat-label">{t("stat_supply")}</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:stats?.presaleActive?'#10b981':'#ef4444'}}>{stats?.presaleActive?t("stat_active"):t("stat_inactive")}</div><div className="stat-label">{t("stat_presale")}</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.bnbRaised} BNB</div><div className="stat-label">{t("stat_raised")}</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.tokensSold}</div><div className="stat-label">{t("stat_sold")}</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.participants}</div><div className="stat-label">{t("stat_participants")}</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.totalStaked}</div><div className="stat-label">{t("stat_staked")}</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.treasuryBNB} BNB</div><div className="stat-label">{t("stat_treasury")}</div></div>
        <div className="stat-card"><div className="stat-value" style={{color:'#f59e0b'}}>{stats?.totalYields} BNB</div><div className="stat-label">{t("stat_yields")}</div></div>
      </div>
      <div className="card">
        <div className="card-title">{t("home_why")}</div>
        <div className="features-grid">
          {[1,2,3,4].map(n => (
            <div key={n} className="feature">
              <strong>{t(`home_feat${n}_title`)}</strong>
              <p>{t(`home_feat${n}_desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
