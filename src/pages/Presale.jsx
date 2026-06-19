import { useState, useEffect } from "react";
import { getProvider, getContracts, formatTokens, formatETH } from "../utils/web3";
import { useLang } from "../i18n/LanguageContext";
import { ethers } from "ethers";

export default function Presale({ account, signer, onUpdate }) {
  const { t } = useLang();
  const [info, setInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadInfo(); }, [account]);

  const loadInfo = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);
      const pi = await c.presale.getPresaleInfo();
      setInfo({ price: pi[0].toString(), minBuy: ethers.formatEther(pi[1]), maxBuy: ethers.formatEther(pi[2]), raised: formatETH(pi[3]), sold: formatTokens(pi[4]), participants: pi[5].toString(), remaining: formatTokens(pi[6]), active: pi[7] });
      if (account) {
        const ui = await c.presale.getUserInfo(account);
        setUserInfo({ contribution: formatETH(ui[0]), tokens: formatTokens(ui[1]), participated: ui[2] });
      }
    } catch (e) { console.error(e); }
  };

  const buy = async () => {
    if (!signer || !amount) return;
    setLoading(true); setMsg(null);
    try {
      const c = getContracts(signer);
      const tx = await c.presale.buyTokens({ value: ethers.parseEther(amount) });
      await tx.wait();
      setMsg({ type: "success", text: `${t("presale_success")} ${(parseFloat(amount) * 620000).toLocaleString()} DWALL` });
      setAmount(""); await loadInfo(); onUpdate?.();
    } catch (e) { setMsg({ type: "error", text: e.reason || e.message }); }
    finally { setLoading(false); }
  };

  const tokensToReceive = amount ? (parseFloat(amount) * 620000).toLocaleString() : "0";

  return (
    <div>
      <h1 className="page-title">{t("presale_title")}</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value" style={{color:info?.active?'#10b981':'#ef4444'}}>{info?.active?t("stat_active"):t("stat_inactive")}</div><div className="stat-label">{t("presale_status")}</div></div>
        <div className="stat-card"><div className="stat-value">{info?.price}</div><div className="stat-label">{t("presale_price")}</div></div>
        <div className="stat-card"><div className="stat-value">{info?.raised} BNB</div><div className="stat-label">{t("stat_raised")}</div></div>
        <div className="stat-card"><div className="stat-value">{info?.participants}</div><div className="stat-label">{t("stat_participants")}</div></div>
      </div>
      <div className="card">
        <div className="card-title">{t("presale_buy_title")}</div>
        {!account ? <div className="alert alert-info">{t("presale_connect")}</div>
        : !info?.active ? <div className="alert alert-error">{t("presale_not_active")}</div>
        : <>
          <div className="input-group">
            <label>{t("presale_amount")} (min: {info?.minBuy} | max: {info?.maxBuy})</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.1" />
          </div>
          <p style={{margin:'0.5rem 0',color:'#94a3b8'}}>{t("presale_receive")}: <strong style={{color:'#10b981'}}>{tokensToReceive} DWALL</strong></p>
          <button className="btn btn-primary" onClick={buy} disabled={loading || !amount}>{loading ? t("presale_processing") : t("presale_buy_btn")}</button>
        </>}
      </div>
      {userInfo?.participated && <div className="card">
        <div className="card-title">{t("presale_your")}</div>
        <p>{t("presale_contribution")}: <strong>{userInfo.contribution} BNB</strong></p>
        <p>{t("presale_received")}: <strong>{userInfo.tokens} DWALL</strong></p>
      </div>}
      <div className="card">
        <div className="card-title">{t("presale_details")}</div>
        <p>{t("presale_tokens_sold")}: <strong>{info?.sold} DWALL</strong></p>
        <p>{t("presale_remaining")}: <strong>{info?.remaining} DWALL</strong></p>
      </div>
    </div>
  );
}
