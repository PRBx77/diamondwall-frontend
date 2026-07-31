import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BrowserProvider, Contract } from "ethers";
import { useLang } from "../context/LangContext";

// === CONFIG ===
const AIRDROP_ADDRESS = "0xe18D2605bb2AEf257173AA0CcD60Bec036579F74";
const AIRDROP_ABI = [
  "function claimAirdrop() external",
  "function hasClaimed(address) view returns (bool)"
];
const BSC_CHAIN_ID = 56;
const TOTAL_LEVELS = 5;
const LEVEL_CONFIG = [
  { enemies: 5, speed: 0.15, spawnRate: 90, name: "Recon" },
  { enemies: 8, speed: 0.20, spawnRate: 75, name: "Patrol" },
  { enemies: 12, speed: 0.25, spawnRate: 60, name: "Squadron" },
  { enemies: 16, speed: 0.30, spawnRate: 50, name: "Assault" },
  { enemies: 20, speed: 0.35, spawnRate: 40, name: "Elite" }
];

const T = {
  title: { es: "DiamondFlight", en: "DiamondFlight" },
  start: { es: "INICIAR MISIÓN", en: "START MISSION" },
  level: { es: "Nivel", en: "Level" },
  score: { es: "Puntos", en: "Score" },
  hp: { es: "Vida", en: "HP" },
  enemies: { es: "Enemigos", en: "Enemies" },
  victory: { es: "¡VICTORIA!", en: "VICTORY!" },
  gameover: { es: "DERRIBADO", en: "SHOT DOWN" },
  retry: { es: "REINTENTAR", en: "RETRY" },
  claim: { es: "RECLAMAR AIRDROP", en: "CLAIM AIRDROP" },
  connect: { es: "Conectar wallet", en: "Connect wallet" },
  claimed: { es: "Ya reclamado", en: "Already claimed" },
  claiming: { es: "Reclamando...", en: "Claiming..." },
  success: { es: "¡Reclamado con éxito!", en: "Successfully claimed!" },
  instructions: {
    es: "Joystick: pilotar · Botón rojo: disparar",
    en: "Joystick: pilot · Red button: fire"
  }
};

export default function Flight() {
  const { lang } = useLang();
  const t = (k) => T[k][lang];
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState("menu"); // menu | playing | victory | gameover
  const [hud, setHud] = useState({ level: 1, score: 0, hp: 3, kills: 0, target: 5 });
  const [claimStatus, setClaimStatus] = useState("");

  // === CLAIM ===
  const handleClaim = async () => {
    if (!window.ethereum) {
      setClaimStatus(t("connect"));
      return;
    }
    try {
      setClaimStatus(t("claiming"));
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== BSC_CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }]
        });
      }
      const signer = await provider.getSigner();
      const contract = new Contract(AIRDROP_ADDRESS, AIRDROP_ABI, signer);
      const addr = await signer.getAddress();
      const already = await contract.hasClaimed(addr);
      if (already) {
        setClaimStatus(t("claimed"));
        return;
      }
      const tx = await contract.claimAirdrop({ gasLimit: 500000n });
      await tx.wait();
      setClaimStatus(t("success"));
    } catch (e) {
      setClaimStatus(e.reason || e.message || "Error");
    }
  };

  // === START GAME ===
  const startGame = () => {
    setGameState("playing");
    setHud({ level: 1, score: 0, hp: 3, kills: 0, target: LEVEL_CONFIG[0].enemies });
  };

  // === THREE.JS SCENE ===
  useEffect(() => {
    if (gameState !== "playing" || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1930);
    scene.fog = new THREE.Fog(0x0a1930, 30, 200);

    // Camera (tercera persona)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x4488aa, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    // === PLAYER SHIP (formas definidas) ===
    const shipGroup = new THREE.Group();
    // Fuselaje: cilindro alargado
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x00e0ff, emissive: 0x004466, shininess: 100 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 2.5, 8), bodyMat);
    body.rotation.x = Math.PI / 2;
    shipGroup.add(body);
    // Cockpit: tetraedro
    const cockpit = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.35),
      new THREE.MeshPhongMaterial({ color: 0x66ffff, emissive: 0x225577 })
    );
    cockpit.position.set(0, 0.3, 0.2);
    shipGroup.add(cockpit);
    // Alas: cajas planas
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x0088cc });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.6), wingMat);
    wingL.position.set(-0.9, 0, 0);
    shipGroup.add(wingL);
    const wingR = wingL.clone();
    wingR.position.set(0.9, 0, 0);
    shipGroup.add(wingR);
    // Cola
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.4), wingMat);
    tail.position.set(0, 0.3, -1);
    shipGroup.add(tail);
    // Motores glow
    const engineGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const engineL = new THREE.Mesh(engineGeo, engineMat);
    engineL.position.set(-0.9, 0, -0.3);
    shipGroup.add(engineL);
    const engineR = engineL.clone();
    engineR.position.set(0.9, 0, -0.3);
    shipGroup.add(engineR);

    shipGroup.position.set(0, 0, 0);
    scene.add(shipGroup);

    // === STARS ===
    const starsGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 500; i++) {
      starVerts.push(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 200,
        -Math.random() * 500
      );
    }
    starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
    const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 }));
    scene.add(stars);

    // === GAME STATE ===
    const state = {
      level: 1,
      score: 0,
      hp: 3,
      kills: 0,
      target: LEVEL_CONFIG[0].enemies,
      enemies: [],
      bullets: [],
      spawned: 0,
      spawnCounter: 0,
      shipVel: { x: 0, y: 0 },
      joyX: 0,
      joyY: 0,
      firing: false,
      fireCooldown: 0,
      running: true,
      hitFlash: 0
    };
    gameRef.current = state;

    // === ENEMY SPAWN ===
    const spawnEnemy = () => {
      const cfg = LEVEL_CONFIG[state.level - 1];
      const enemy = new THREE.Group();
      // Cuerpo octaedro
      const eBody = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.6),
        new THREE.MeshPhongMaterial({ color: 0xff3333, emissive: 0x660000 })
      );
      enemy.add(eBody);
      // Alas cono
      const wing1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 1, 4),
        new THREE.MeshPhongMaterial({ color: 0xaa0000 })
      );
      wing1.rotation.z = Math.PI / 2;
      wing1.position.x = -0.6;
      enemy.add(wing1);
      const wing2 = wing1.clone();
      wing2.position.x = 0.6;
      wing2.rotation.z = -Math.PI / 2;
      enemy.add(wing2);
      // Posición inicial (lejos, aleatoria)
      enemy.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15,
        -100
      );
      enemy.userData = { speed: cfg.speed, hp: 1 };
      scene.add(enemy);
      state.enemies.push(enemy);
      state.spawned++;
    };

    // === BULLETS ===
    const fireBullet = () => {
      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc })
      );
      bullet.position.copy(shipGroup.position);
      bullet.position.z -= 1;
      bullet.userData = { life: 100 };
      scene.add(bullet);
      state.bullets.push(bullet);
    };

    // === CONTROLS ===
    const keys = {};
    const onKeyDown = (e) => (keys[e.key] = true);
    const onKeyUp = (e) => (keys[e.key] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // === LOOP ===
    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      if (!state.running) return;
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const cfg = LEVEL_CONFIG[state.level - 1];

      // Input keyboard
      let inX = state.joyX;
      let inY = state.joyY;
      if (keys["ArrowLeft"] || keys["a"]) inX = -1;
      if (keys["ArrowRight"] || keys["d"]) inX = 1;
      if (keys["ArrowUp"] || keys["w"]) inY = 1;
      if (keys["ArrowDown"] || keys["s"]) inY = -1;
      if (keys[" "]) state.firing = true;

      // Move ship
      state.shipVel.x += (inX * 0.02 - state.shipVel.x * 0.1);
      state.shipVel.y += (inY * 0.02 - state.shipVel.y * 0.1);
      shipGroup.position.x = Math.max(-15, Math.min(15, shipGroup.position.x + state.shipVel.x * 60 * dt));
      shipGroup.position.y = Math.max(-8, Math.min(8, shipGroup.position.y + state.shipVel.y * 60 * dt));
      shipGroup.rotation.z = -state.shipVel.x * 8;
      shipGroup.rotation.x = state.shipVel.y * 4;

      // Camera follow
      camera.position.x = shipGroup.position.x * 0.3;
      camera.position.y = 3 + shipGroup.position.y * 0.3;
      camera.lookAt(shipGroup.position.x, shipGroup.position.y, -10);

      // Fire
      if (state.firing && state.fireCooldown <= 0) {
        fireBullet();
        state.fireCooldown = 10;
      }
      if (state.fireCooldown > 0) state.fireCooldown--;

      // Bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.position.z -= 1.5;
        b.userData.life--;
        if (b.userData.life <= 0 || b.position.z < -150) {
          scene.remove(b);
          state.bullets.splice(i, 1);
        }
      }

      // Spawn enemies
      if (state.spawned < state.target) {
        state.spawnCounter++;
        if (state.spawnCounter >= cfg.spawnRate) {
          spawnEnemy();
          state.spawnCounter = 0;
        }
      }

      // Enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        e.position.z += e.userData.speed * 60 * dt;
        e.rotation.y += 0.02;
        e.rotation.x += 0.01;
        // Zigzag
        e.position.x += Math.sin(e.position.z * 0.05) * 0.05;

        // Collision con nave
        if (e.position.z > shipGroup.position.z - 1 && e.position.z < shipGroup.position.z + 1) {
          const dx = e.position.x - shipGroup.position.x;
          const dy = e.position.y - shipGroup.position.y;
          if (Math.sqrt(dx * dx + dy * dy) < 1.2) {
            state.hp--;
            state.hitFlash = 10;
            scene.remove(e);
            state.enemies.splice(i, 1);
            if (state.hp <= 0) {
              state.running = false;
              setGameState("gameover");
            }
            continue;
          }
        }

        // Fuera de pantalla
        if (e.position.z > 15) {
          scene.remove(e);
          state.enemies.splice(i, 1);
        }

        // Collision con bullets
        for (let j = state.bullets.length - 1; j >= 0; j--) {
          const b = state.bullets[j];
          if (b.position.distanceTo(e.position) < 1) {
            scene.remove(e);
            scene.remove(b);
            state.enemies.splice(i, 1);
            state.bullets.splice(j, 1);
            state.kills++;
            state.score += 100 * state.level;
            break;
          }
        }
      }

      // Level complete
      if (state.kills >= state.target && state.enemies.length === 0) {
        if (state.level >= TOTAL_LEVELS) {
          state.running = false;
          setGameState("victory");
        } else {
          state.level++;
          state.spawned = 0;
          state.kills = 0;
          state.target = LEVEL_CONFIG[state.level - 1].enemies;
        }
      }

      // Flash on hit
      if (state.hitFlash > 0) {
        shipGroup.children.forEach(c => {
          if (c.material) c.material.emissive = new THREE.Color(0xff0000);
        });
        state.hitFlash--;
      } else {
        body.material.emissive = new THREE.Color(0x004466);
        cockpit.material.emissive = new THREE.Color(0x225577);
      }

      // Update HUD (throttled)
      if (Math.random() < 0.1) {
        setHud({
          level: state.level,
          score: state.score,
          hp: state.hp,
          kills: state.kills,
          target: state.target
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      state.running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [gameState]);

  // === TOUCH CONTROLS ===
  const joystickRef = useRef(null);
  const handleJoystick = (e) => {
    if (!gameRef.current || !joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (touch.clientX - cx) / (rect.width / 2);
    const dy = (touch.clientY - cy) / (rect.height / 2);
    gameRef.current.joyX = Math.max(-1, Math.min(1, dx));
    gameRef.current.joyY = Math.max(-1, Math.min(1, -dy));
  };
  const resetJoystick = () => {
    if (gameRef.current) {
      gameRef.current.joyX = 0;
      gameRef.current.joyY = 0;
    }
  };

  // === RENDER ===
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t("title")}</h1>

      {gameState === "menu" && (
        <div style={styles.menu}>
          <p style={styles.instructions}>{t("instructions")}</p>
          <button onClick={startGame} style={styles.btnPrimary}>{t("start")}</button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div style={styles.hud}>
            <span>{t("level")}: {hud.level}/{TOTAL_LEVELS}</span>
            <span>{t("score")}: {hud.score}</span>
            <span>{t("hp")}: {"❤".repeat(hud.hp)}</span>
            <span>{t("enemies")}: {hud.kills}/{hud.target}</span>
          </div>
          <div ref={mountRef} style={styles.canvas} />
          <div style={styles.touchControls}>
            <div
              ref={joystickRef}
              style={styles.joystick}
              onTouchStart={handleJoystick}
              onTouchMove={handleJoystick}
              onTouchEnd={resetJoystick}
              onMouseDown={handleJoystick}
              onMouseMove={(e) => e.buttons && handleJoystick(e)}
              onMouseUp={resetJoystick}
            >
              <div style={styles.joystickDot} />
            </div>
            <button
              style={styles.fireBtn}
              onTouchStart={() => gameRef.current && (gameRef.current.firing = true)}
              onTouchEnd={() => gameRef.current && (gameRef.current.firing = false)}
              onMouseDown={() => gameRef.current && (gameRef.current.firing = true)}
              onMouseUp={() => gameRef.current && (gameRef.current.firing = false)}
            >
              🔥
            </button>
          </div>
        </>
      )}

      {gameState === "victory" && (
        <div style={styles.menu}>
          <h2 style={{ color: "#00ffcc", fontSize: 32 }}>{t("victory")}</h2>
          <p style={{ color: "#fff", fontSize: 20 }}>{t("score")}: {hud.score}</p>
          <button onClick={handleClaim} style={styles.btnPrimary}>{t("claim")}</button>
          {claimStatus && <p style={{ color: "#ffcc00", marginTop: 12 }}>{claimStatus}</p>}
          <button onClick={startGame} style={styles.btnSecondary}>{t("retry")}</button>
        </div>
      )}

      {gameState === "gameover" && (
        <div style={styles.menu}>
          <h2 style={{ color: "#ff3333", fontSize: 32 }}>{t("gameover")}</h2>
          <p style={{ color: "#fff", fontSize: 20 }}>{t("score")}: {hud.score}</p>
          <button onClick={startGame} style={styles.btnPrimary}>{t("retry")}</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a1930 0%, #000814 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 12,
    fontFamily: "'Orbitron', sans-serif"
  },
  title: {
    fontSize: 32,
    color: "#00e0ff",
    textShadow: "0 0 20px #00e0ff",
    margin: "8px 0"
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    marginTop: 40
  },
  instructions: {
    color: "#88ccdd",
    fontSize: 14,
    textAlign: "center"
  },
  btnPrimary: {
    padding: "14px 32px",
    fontSize: 18,
    background: "linear-gradient(90deg, #00e0ff, #0088cc)",
    color: "#001122",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(0,224,255,0.5)"
  },
  btnSecondary: {
    padding: "10px 20px",
    fontSize: 14,
    background: "transparent",
    color: "#00e0ff",
    border: "1px solid #00e0ff",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 8
  },
  hud: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "rgba(0,0,0,0.6)",
    borderBottom: "1px solid #00e0ff",
    fontSize: 12,
    flexWrap: "wrap",
    gap: 8
  },
  canvas: {
    width: "100%",
    height: "60vh",
    maxWidth: 1200,
    border: "1px solid #00e0ff",
    borderRadius: 8,
    overflow: "hidden"
  },
  touchControls: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    padding: "16px 24px",
    marginTop: 12
  },
  joystick: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(0,224,255,0.15)",
    border: "2px solid #00e0ff",
    position: "relative",
    touchAction: "none"
  },
  joystickDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#00e0ff",
    boxShadow: "0 0 15px #00e0ff"
  },
  fireBtn: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "radial-gradient(#ff6600, #cc0000)",
    border: "3px solid #ff9900",
    fontSize: 40,
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(255,102,0,0.6)"
  }
};
