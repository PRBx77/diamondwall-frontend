import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { connectWallet, getProvider, getContracts, formatTokens, formatETH } from "./utils/web3";
import { LanguageProvider, useLang } from "./i18n/LanguageContext";
import Home from "./pages/Home";
import Presale from "./pages/Presale";
import Staking from "./pages/Staking";
import Airdrop from "./pages/Airdrop";
import Admin from "./pages/Admin";
import Info from "./pages/Info";
import Pools from "./pages/Pools";
import Calculator from "./pages/Calculator";
import SplashScreen from "./SplashScreen";
import "./App.css";

function AppContent() {
  const { t, toggleLang } = useLang();
  const [splash, setSplash] = useState(window.location.pathname === '/' || window.location.pathname === '');
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [isOwner, setIsOwner] = useState(false);

  const connect = async () => {
    try {
      const { signer, account } = await connectWallet();
      setAccount(account);
      setSigner(signer);
      await loadBalances(account);
      await checkOwner(account);
    } catch (err) { alert(err.message); }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setBalance("0");
    setEthBalance("0");
    setIsOwner(false);
  };

  const checkOwner = async (addr) => {
    try {
      const provider = getProvider();
      const contracts = getContracts(provider);
      const owner = await contracts.token.owner();
      setIsOwner(owner.toLowerCase() === addr.toLowerCase());
    } catch (e) { console.error(e); }
  };

  const loadBalances = async (addr) => {
    try {
      const provider = getProvider();
      const contracts = getContracts(provider);
      const bal = await contracts.token.balanceOf(addr);
      const eth = await provider.getBalance(addr);
      setBalance(formatTokens(bal));
      setEthBalance(formatETH(eth));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accs) => {
        if (accs.length > 0) { setAccount(accs[0]); loadBalances(accs[0]); checkOwner(accs[0]); }
        else disconnect();
      });
    }
  }, []);

  if (splash) return <SplashScreen onEnter={() => setSplash(false)} />;

  return (
    <div className="app" style={{ position:'relative', minHeight:'100vh' }}>
      <div style={{
        position:'fixed', top:0, left:0, width:'100%', height:'100%',
        backgroundImage:'url(/hero.jpg)', backgroundSize:'cover',
        backgroundPosition:'center', backgroundRepeat:'no-repeat',
        transform:'scaleX(2.4)', mixBlendMode:'lighten',
        opacity:0.15, zIndex:0, pointerEvents:'none'
      }} />
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/logo.jpg" alt="DiamondWall" className="nav-logo" />
          <span>DiamondWall</span>
        </div>
        <div className="nav-links">
          <NavLink to="/">{t("nav_home")}</NavLink>
          <NavLink to="/presale">{t("nav_presale")}</NavLink>
          <NavLink to="/airdrop">Airdrop</NavLink>
          <NavLink to="/staking">{t("nav_staking")}</NavLink>
          <NavLink to="/pools">Pools</NavLink>
          <NavLink to="/info">{t("nav_info")}</NavLink>
          {isOwner && <NavLink to="/admin">{t("nav_admin")}</NavLink>}
          <button onClick={toggleLang} className="lang-btn">{t("lang_switch")}</button>
        </div>
        <div className="nav-wallet">
          {account ? (
            <div className="wallet-info">
              <span className="wallet-balance">{balance} DWALL</span>
              <span className="wallet-eth">{ethBalance} BNB</span>
              <span className="wallet-addr">{account.slice(0,6)}...{account.slice(-4)}</span>
              <button onClick={disconnect} className="btn-disconnect">✕</button>
            </div>
          ) : (
            <button onClick={connect} className="btn-connect">{t("nav_connect")}</button>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home account={account} />} />
          <Route path="/presale" element={<Presale account={account} signer={signer} onUpdate={() => loadBalances(account)} />} />
          <Route path="/airdrop" element={<Airdrop account={account} signer={signer} onUpdate={() => loadBalances(account)} />} />
          <Route path="/staking" element={<Staking account={account} signer={signer} onUpdate={() => loadBalances(account)} />} />
          <Route path="/pools" element={<Pools account={account} signer={signer} />} />
          <Route path="/info" element={<Info />} />
            <Route path="/calculator" element={<Calculator />} />
          {isOwner && <Route path="/admin" element={<Admin account={account} signer={signer} />} />}
        </Routes>
      </main>
      <footer className="footer"><p>{t("footer_text")}</p></footer>
 <Analytics />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
// lun 13 jul 2026 20:35:40 CEST
