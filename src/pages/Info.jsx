import { useState } from "react";
import { CONTRACTS } from "../utils/contracts";
import { useLang } from "../i18n/LanguageContext";

const WP_ES = [
  { title: "1. Introducción", content: "DiamondWall es una plataforma DeFi automatizada en Binance Smart Chain (BSC) que genera yields reales para sus holders. A diferencia de proyectos que prometen rendimientos insostenibles, $DWALL integra directamente con Venus Protocol para generar rendimientos verificables on-chain.\n\nEl objetivo es simple: que cada BNB invertido en $DWALL trabaje automáticamente generando rendimientos pasivos sin intervención humana." },
  { title: "2. Tokenomics", content: "Token: DiamondWallCoin ($DWALL)\nRed: Binance Smart Chain (BSC)\nSupply Total: 1,000,000,000 DWALL (fijo, sin mint adicional)\n\nDistribución:\n• Presale: 700,000,000 DWALL (70%)\n• Airdrop: 150,000,000 DWALL (15%)\n• Marketing Treasury (público on-chain): 100,000,000 DWALL (10%)\n• Wallet operativa del equipo: 50,000,000 DWALL (5%)\n\nPrecio Presale: 620,000 DWALL por 1 BNB" },
  { title: "3. Sistema de Yields", content: "Cuando un usuario compra $DWALL, el BNB se divide automáticamente:\n\n• 50% → Venus Protocol: Genera yields reales. Los holders reclaman su parte en cualquier momento.\n• 45% → Pools de Liquidez: Se distribuye automáticamente a PancakeSwap, BiSwap, ApeSwap y BabySwap.\n• 5% → Operaciones: Gas, mantenimiento y desarrollo." },
  { title: "4. Distribución Post-Presale", content: "Al cerrar la preventa, los tokens no vendidos se reparten automáticamente:\n\n• 70% → LiquidityManager (inmediato, 4 pools DEX)\n• 20% → Reserva CEX (timelock 6 meses, para futuros listados)\n• 10% → Drip mensual al LiquidityManager (12 meses lineales)\n\nReglas fijas, sin manipulación de precio: el calendario es público y verificable on-chain." },
  { title: "5. Protecciones", content: "✅ Supply Fijo: 1B tokens. No existe función mint().\n✅ Sin Blacklist ni Freeze.\n✅ Sin Fee Oculto: 0% comisión.\n✅ Trading Lock irreversible.\n✅ Anti-Ballena: Máximo 5%, mínimo 1%.\n✅ Ownership Renunciable.\n✅ Marketing Treasury público: cada pago lleva razón y categoría on-chain." },
  { title: "6. Arquitectura", content: "8 smart contracts:\n1. DiamondWallCoin — Token ERC20\n2. DiamondWallPresale — Venta instantánea + split 70/30 al cerrar\n3. DiamondWallTreasuryV4 — Venus + split 50/45/5\n4. DiamondWallStaking — Staking autónomo\n5. DiamondWallAirdrop — Campañas\n6. LiquidityManager — Auto-distribución 4 DEXs\n7. PostPresaleDistributor — 20% CEX (timelock) + 10% drip mensual\n8. MarketingTreasury — Fondo público de marketing con trazabilidad" }
];

const WP_EN = [
  { title: "1. Introduction", content: "DiamondWall is an automated DeFi platform on Binance Smart Chain (BSC) generating real yields for holders. Unlike projects promising unsustainable returns, $DWALL integrates directly with Venus Protocol for verifiable on-chain yields.\n\nThe goal: every BNB invested works automatically generating passive returns without human intervention." },
  { title: "2. Tokenomics", content: "Token: DiamondWallCoin ($DWALL)\nNetwork: Binance Smart Chain (BSC)\nTotal Supply: 1,000,000,000 DWALL (fixed, no minting)\n\nDistribution:\n• Presale: 700,000,000 DWALL (70%)\n• Airdrop: 150,000,000 DWALL (15%)\n• Marketing Treasury (public on-chain): 100,000,000 DWALL (10%)\n• Team operational wallet: 50,000,000 DWALL (5%)\n\nPresale Price: 620,000 DWALL per 1 BNB" },
  { title: "3. Yield System", content: "When buying $DWALL, BNB is automatically split:\n\n• 50% → Venus Protocol: Real yields. Holders claim anytime.\n• 45% → Liquidity Pools: Auto-distributed to PancakeSwap, BiSwap, ApeSwap, BabySwap.\n• 5% → Operations: Gas, maintenance, development." },
  { title: "4. Post-Presale Distribution", content: "When presale closes, unsold tokens are split automatically:\n\n• 70% → LiquidityManager (immediate, 4 DEX pools)\n• 20% → CEX Reserve (6-month timelock, for future listings)\n• 10% → Monthly drip to LiquidityManager (12 linear months)\n\nFixed rules, no price manipulation: schedule is public and verifiable on-chain." },
  { title: "5. Protections", content: "✅ Fixed Supply: 1B tokens. No mint() function.\n✅ No Blacklist or Freeze.\n✅ No Hidden Fee: 0% transfer fee.\n✅ Irreversible Trading Lock.\n✅ Anti-Whale: Max 5%, min 1%.\n✅ Renounceable Ownership.\n✅ Public Marketing Treasury: every payment has reason + category on-chain." },
  { title: "6. Architecture", content: "8 smart contracts:\n1. DiamondWallCoin — ERC20 Token\n2. DiamondWallPresale — Instant delivery + 70/30 split on close\n3. DiamondWallTreasuryV4 — Venus + 50/45/5 split\n4. DiamondWallStaking — Autonomous staking\n5. DiamondWallAirdrop — Campaigns\n6. LiquidityManager — Auto-distribution 4 DEXs\n7. PostPresaleDistributor — 20% CEX (timelock) + 10% monthly drip\n8. MarketingTreasury — Public marketing fund with full traceability" }
];

const RM_ES = [
  { phase: "Fase 1 — Fundación", status: "completed", items: ["8 smart contracts desarrollados", "458 tests automatizados (100% pass)", "92.31% code coverage", "6 herramientas de auditoría aplicadas", "Frontend multi-idioma (ES/EN)", "Split automático 50/45/5"] },
  { phase: "Fase 2 — Lanzamiento", status: "current", items: ["BSC Testnet deployment v2", "Testing con usuarios reales", "Verificación en BSCScan", "Apertura de presale"] },
  { phase: "Fase 3 — Crecimiento", status: "upcoming", items: ["BSC Mainnet", "Pools en 4 DEXs", "Staking con rewards", "CoinGecko / CoinMarketCap"] },
  { phase: "Fase 4 — Expansión", status: "upcoming", items: ["Auditoría externa (CertiK/Hacken)", "Multi-sig wallet", "Listado en CEX (reserva 20%)", "lockTrading() + renounceOwnership()", "Partnerships DeFi"] }
];

const RM_EN = [
  { phase: "Phase 1 — Foundation", status: "completed", items: ["8 smart contracts developed", "458 automated tests (100% pass)", "92.31% code coverage", "6 security audit tools applied", "Multi-language frontend (ES/EN)", "Automatic 50/45/5 split"] },
  { phase: "Phase 2 — Launch", status: "current", items: ["BSC Testnet deployment v2", "Real user testing", "BSCScan verification", "Presale opening"] },
  { phase: "Phase 3 — Growth", status: "upcoming", items: ["BSC Mainnet", "Pools on 4 DEXs", "Staking with rewards", "CoinGecko / CoinMarketCap"] },
  { phase: "Phase 4 — Expansion", status: "upcoming", items: ["External audit (CertiK/Hacken)", "Multi-sig wallet", "CEX listing (20% reserve)", "lockTrading() + renounceOwnership()", "DeFi partnerships"] }
];

const SOURCES = [
  { name: "DiamondWallCoin.sol", desc_es: "Token ERC20 — Supply fijo, anti-ballena, lockTrading", desc_en: "ERC20 Token — Fixed supply, anti-whale, lockTrading" },
  { name: "DiamondWallTreasuryV4.sol", desc_es: "Treasury — Venus automático, split 50/45/5", desc_en: "Treasury — Auto Venus, 50/45/5 split" },
  { name: "DiamondWallPresale.sol", desc_es: "Presale — Entrega instantánea, split 70/30 al cerrar", desc_en: "Presale — Instant delivery, 70/30 split on close" },
  { name: "DiamondWallStaking.sol", desc_es: "Staking — Rewards autónomos", desc_en: "Staking — Autonomous rewards" },
  { name: "DiamondWallAirdrop.sol", desc_es: "Airdrop — Campañas por lotes", desc_en: "Airdrop — Batch campaigns" },
  { name: "LiquidityManager.sol", desc_es: "Liquidez — Auto-distribución 4 DEXs", desc_en: "Liquidity — Auto-distribution 4 DEXs" },
  { name: "PostPresaleDistributor.sol", desc_es: "20% CEX (timelock 6m) + 10% drip mensual 12 meses", desc_en: "20% CEX (6m timelock) + 10% 12-month monthly drip" },
  { name: "MarketingTreasury.sol", desc_es: "Fondo público — pagos con razón + categoría on-chain", desc_en: "Public fund — payments with reason + category on-chain" }
];

const COVERAGE = [
  { name: "DiamondWallCoin", stmts: 100, branch: 86.25, funcs: 100, lines: 100 },
  { name: "DiamondWallTreasuryV4", stmts: 100, branch: 85.56, funcs: 100, lines: 100 },
  { name: "DiamondWallPresale", stmts: 95.52, branch: 84.78, funcs: 100, lines: 95.51 },
  { name: "DiamondWallStaking", stmts: 100, branch: 85, funcs: 100, lines: 100 },
  { name: "DiamondWallAirdrop", stmts: 100, branch: 89.47, funcs: 100, lines: 100 },
  { name: "LiquidityManager", stmts: 91.3, branch: 84.44, funcs: 100, lines: 96.12 },
  { name: "PostPresaleDistributor", stmts: 100, branch: 83.33, funcs: 100, lines: 100 },
  { name: "MarketingTreasury", stmts: 87.88, branch: 73.08, funcs: 77.78, lines: 90.91 }
];

const TESTS_BY_CONTRACT = [
  { name: "DiamondWallCoin", count: 60 },
  { name: "DiamondWallTreasuryV4", count: 71 },
  { name: "DiamondWallPresale", count: 64 },
  { name: "DiamondWallStaking", count: 70 },
  { name: "DiamondWallAirdrop", count: 81 },
  { name: "LiquidityManager", count: 60 },
  { name: "Distribution Upgrade (suite)", count: 46 },
  { name: "Otros / Misc", count: 6 }
];

const SEC_ES = [
  "ReentrancyGuard en todas las funciones con transferencias de fondos",
  "OnlyOwner en todas las funciones administrativas",
  "Validación de inputs (zero address, zero amount, overflow)",
  "Supply fijo — no existe función mint()",
  "Sin blacklist — no se pueden bloquear direcciones",
  "Sin freeze — admin no puede congelar wallets",
  "Trading lock irreversible (lockTrading())",
  "Límites anti-ballena con mínimo 1% del supply",
  "BNB de pools no retirable a wallets personales",
  "Ownership renunciable (renounceOwnership())",
  "0% fee en transferencias — sin comisiones ocultas",
  "Pausa igualitaria — afecta a todos incluido admin",
  "Sin assembly, sin delegatecall, sin selfdestruct",
  "Dependencias exclusivas de OpenZeppelin v5 (auditado)",
  "Timelock de 6 meses en la reserva CEX",
  "Drip mensual con reglas fijas (anti-manipulación)",
  "Marketing Treasury: cada pago lleva razón ≥10 chars + categoría"
];

const SEC_EN = [
  "ReentrancyGuard on all fund transfer functions",
  "OnlyOwner on all administrative functions",
  "Input validation (zero address, zero amount, overflow)",
  "Fixed supply — no mint() function exists",
  "No blacklist — addresses cannot be blocked",
  "No freeze — admin cannot freeze wallets",
  "Irreversible trading lock (lockTrading())",
  "Anti-whale limits with 1% minimum of supply",
  "Pool BNB non-withdrawable to personal wallets",
  "Renounceable ownership (renounceOwnership())",
  "0% transfer fee — no hidden commissions",
  "Equal pause — affects everyone including admin",
  "No assembly, no delegatecall, no selfdestruct",
  "OpenZeppelin v5 only dependencies (audited)",
  "6-month timelock on CEX reserve",
  "Monthly drip with fixed rules (anti-manipulation)",
  "Marketing Treasury: every payment requires ≥10 char reason + category"
];

const AUDIT_TOOLS = [
  { name: "Slither", by: "Trail of Bits", desc_es: "Análisis estático de vulnerabilidades", desc_en: "Static vulnerability analysis", result_es: "0 Critical | 0 High | 0 Medium", result_en: "0 Critical | 0 High | 0 Medium", file: "audit-report.txt", color: "#10b981" },
  { name: "Solhint", by: "Protofire", desc_es: "Linter de buenas prácticas Solidity", desc_en: "Solidity best practices linter", result_es: "0 Errores | Solo warnings NatSpec", result_en: "0 Errors | NatSpec warnings only", file: "solhint-report.txt", color: "#10b981" },
  { name: "Surya", by: "ConsenSys", desc_es: "Análisis de funciones y modificadores", desc_en: "Function and modifier analysis", result_es: "Todas las funciones admin protegidas", result_en: "All admin functions protected", file: "surya-report.txt", color: "#10b981" },
  { name: "Solidity Metrics", by: "ConsenSys Diligence", desc_es: "Métricas de complejidad de código", desc_en: "Code complexity metrics", result_es: "8 contratos | 0 errores", result_en: "8 contracts | 0 errors", file: "metrics-report.txt", color: "#10b981" },
  { name: "Hardhat Coverage", by: "Solidity Coverage", desc_es: "Cobertura de código por tests", desc_en: "Test code coverage", result_es: "92.31% global | 100% en 4 contratos", result_en: "92.31% global | 100% on 4 contracts", file: "coverage-report.txt", color: "#10b981" },
  { name: "Hardhat Tests", by: "Mocha + Chai", desc_es: "Tests automatizados exhaustivos", desc_en: "Exhaustive automated tests", result_es: "458 passing | 0 failing | 100%", result_en: "458 passing | 0 failing | 100%", file: "test-results.txt", color: "#10b981" }
];

function ProgressBar({ value, label, color }) {
  return (
    <div style={{marginBottom:'0.5rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:'0.2rem'}}>
        <span style={{color:'#e2e8f0'}}>{label}</span>
        <span style={{color: value >= 90 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444', fontWeight:600}}>{value}%</span>
      </div>
      <div style={{background:'#1e293b',borderRadius:'6px',height:'8px',overflow:'hidden'}}>
        <div style={{width:`${value}%`,height:'100%',borderRadius:'6px',background: value >= 90 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444',transition:'width 0.5s'}}></div>
      </div>
    </div>
  );
}

export default function Info() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState("whitepaper");
  const wp = lang === "es" ? WP_ES : WP_EN;
  const rm = lang === "es" ? RM_ES : RM_EN;
  const sec = lang === "es" ? SEC_ES : SEC_EN;

  return (
    <div>
      <h1 className="page-title">{t("info_title")}</h1>
      <div className="tab-bar">
        {["whitepaper","roadmap","contracts","audit"].map(k => (
          <button key={k} className={`tab ${tab===k?'tab-active':''}`} onClick={() => setTab(k)}>{t(`info_${k}`)}</button>
        ))}
      </div>

      {tab === "whitepaper" && <div className="info-section">
        <h2 className="section-title">DiamondWall ($DWALL) — Whitepaper v1.1</h2>
        {wp.map((s,i) => <div key={i} className="card" style={{marginBottom:'1rem'}}><div className="card-title">{s.title}</div><p className="info-text">{s.content}</p></div>)}
      </div>}

      {tab === "roadmap" && <div className="info-section">
        <h2 className="section-title">🗺️ Roadmap</h2>
        {rm.map((p,i) => <div key={i} className="card" style={{marginBottom:'1rem',borderLeft:`4px solid ${p.status==='completed'?'#10b981':p.status==='current'?'#f59e0b':'#475569'}`}}>
          <div className="card-title">{p.status==='completed'?'✅':p.status==='current'?'🔄':'⏳'} {p.phase}</div>
          <ul className="roadmap-list">{p.items.map((item,j) => <li key={j}>{item}</li>)}</ul>
        </div>)}
      </div>}

      {tab === "contracts" && <div className="info-section">
        <h2 className="section-title">{t("info_contracts_title")}</h2>
        <p style={{color:'#94a3b8',marginBottom:'1rem'}}>{t("info_contracts_desc")}</p>
        <div className="card">
          <div className="card-title">{t("info_contracts_current")}</div>
          <div className="contracts-list">
            {Object.entries(CONTRACTS).map(([name, addr]) => <div key={name} className="contract-row"><span className="contract-name">{name}</span><code className="contract-addr">{addr}</code></div>)}
          </div>
        </div>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="card-title">{t("info_source")}</div>
          <div className="contracts-list">
            {SOURCES.map((c,i) => <div key={i} className="contract-row"><span className="contract-name">{c.name}</span><span style={{color:'#94a3b8',fontSize:'0.85rem'}}>{lang==='es'?c.desc_es:c.desc_en}</span></div>)}
          </div>
        </div>
      </div>}

      {tab === "audit" && <div className="info-section">
        <h2 className="section-title">{t("info_audit_title")}</h2>

        {/* Resumen visual */}
        <div className="stats-grid" style={{marginBottom:'1.5rem'}}>
          <div className="stat-card" style={{borderTop:'3px solid #10b981'}}>
            <div className="stat-value" style={{color:'#10b981',fontSize:'2.2rem'}}>458</div>
            <div className="stat-label">{lang==='es'?'Tests Passing':'Tests Passing'}</div>
          </div>
          <div className="stat-card" style={{borderTop:'3px solid #10b981'}}>
            <div className="stat-value" style={{color:'#10b981',fontSize:'2.2rem'}}>0</div>
            <div className="stat-label">{lang==='es'?'Vulnerabilidades':'Vulnerabilities'}</div>
          </div>
          <div className="stat-card" style={{borderTop:'3px solid #10b981'}}>
            <div className="stat-value" style={{color:'#10b981',fontSize:'2.2rem'}}>92.31%</div>
            <div className="stat-label">Code Coverage</div>
          </div>
          <div className="stat-card" style={{borderTop:'3px solid #f59e0b'}}>
            <div className="stat-value" style={{color:'#f59e0b',fontSize:'2.2rem'}}>8</div>
            <div className="stat-label">{lang==='es'?'Smart Contracts':'Smart Contracts'}</div>
          </div>
        </div>

        {/* Herramientas de auditoría */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">🔬 {lang==='es'?'Herramientas de Auditoría':'Audit Tools'}</div>
          <div className="pool-grid" style={{marginTop:'1rem'}}>
            {AUDIT_TOOLS.map((tool,i) => (
              <div key={i} className="pool-card" style={{borderLeft:`3px solid ${tool.color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div className="pool-name">{tool.name}</div>
                  <span style={{fontSize:'0.7rem',background:'#064e3b',color:'#6ee7b7',padding:'0.2rem 0.5rem',borderRadius:'4px'}}>PASS</span>
                </div>
                <div style={{color:'#64748b',fontSize:'0.75rem',marginBottom:'0.4rem'}}>{tool.by}</div>
                <div className="pool-detail">{lang==='es'?tool.desc_es:tool.desc_en}</div>
                <div style={{color:'#10b981',fontSize:'0.85rem',fontWeight:600,margin:'0.4rem 0'}}>{lang==='es'?tool.result_es:tool.result_en}</div>
                <a href={`/${tool.file}`} download style={{color:'#f59e0b',fontSize:'0.8rem',textDecoration:'none'}}>📥 {lang==='es'?'Descargar reporte':'Download report'}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage por contrato */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">📊 Code Coverage {lang==='es'?'por Contrato':'per Contract'}</div>
          <div style={{marginTop:'1rem'}}>
            {COVERAGE.map((c,i) => (
              <div key={i} style={{marginBottom:'1rem',padding:'0.8rem',background:'#1e293b',borderRadius:'8px'}}>
                <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:'0.5rem'}}>{c.name}</div>
                <ProgressBar value={c.stmts} label="Statements" />
                <ProgressBar value={c.branch} label="Branches" />
                <ProgressBar value={c.funcs} label="Functions" />
                <ProgressBar value={c.lines} label="Lines" />
              </div>
            ))}
          </div>
        </div>

        {/* Tests por contrato */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">🧪 Tests {lang==='es'?'por Contrato':'per Contract'}</div>
          <div style={{marginTop:'1rem'}}>
            {TESTS_BY_CONTRACT.map((c,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0.8rem',background:'#1e293b',borderRadius:'6px',marginBottom:'0.4rem'}}>
                <span style={{color:'#f1f5f9'}}>{c.name}</span>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <div style={{width:`${c.count * 2}px`,height:'6px',background:'#10b981',borderRadius:'3px'}}></div>
                  <span style={{color:'#10b981',fontWeight:600,minWidth:'35px',textAlign:'right'}}>{c.count}</span>
                </div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'0.6rem 0.8rem',borderTop:'1px solid #334155',marginTop:'0.5rem'}}>
              <span style={{color:'#f59e0b',fontWeight:700}}>TOTAL</span>
              <span style={{color:'#f59e0b',fontWeight:700}}>458 tests</span>
            </div>
          </div>
        </div>

        {/* Protecciones de seguridad */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">🛡️ {t("info_security")}</div>
          <div className="security-list" style={{marginTop:'0.5rem'}}>
            {sec.map((s,i) => <div key={i} className="security-item"><span className="security-check">✅</span>{s}</div>)}
          </div>
        </div>

        {/* Métricas de código */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">📐 {lang==='es'?'Métricas de Código':'Code Metrics'}</div>
          <div className="stats-grid" style={{marginTop:'1rem'}}>
            <div className="stat-card"><div className="stat-value">8</div><div className="stat-label">{lang==='es'?'Contratos':'Contracts'}</div></div>
            <div className="stat-card"><div className="stat-value">92.31%</div><div className="stat-label">Coverage</div></div>
            <div className="stat-card"><div className="stat-value">458</div><div className="stat-label">Tests</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">{lang==='es'?'Vulnerabilidades':'Vulnerabilities'}</div></div>
          </div>
          <div className="stats-grid" style={{marginTop:'0.5rem'}}>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Assembly</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Selfdestruct</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Delegatecall</div></div>
            <div className="stat-card"><div className="stat-value">0</div><div className="stat-label">Mint()</div></div>
          </div>
        </div>

        {/* Descargas */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">📥 {lang==='es'?'Descargar Reportes Completos':'Download Full Reports'}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'0.8rem',marginTop:'1rem'}}>
            {[
              { file: "FULL-AUDIT-SUMMARY.txt", name: lang==='es'?"Resumen Completo":"Full Summary" },
              { file: "audit-report.txt", name: "Slither Report" },
              { file: "solhint-report.txt", name: "Solhint Report" },
              { file: "surya-report.txt", name: "Surya Report" },
              { file: "metrics-report.txt", name: "Code Metrics" },
              { file: "coverage-report.txt", name: "Coverage Report" },
              { file: "test-results.txt", name: "Test Results" }
            ].map((r,i) => (
              <a key={i} href={`/${r.file}`} download style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.8rem',background:'#1e293b',borderRadius:'8px',color:'#f59e0b',textDecoration:'none',fontWeight:500}}>
                <span style={{fontSize:'1.2rem'}}>📄</span>{r.name}
              </a>
            ))}
          </div>
        </div>

        <div style={{marginBottom:'1rem'}}>
            <a href="https://github.com/PRBx77/diamondwall-audit" target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.8rem 1.5rem',background:'#1e293b',borderRadius:'8px',color:'#f59e0b',textDecoration:'none',fontWeight:600,border:'1px solid #f59e0b'}}>
              <span>🔗</span>
              {lang==='es'?'Ver Repositorio de Auditoría en GitHub':'View Audit Repository on GitHub'}
            </a>
          </div>
        {/* Nota */}

        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div className="card-title">📧 {lang==='es'?'Contacto Oficial':'Official Contact'}</div>
          <div style={{marginTop:'0.8rem'}}>
            <a href="mailto:diamondwallcoin@proton.me" style={{color:'#f59e0b',textDecoration:'none',fontWeight:600}}>diamondwallcoin@proton.me</a>
          </div>
          <div style={{marginTop:'0.8rem'}}>
            <strong style={{color:'#fff'}}>{lang==='es'?'Fundador y Desarrollador Principal:':'Founder & Lead Developer:'}</strong> PRB Ramos Benlloch
          </div>
          <div style={{marginTop:'0.4rem'}}>
            <a href="https://www.linkedin.com/in/prb-ramos-benlloch-8a8506420" target="_blank" rel="noopener noreferrer" style={{color:'#f59e0b',textDecoration:'none',fontWeight:600}}>LinkedIn Profile ↗</a>
          </div>
          <div style={{marginTop:'1rem'}} dangerouslySetInnerHTML={{__html:'<div class="badge-base LI-profile-badge" data-locale="es_ES" data-size="medium" data-theme="dark" data-type="VERTICAL" data-vanity="prb-r-b-8a8506420" data-version="v1"><a class="badge-base__link LI-simple-link" href="https://es.linkedin.com/in/prb-r-b-8a8506420/es?trk=profile-badge">PRB RAMOS BENLLOCH</a></div><script src="https://platform.linkedin.com/badges/js/profile.js" async defer type="text/javascript"><\/script>'}}></div>
          <div style={{display:'none'}}>
          </div>
        </div>
        <div className="card">
          <div className="card-title">⚠️ {t("info_audit_note")}</div>
          <p className="info-text">{t("info_audit_note_desc")}</p>
        </div>
      </div>}
    </div>
  );
}
