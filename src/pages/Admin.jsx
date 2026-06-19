import { useState, useEffect } from "react";
import { getProvider, getContracts, formatTokens, formatETH } from "../utils/web3";
import { ethers } from "ethers";

export default function Admin({ account, signer }) {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [presaleInfo, setPresaleInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [stakingInfo, setStakingInfo] = useState(null);
  const [treasuryInfo, setTreasuryInfo] = useState(null);
  const [airdropInfo, setAirdropInfo] = useState(null);

  useEffect(() => { if (account) loadAll(); }, [account]);

  const loadAll = async () => {
    try {
      const provider = getProvider();
      const c = getContracts(provider);

      const owner = await c.token.owner();
      setIsOwner(owner.toLowerCase() === account?.toLowerCase());

      const ti = await c.token.getTokenInfo();
      setTokenInfo({ name: ti[0], symbol: ti[1], supply: formatTokens(ti[2]), maxTransfer: formatTokens(ti[3]), maxWallet: formatTokens(ti[4]), presaleEnabled: ti[5], tradingEnabled: ti[6], paused: ti[7] });

      const pi = await c.presale.getPresaleInfo();
      setPresaleInfo({ price: pi[0].toString(), minBuy: ethers.formatEther(pi[1]), maxBuy: ethers.formatEther(pi[2]), raised: formatETH(pi[3]), sold: formatTokens(pi[4]), participants: pi[5].toString(), remaining: formatTokens(pi[6]), active: pi[7] });

      const si = await c.staking.getStakingInfo();
      setStakingInfo({ totalStaked: formatTokens(si[0]), stakers: si[1].toString(), rewardRate: ethers.formatUnits(si[2], 18), minStake: formatTokens(si[3]), rewardPool: formatTokens(si[4]) });

      const ts = await c.treasury.getTreasuryStats();
      setTreasuryInfo({ received: formatETH(ts[0]), invested: formatETH(ts[1]), yields: formatETH(ts[2]), balance: formatETH(ts[3]) });

      const as2 = await c.airdrop.getAirdropStats();
      setAirdropInfo({ campaigns: as2[0].toString(), distributed: formatTokens(as2[1]), recipients: as2[2].toString(), remaining: formatTokens(as2[3]) });
    } catch (e) { console.error(e); }
  };

  const exec = async (fn, successMsg) => {
    setLoading(true); setMsg(null);
    try {
      const tx = await fn();
      await tx.wait();
      setMsg({ type: "success", text: successMsg });
      await loadAll();
    } catch (e) {
      setMsg({ type: "error", text: e.reason || e.message });
    } finally { setLoading(false); }
  };

  if (!account) return <div className="alert alert-info">Conecta tu wallet para acceder al Admin Panel</div>;
  if (!isOwner) return <div className="alert alert-error">Acceso denegado</div>;

  return (
    <div>
      <h1 className="page-title">⚙️ Admin Panel</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* TOKEN */}
      <div className="admin-section">
        <div className="card">
          <div className="card-title">🪙 Token Controls</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{tokenInfo?.supply}</div><div className="stat-label">Supply</div></div>
            <div className="stat-card"><div className="stat-value" style={{color:tokenInfo?.presaleEnabled?'#10b981':'#ef4444'}}>{tokenInfo?.presaleEnabled?'ON':'OFF'}</div><div className="stat-label">Presale Mode</div></div>
            <div className="stat-card"><div className="stat-value" style={{color:tokenInfo?.tradingEnabled?'#10b981':'#ef4444'}}>{tokenInfo?.tradingEnabled?'ON':'OFF'}</div><div className="stat-label">Trading</div></div>
            <div className="stat-card"><div className="stat-value" style={{color:tokenInfo?.paused?'#ef4444':'#10b981'}}>{tokenInfo?.paused?'PAUSED':'ACTIVE'}</div><div className="stat-label">Estado</div></div>
          </div>
          <div className="flex-row">
            <button className="btn btn-primary" disabled={loading} onClick={() => {
              const c = getContracts(signer);
              exec(() => c.token.setPresaleEnabled(!tokenInfo?.presaleEnabled), `Presale ${tokenInfo?.presaleEnabled ? 'deshabilitada' : 'habilitada'}`);
            }}>Toggle Presale</button>
            <button className="btn btn-primary" disabled={loading} onClick={() => {
              const c = getContracts(signer);
              exec(() => c.token.setTradingEnabled(!tokenInfo?.tradingEnabled), `Trading ${tokenInfo?.tradingEnabled ? 'deshabilitado' : 'habilitado'}`);
            }}>Toggle Trading</button>
            <button className="btn btn-warning" disabled={loading} onClick={() => {
              const c = getContracts(signer);
              exec(() => tokenInfo?.paused ? c.token.unpause() : c.token.pause(), `Token ${tokenInfo?.paused ? 'despausado' : 'pausado'}`);
            }}>{tokenInfo?.paused ? 'Unpause' : 'Pause'} Token</button>
          </div>
        </div>
      </div>

      {/* PRESALE */}
      <div className="admin-section">
        <div className="card">
          <div className="card-title">🚀 Presale Controls</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value" style={{color:presaleInfo?.active?'#10b981':'#ef4444'}}>{presaleInfo?.active?'ACTIVA':'INACTIVA'}</div><div className="stat-label">Estado</div></div>
            <div className="stat-card"><div className="stat-value">{presaleInfo?.raised} BNB</div><div className="stat-label">Recaudado</div></div>
            <div className="stat-card"><div className="stat-value">{presaleInfo?.sold}</div><div className="stat-label">Tokens Vendidos</div></div>
            <div className="stat-card"><div className="stat-value">{presaleInfo?.remaining}</div><div className="stat-label">Restantes</div></div>
          </div>
          <div className="flex-row">
            <button className="btn btn-primary" disabled={loading} onClick={() => {
              const c = getContracts(signer);
              exec(() => presaleInfo?.active ? c.presale.stopPresale() : c.presale.startPresale(), `Presale ${presaleInfo?.active ? 'detenida' : 'iniciada'}`);
            }}>{presaleInfo?.active ? 'Stop' : 'Start'} Presale</button>
          </div>
        </div>
      </div>

      {/* STAKING */}
      <div className="admin-section">
        <div className="card">
          <div className="card-title">🔒 Staking Controls</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stakingInfo?.totalStaked}</div><div className="stat-label">Total Stakeado</div></div>
            <div className="stat-card"><div className="stat-value">{stakingInfo?.stakers}</div><div className="stat-label">Stakers</div></div>
            <div className="stat-card"><div className="stat-value">{stakingInfo?.rewardRate}</div><div className="stat-label">Reward Rate/s</div></div>
            <div className="stat-card"><div className="stat-value">{stakingInfo?.rewardPool}</div><div className="stat-label">Reward Pool</div></div>
          </div>
          <RewardRateForm signer={signer} exec={exec} loading={loading} />
        </div>
      </div>

      {/* TREASURY V4 */}
      <div className="admin-section">
        <div className="card">
          <div className="card-title">🏦 Treasury (Venus Automático)</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{treasuryInfo?.received} BNB</div><div className="stat-label">Total Recibido</div></div>
            <div className="stat-card"><div className="stat-value">{treasuryInfo?.invested} BNB</div><div className="stat-label">En Venus</div></div>
            <div className="stat-card"><div className="stat-value">{treasuryInfo?.yields} BNB</div><div className="stat-label">Yields Generados</div></div>
            <div className="stat-card"><div className="stat-value">{treasuryInfo?.balance} BNB</div><div className="stat-label">Balance</div></div>
          </div>
          <p style={{color:'#94a3b8', fontSize:'0.85rem', marginTop:'0.5rem'}}>
            El BNB de las ventas se deposita automáticamente en Venus Protocol. Los holders reclaman sus yields directamente sin intervención.
          </p>
        </div>
      </div>

      {/* LIQUIDITY POOLS */}
      <div className="admin-section">
        <div className="card">
          <div className="card-title">🏊 Pools de Liquidez (DEX)</div>
          <p style={{color:'#94a3b8', fontSize:'0.85rem', marginBottom:'1rem'}}>
            Crea y gestiona pools de liquidez en los principales DEX de BSC.
          </p>
          <LiquidityPoolsSection signer={signer} exec={exec} loading={loading} />
        </div>
      </div>

      {/* AIRDROP */}
      <div className="admin-section">
        <div className="card">
          <div className="card-title">🎁 Airdrop Controls</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{airdropInfo?.campaigns}</div><div className="stat-label">Campañas</div></div>
            <div className="stat-card"><div className="stat-value">{airdropInfo?.distributed}</div><div className="stat-label">Distribuidos</div></div>
            <div className="stat-card"><div className="stat-value">{airdropInfo?.recipients}</div><div className="stat-label">Destinatarios</div></div>
            <div className="stat-card"><div className="stat-value">{airdropInfo?.remaining}</div><div className="stat-label">Restantes</div></div>
          </div>
          <AirdropForm signer={signer} exec={exec} loading={loading} />
        </div>
      </div>
    </div>
  );
}

function RewardRateForm({ signer, exec, loading }) {
  const [rate, setRate] = useState("");
  const [depositAmt, setDepositAmt] = useState("");
  return (
    <div className="admin-grid">
      <div>
        <div className="input-group">
          <label>Reward Rate (tokens/segundo)</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="1" />
        </div>
        <button className="btn btn-primary" disabled={loading || !rate} onClick={() => {
          const c = getContracts(signer);
          exec(() => c.staking.setRewardRate(ethers.parseUnits(rate, 18)), `Rate actualizado a ${rate}/s`);
          setRate("");
        }}>Set Rate</button>
      </div>
      <div>
        <div className="input-group">
          <label>Depositar Rewards (DWALL)</label>
          <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder="100000" />
        </div>
        <button className="btn btn-primary" disabled={loading || !depositAmt} onClick={async () => {
          const c = getContracts(signer);
          const amount = ethers.parseUnits(depositAmt, 18);
          const allowance = await c.token.allowance(await signer.getAddress(), await c.staking.getAddress());
          if (allowance < amount) {
            const appTx = await c.token.approve(await c.staking.getAddress(), ethers.MaxUint256);
            await appTx.wait();
          }
          exec(() => c.staking.depositRewards(amount), `${depositAmt} DWALL depositados como rewards`);
          setDepositAmt("");
        }}>Depositar</button>
      </div>
    </div>
  );
}

function AirdropForm({ signer, exec, loading }) {
  const [addr, setAddr] = useState("");
  const [amt, setAmt] = useState("");
  return (
    <div style={{marginTop:'1rem'}}>
      <div className="admin-grid">
        <div className="input-group">
          <label>Dirección destino</label>
          <input type="text" value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x..." />
        </div>
        <div className="input-group">
          <label>Cantidad DWALL</label>
          <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="10000" />
        </div>
      </div>
      <button className="btn btn-primary" disabled={loading || !addr || !amt} onClick={() => {
        const c = getContracts(signer);
        exec(() => c.airdrop.singleAirdrop(addr, ethers.parseUnits(amt, 18)), `Airdrop de ${amt} DWALL enviado`);
        setAddr(""); setAmt("");
      }}>Enviar Airdrop</button>
    </div>
  );
}

function LiquidityPoolsSection({ signer, exec, loading }) {
  const [selectedDex, setSelectedDex] = useState("0");
  const [tokenAmt, setTokenAmt] = useState("");
  const [bnbAmt, setBnbAmt] = useState("");

  const dexNames = ["PancakeSwap", "BiSwap", "ApeSwap", "BabySwap"];

  return (
    <div>
      <div className="pool-grid" style={{marginBottom:'1.5rem'}}>
        {dexNames.map((name, i) => (
          <div key={i} className="pool-card" style={{cursor:'pointer', border: selectedDex === String(i) ? '2px solid #f59e0b' : '2px solid transparent'}}
            onClick={() => setSelectedDex(String(i))}>
            <div className="pool-name">{name}</div>
            <div className="pool-detail">ID: <span>{i}</span></div>
            <div className="pool-detail">Estado: <span>Disponible</span></div>
          </div>
        ))}
      </div>

      <div className="card" style={{background:'#1e293b'}}>
        <div className="card-title">Crear Pool en {dexNames[parseInt(selectedDex)]}</div>
        <div className="admin-grid">
          <div className="input-group">
            <label>Cantidad DWALL</label>
            <input type="number" value={tokenAmt} onChange={e => setTokenAmt(e.target.value)} placeholder="1000000" />
          </div>
          <div className="input-group">
            <label>Cantidad BNB</label>
            <input type="number" value={bnbAmt} onChange={e => setBnbAmt(e.target.value)} placeholder="10" />
          </div>
        </div>
        <button className="btn btn-primary" disabled={loading || !tokenAmt || !bnbAmt} onClick={async () => {
          try {
            const c = getContracts(signer);
            const tAmt = ethers.parseUnits(tokenAmt, 18);
            const bAmt = ethers.parseEther(bnbAmt);
            // Aprobar tokens al LiquidityManager
            const allowance = await c.token.allowance(await signer.getAddress(), await c.liquidity.getAddress());
            if (allowance < tAmt) {
              const appTx = await c.token.approve(await c.liquidity.getAddress(), ethers.MaxUint256);
              await appTx.wait();
            }
            exec(() => c.liquidity.createPool(parseInt(selectedDex), tAmt, { value: bAmt }),
              `Pool creado en ${dexNames[parseInt(selectedDex)]} con ${tokenAmt} DWALL + ${bnbAmt} BNB`);
          } catch(e) { console.error(e); }
          setTokenAmt(""); setBnbAmt("");
        }}>Crear Pool</button>
      </div>
    </div>
  );
}
