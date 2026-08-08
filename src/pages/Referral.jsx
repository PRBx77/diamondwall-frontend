import { useState, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";

// TOGGLE: Set to true when presale is active to enable full functionality
const REFERRAL_ACTIVE = false;

export default function Referral({ account, signer }) {
  const { lang } = useLang();
  const [availableCodes, setAvailableCodes] = useState([]);
  const [myCode, setMyCode] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const bgStyle = {
    minHeight: "100vh",
    padding: "2rem 1rem",
    color: "#fff",
  };

  const cardStyle = {
    background: "rgba(15,20,45,0.88)",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    maxWidth: "900px",
    margin: "0 auto 1.5rem",
  };

  return (
    <div style={bgStyle}>
      <h1 className="page-title" style={{ textAlign: "center", fontSize: "2rem" }}>
        💎 DiamondWall Referral Program
      </h1>

      {/* BANNER — COMING SOON */}
      {!REFERRAL_ACTIVE && (
        <div style={{
          ...cardStyle,
          background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(139,92,246,0.15))",
          border: "2px solid #f59e0b",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🚧</div>
          <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.5rem" }}>
            {lang === "es" ? "Sistema de Referidos — Próximamente" : "Referral System — Coming Soon"}
          </h2>
          <p style={{ color: "#e2e8f0", lineHeight: 1.7, fontSize: "1rem" }}>
            {lang === "es"
              ? "El programa de referidos se activará cuando comience la preventa. Podrás obtener tu código único, compartirlo y ganar el 5% de comisión en tokens $DWALL por cada compra realizada a través de tu enlace."
              : "The referral program will activate when the presale begins. You'll be able to claim your unique code, share it, and earn 5% commission in $DWALL tokens for every purchase made through your link."}
          </p>
        </div>
      )}

      {/* HOW IT WORKS */}
      <div style={cardStyle}>
        <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.3rem" }}>
          {lang === "es" ? "📋 Cómo funciona" : "📋 How it works"}
        </h2>
        <ol style={{ lineHeight: 1.9, paddingLeft: "1.5rem", color: "#e2e8f0" }}>
          <li>
            {lang === "es"
              ? "Conecta tu wallet y elige un código disponible de la lista"
              : "Connect your wallet and choose an available code from the list"}
          </li>
          <li>
            {lang === "es"
              ? "Firma la transacción para reclamar ese código (se asigna a tu wallet permanentemente)"
              : "Sign the transaction to claim that code (it's permanently assigned to your wallet)"}
          </li>
          <li>
            {lang === "es"
              ? "Comparte tu enlace único con tu comunidad"
              : "Share your unique link with your community"}
          </li>
          <li>
            {lang === "es"
              ? "Ganas 5% de comisión en $DWALL por cada compra realizada con tu código"
              : "You earn 5% commission in $DWALL for every purchase made with your code"}
          </li>
          <li>
            {lang === "es"
              ? "Los tokens se liberan gradualmente durante 4 meses tras la apertura de trading en DEX"
              : "Tokens vest linearly over 4 months after DEX trading opens"}
          </li>
        </ol>
      </div>

      {/* KEY FEATURES */}
      <div style={cardStyle}>
        <h2 style={{ color: "#10b981", marginBottom: "1rem", fontSize: "1.3rem" }}>
          {lang === "es" ? "✨ Características" : "✨ Features"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "rgba(16,185,129,0.1)", borderRadius: "8px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>💰</div>
            <div style={{ fontWeight: 700, color: "#10b981", marginBottom: "0.3rem" }}>5% Commission</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              {lang === "es" ? "Sobre cada compra referida" : "On every referred purchase"}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "rgba(139,92,246,0.1)", borderRadius: "8px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔒</div>
            <div style={{ fontWeight: 700, color: "#8b5cf6", marginBottom: "0.3rem" }}>4-Month Vesting</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              {lang === "es" ? "Liberación lineal tras abrir DEX" : "Linear release after DEX opens"}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "rgba(245,158,11,0.1)", borderRadius: "8px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌐</div>
            <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: "0.3rem" }}>100% On-Chain</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              {lang === "es" ? "Transparencia total, verificable" : "Full transparency, verifiable"}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "rgba(236,72,153,0.1)", borderRadius: "8px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎯</div>
            <div style={{ fontWeight: 700, color: "#ec4899", marginBottom: "0.3rem" }}>1 Code / Wallet</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              {lang === "es" ? "Un código por wallet" : "One unique code per wallet"}
            </div>
          </div>
        </div>
      </div>

      {/* RULES */}
      <div style={cardStyle}>
        <h2 style={{ color: "#ec4899", marginBottom: "1rem", fontSize: "1.3rem" }}>
          {lang === "es" ? "📜 Reglas" : "📜 Rules"}
        </h2>
        <ul style={{ lineHeight: 1.8, paddingLeft: "1.5rem", color: "#e2e8f0", fontSize: "0.95rem" }}>
          <li>{lang === "es" ? "Un código por wallet, permanente e intransferible" : "One code per wallet, permanent and non-transferable"}</li>
          <li>{lang === "es" ? "El auto-referral está bloqueado a nivel de contrato" : "Self-referral is blocked at the contract level"}</li>
          <li>{lang === "es" ? "La comisión se paga en tokens $DWALL al precio de presale" : "Commission is paid in $DWALL tokens at presale price"}</li>
          <li>{lang === "es" ? "El vesting comienza cuando abre el trading en DEX" : "Vesting starts when DEX trading opens"}</li>
          <li>{lang === "es" ? "Los códigos abusivos pueden ser deshabilitados por el equipo" : "Abusive codes can be disabled by the team"}</li>
          <li>{lang === "es" ? "Sin garantías de retorno — depende de tu esfuerzo de promoción" : "No return guaranteed — depends on your promotion effort"}</li>
        </ul>
      </div>

      {/* IF ACTIVE — CODE SELECTION UI */}
      {REFERRAL_ACTIVE && (
        <div style={cardStyle}>
          <h2 style={{ color: "#f59e0b", marginBottom: "1rem" }}>
            {lang === "es" ? "🎫 Elige tu código" : "🎫 Choose your code"}
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
            {lang === "es"
              ? "Conecta tu wallet para ver códigos disponibles"
              : "Connect your wallet to see available codes"}
          </p>
          {!account && (
            <p style={{ color: "#f59e0b", textAlign: "center" }}>
              {lang === "es" ? "⚠️ Conecta tu wallet primero" : "⚠️ Connect your wallet first"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
