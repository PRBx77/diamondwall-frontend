import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CHESS_CONTRACT = "0x3b3933432baC6E98F2DcCF5e372569644703Fe05";
const CHESS_ABI = [
  "function claimReward(uint8 level, uint256 nonce, bytes signature) external",
  "function getPlayerStatus(address player) view returns (bool[5])",
  "function getRewards() view returns (uint256[5])",
  "function poolBalance() view returns (uint256)"
];

const LEVELS = [
  { id: 0, name: "Rookie", color: "#4ade80", reward: 25 },
  { id: 1, name: "Silver", color: "#94a3b8", reward: 50 },
  { id: 2, name: "Gold", color: "#fbbf24", reward: 100 },
  { id: 3, name: "Diamond", color: "#22d3ee", reward: 250 },
  { id: 4, name: "Ultra", color: "#a78bfa", reward: 500 }
];

// Damas 8x8
const initialBoard = () => {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { color: "black", king: false };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { color: "white", king: false };
    }
  }
  return b;
};

const getValidMoves = (board, r, c) => {
  const piece = board[r][c];
  if (!piece) return [];
  const moves = [];
  const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : (piece.color === "white" ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);

  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !board[nr][nc]) {
      moves.push({ to: [nr, nc], capture: null });
    }
    const jr = r + 2*dr, jc = c + 2*dc;
    const mr = r + dr, mc = c + dc;
    if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !board[jr][jc] &&
        board[mr] && board[mr][mc] && board[mr][mc].color !== piece.color) {
      moves.push({ to: [jr, jc], capture: [mr, mc] });
    }
  }
  return moves;
};

const getAllMoves = (board, color) => {
  const result = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && board[r][c].color === color) {
        const moves = getValidMoves(board, r, c);
        moves.forEach(m => result.push({ from: [r, c], ...m }));
      }
    }
  }
  const captures = result.filter(m => m.capture);
  return captures.length > 0 ? captures : result;
};

const applyMove = (board, move) => {
  const nb = board.map(row => row.map(cell => cell ? {...cell} : null));
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  nb[tr][tc] = nb[fr][fc];
  nb[fr][fc] = null;
  if (move.capture) {
    const [cr, cc] = move.capture;
    nb[cr][cc] = null;
  }
  if (nb[tr][tc].color === "white" && tr === 0) nb[tr][tc].king = true;
  if (nb[tr][tc].color === "black" && tr === 7) nb[tr][tc].king = true;
  return nb;
};

const countPieces = (board, color) => {
  let count = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c] && board[r][c].color === color) count++;
  }
  return count;
};

const evaluate = (board) => {
  let score = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (!p) continue;
    const val = p.king ? 3 : 1;
    score += p.color === "black" ? val : -val;
  }
  return score;
};

const minimax = (board, depth, alpha, beta, maximizing) => {
  if (depth === 0) return { score: evaluate(board), move: null };
  const color = maximizing ? "black" : "white";
  const moves = getAllMoves(board, color);
  if (moves.length === 0) return { score: maximizing ? -1000 : 1000, move: null };

  let best = null;
  if (maximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const nb = applyMove(board, m);
      const { score } = minimax(nb, depth - 1, alpha, beta, false);
      if (score > maxEval) { maxEval = score; best = m; }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: best };
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const nb = applyMove(board, m);
      const { score } = minimax(nb, depth - 1, alpha, beta, true);
      if (score < minEval) { minEval = score; best = m; }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: best };
  }
};

const aiMove = (board, level) => {
  const moves = getAllMoves(board, "black");
  if (moves.length === 0) return null;

  if (level === 0) return moves[Math.floor(Math.random() * moves.length)];

  const depth = [1, 2, 4, 6, 8][level];
  const { move } = minimax(board, depth, -Infinity, Infinity, true);
  return move || moves[0];
};

export default function DiamondChess() {
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState(initialBoard());
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("white");
  const [moveCount, setMoveCount] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState([false, false, false, false, false]);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [poolBal, setPoolBal] = useState("0");

  const connect = async () => {
    if (!window.ethereum) return setMessage("Install MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    loadStatus(accounts[0]);
  };

  const loadStatus = async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CHESS_CONTRACT, CHESS_ABI, provider);
      const status = await contract.getPlayerStatus(addr);
      setClaimed(status);
      const bal = await contract.poolBalance();
      setPoolBal(ethers.formatUnits(bal, 18));
    } catch (e) { console.error(e); }
  };

  const startGame = (lvl) => {
    setLevel(lvl);
    setBoard(initialBoard());
    setSelected(null);
    setValidMoves([]);
    setTurn("white");
    setMoveCount(0);
    setGameStatus("playing");
    setMessage("");
  };

  const handleClick = (r, c) => {
    if (gameStatus !== "playing" || turn !== "white") return;

    if (selected) {
      const move = validMoves.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        const nb = applyMove(board, { from: selected, ...move });
        setBoard(nb);
        setMoveCount(m => m + 1);
        setSelected(null);
        setValidMoves([]);
        setTimeout(() => aiTurn(nb), 500);
        return;
      }
    }

    if (board[r][c] && board[r][c].color === "white") {
      const moves = getValidMoves(board, r, c);
      const captures = getAllMoves(board, "white").filter(m => m.capture);
      if (captures.length > 0) {
        const canCapture = moves.filter(m => m.capture);
        if (canCapture.length === 0) return;
        setSelected([r, c]);
        setValidMoves(canCapture);
      } else {
        setSelected([r, c]);
        setValidMoves(moves);
      }
    }
  };

  const aiTurn = (b) => {
    const move = aiMove(b, level);
    if (!move) {
      setGameStatus("won");
      setMessage("Victory! You beat DIAMOND.");
      return;
    }
    const nb = applyMove(b, move);
    setBoard(nb);
    setMoveCount(m => m + 1);
    setTurn("white");

    const whiteMoves = getAllMoves(nb, "white");
    if (whiteMoves.length === 0 || countPieces(nb, "white") === 0) {
      setGameStatus("lost");
      setMessage("Defeated by DIAMOND. Try again.");
    } else if (countPieces(nb, "black") === 0) {
      setGameStatus("won");
      setMessage("Victory! You beat DIAMOND.");
    }
  };

  const claimReward = async () => {
    if (!account || gameStatus !== "won" || claimed[level]) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/sign-chess-win", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: account,
          level,
          gameState: { won: true, moves: moveCount }
        })
      });
      const data = await res.json();
      if (!data.signature) throw new Error(data.error || "Sign failed");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CHESS_CONTRACT, CHESS_ABI, signer);
      const tx = await contract.claimReward(level, data.nonce, data.signature);
      setMessage("Transaction sent: " + tx.hash);
      await tx.wait();
      setMessage(`Reward claimed! +${LEVELS[level].reward} DWALL`);
      loadStatus(account);
    } catch (e) {
      setMessage("Claim error: " + (e.reason || e.message));
    }
    setClaiming(false);
  };

  return (
    <div style={{maxWidth:'900px',margin:'2rem auto',padding:'2rem',color:'#fff'}}>
      <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'36px',fontWeight:700,margin:0,background:'linear-gradient(135deg,#22d3ee,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'3px'}}>DIAMONDCHESS</h2>
        <p style={{color:'rgba(255,255,255,0.6)',letterSpacing:'4px',textTransform:'uppercase',fontSize:'13px'}}>Beat DIAMOND · Earn $DWALL</p>
        <p style={{color:'#fbbf24',fontSize:'14px',marginTop:'8px'}}>Pool: {Number(poolBal).toLocaleString()} DWALL</p>
      </div>

      {!account && (
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <button onClick={connect} style={{background:'#fbbf24',color:'#000',border:'none',padding:'14px 32px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px'}}>Connect Wallet</button>
        </div>
      )}

      <div style={{display:'flex',gap:'10px',justifyContent:'center',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {LEVELS.map(l => (
          <button key={l.id} onClick={() => startGame(l.id)}
            style={{background: level === l.id ? l.color : 'rgba(0,0,0,0.4)', color: level === l.id ? '#000' : '#fff', border:`2px solid ${l.color}`, padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:600, position:'relative'}}>
            {l.name} · {l.reward} DWALL
            {claimed[l.id] && <span style={{position:'absolute',top:'-8px',right:'-8px',background:'#4ade80',color:'#000',borderRadius:'50%',width:'20px',height:'20px',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>✓</span>}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(8,60px)',gap:0,margin:'0 auto',width:'480px',border:'4px solid #fbbf24',borderRadius:'8px',overflow:'hidden'}}>
        {board.map((row, r) => row.map((cell, c) => {
          const dark = (r + c) % 2 === 1;
          const isSel = selected && selected[0] === r && selected[1] === c;
          const isMove = validMoves.some(m => m.to[0] === r && m.to[1] === c);
          return (
            <div key={`${r}-${c}`} onClick={() => handleClick(r, c)}
              style={{width:'60px',height:'60px',background: isSel ? '#fbbf24' : (isMove ? '#4ade8080' : (dark ? '#1a1a2e' : '#3a3a5e')),display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              {cell && (
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background: cell.color === 'white' ? 'radial-gradient(circle at 30% 30%, #ffffff, #cbd5e1)' : 'radial-gradient(circle at 30% 30%, #22d3ee, #0e7490)',border:'2px solid #000',boxShadow:'0 4px 8px rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',color: cell.color === 'white' ? '#000' : '#fff',fontWeight:900,fontSize:'20px'}}>
                  {cell.king ? '♛' : ''}
                </div>
              )}
            </div>
          );
        }))}
      </div>

      <div style={{textAlign:'center',marginTop:'1.5rem'}}>
        <p style={{fontSize:'14px',color:'rgba(255,255,255,0.7)'}}>Turn: <b style={{color: turn === 'white' ? '#fbbf24' : '#22d3ee'}}>{turn === 'white' ? 'YOU' : 'DIAMOND'}</b> · Moves: {moveCount}</p>
        {message && <p style={{color: gameStatus === 'won' ? '#4ade80' : '#f87171',fontWeight:600,marginTop:'10px'}}>{message}</p>}

        {gameStatus === 'won' && !claimed[level] && account && (
          <button onClick={claimReward} disabled={claiming}
            style={{background:'#4ade80',color:'#000',border:'none',padding:'14px 32px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px',marginTop:'15px'}}>
            {claiming ? "Claiming..." : `Claim ${LEVELS[level].reward} DWALL`}
          </button>
        )}

        {gameStatus === 'lost' && (
          <button onClick={() => startGame(level)}
            style={{background:'#f87171',color:'#000',border:'none',padding:'14px 32px',borderRadius:'10px',fontWeight:700,cursor:'pointer',fontSize:'16px',marginTop:'15px'}}>Try Again</button>
        )}
      </div>
    </div>
  );
}
