import { useState, useEffect } from "react";
import { getProvider, getContracts, formatTokens, formatETH } from "../utils/web3";
import { useLang } from "../i18n/LanguageContext";
import { ethers } from "ethers";

export default function Staking({ account, signer, onUpdate }) {
  const { t } = useLang();
  const [info, setInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [stakeAmt, setStakeAmt] = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadInfo(); }, [account]);
  useEffect(() => { const i = setInterval(loadInfo, 10000); return () => clearInterval(i); }, [account]);

  const loadInfo = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);
      const si = await c.staking.getStakingInfo();
      setInfo({ totalStaked: formatTokens(si[0]), totalStakers: si[1].toString(), rewardRate: ethers.formatUnits(si[2], 18), minStake: formatTokens(si[3]), rewardPool: formatTokens(si[4]) });
      if (account) {
        const ui = await c.staking.getUserStakeInfo(account);
        setUserInfo({ staked: formatTokens(ui[0]), stakedRaw: ui[0], pending: formatTokens(ui[1]), pendingRaw: ui[1], since: ui[2] > 0 ? new Date(Number(ui[2]) * 1000).toLocaleDateString() : "-" });
      }
    } catch (e) { console.error(e); }
  };

  const doStake = async () => {
    if (!signer || !stakeAmt) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const amount = ethers.parseUnits(stakeAmt, 18);
      const allowance = await c.token.allowance(account, await c.staking.getAddress());
      if (allowance < amount) { const a = await c.token.approve(await c.staking.getAddress(), ethers.MaxUint256); await a.wait(); }
      const tx = await c.staking.stake(amount); await tx.wait();
      setMsg({ type: "success", text: `${t("staking_stake_success")} ${stakeAmt} DWALL` });
      setStakeAmt(""); await loadInfo(); onUpdate?.();
    } catch (e) { setMsg({ type: "error", text: e.reason || e.message }); } finally { setLoading(false); }
  };

  const doUnstake = async () => {
    if (!signer || !unstakeAmt) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const tx = await c.staking.unstake(ethers.parseUnits(unstakeAmt, 18)); await tx.wait();
      setMsg({ type: "success", text: `${t("staking_unstake_success")} ${unstakeAmt} DWALL` });
      setUnstakeAmt(""); await loadInfo(); onUpdate?.();
    } catch (e) { setMsg({ type: "error", text: e.reason || e.message }); } finally { setLoading(false); }
  };

  const doClaim = async () => {
    if (!signer) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const tx = await c.staking.claimRewards(); await tx.wait();
      setMsg({ type: "success", text: t("staking_claim_success") });
      await loadInfo(); onUpdate?.();
    } catch (e) { setMsg({ type: "error", text: e.reason || e.message }); } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="page-title">{t("staking_title")}</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{info?.totalStaked}</div><div className="stat-label">{t("staking_total")}</div></div>
        <div className="stat-card"><div className="stat-value">{info?.totalStakers}</div><div className="stat-label">{t("stat_stakers")}</div></div>
        <div className="stat-card"><div className="stat-value">{info?.rewardPool}</div><div className="stat-label">{t("staking_pool")}</div></div>
        <div className="stat-card"><div className="stat-value">{info?.minStake}</div><div className="stat-label">{t("staking_min")}</div></div>
      </div>
      {account && userInfo && <div className="card">
        <div className="card-title">{t("staking_your")}</div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{userInfo.staked}</div><div className="stat-label">{t("staking_staked")}</div></div>
          <div className="stat-card"><div className="stat-value" style={{color:'#f59e0b'}}>{userInfo.pending}</div><div className="stat-label">{t("staking_pending")}</div></div>
          <div className="stat-card"><div className="stat-value" style={{fontSize:'1rem'}}>{userInfo.since}</div><div className="stat-label">{t("staking_since")}</div></div>
        </div>
        {userInfo.pendingRaw > 0n && <button className="btn btn-warning" onClick={doClaim} disabled={loading} style={{marginTop:'1rem'}}>{loading ? t("presale_processing") : t("staking_claim")}</button>}
      </div>}
      {!account ? <div className="alert alert-info">{t("staking_connect")}</div> :
      <div className="admin-grid">
        <div className="card">
          <div className="card-title">{t("staking_stake_title")}</div>
          <div className="input-group"><label>{t("staking_amount")}</label><input type="number" value={stakeAmt} onChange={e => setStakeAmt(e.target.value)} placeholder="1000" /></div>
          <button className="btn btn-primary" onClick={doStake} disabled={loading || !stakeAmt}>{loading ? t("presale_processing") : t("staking_stake_btn")}</button>
        </div>
        <div className="card">
          <div className="card-title">{t("staking_unstake_title")}</div>
          <div className="input-group"><label>{t("staking_amount")}</label><input type="number" value={unstakeAmt} onChange={e => setUnstakeAmt(e.target.value)} placeholder="1000" /></div>
          <button className="btn btn-danger" onClick={doUnstake} disabled={loading || !unstakeAmt}>{loading ? t("presale_processing") : t("staking_unstake_btn")}</button>
        </div>
      </div>}
    </div>
  );
}
