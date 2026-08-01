import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLang } from "../../i18n/LanguageContext";
import { getContracts } from "../../utils/web3";

const TOTAL_LEVELS = 5;
const LEVEL_CONFIG = [
  { enemies: 8, speed: 0.18, spawnRate: 45, name: "Recon" },
  { enemies: 15, speed: 0.22, spawnRate: 35, name: "Patrol" },
  { enemies: 25, speed: 0.26, spawnRate: 28, name: "Squadron" },
  { enemies: 40, speed: 0.30, spawnRate: 22, name: "Assault" },
  { enemies: 60, speed: 0.35, spawnRate: 18, name: "Elite" }
];

const WEAPONS = [
  { id: 0, name: "Basic Laser",   unlockLevel: 1, cooldown: 12, color: 0xfbbf24, pattern: "single" },
  { id: 1, name: "Twin Cannon",   unlockLevel: 2, cooldown: 12, color: 0x22d3ee, pattern: "twin" },
  { id: 2, name: "Spread Shot",   unlockLevel: 3, cooldown: 14, color: 0xff8800, pattern: "spread" },
  { id: 3, name: "Rapid Fire",    unlockLevel: 4, cooldown: 5,  color: 0xaa00ff, pattern: "single" },
  { id: 4, name: "Diamond Cannon",unlockLevel: 5, cooldown: 18, color: 0x00ff66, pattern: "cannon" }
];

const T = {
  title: { es: "DiamondFlight", en: "DiamondFlight" },
  start: { es: "INICIAR MISIÓN", en: "START MISSION" },
  chooseLevel: { es: "Selecciona nivel", en: "Select level" },
  chooseWeapon: { es: "Selecciona arma", en: "Select weapon" },
  locked: { es: "Bloqueado", en: "Locked" },
  unlockAt: { es: "Nivel", en: "Level" },
  level: { es: "Nivel", en: "Level" },
  score: { es: "Puntos", en: "Score" },
  hp: { es: "Vida", en: "HP" },
  weapon: { es: "Arma", en: "Weapon" },
  enemies: { es: "Enemigos", en: "Enemies" },
  victory: { es: "¡VICTORIA!", en: "VICTORY!" },
  gameover: { es: "DERRIBADO", en: "SHOT DOWN" },
  retry: { es: "REINTENTAR", en: "RETRY" },
  claim: { es: "RECLAMAR 100 DWALL", en: "CLAIM 100 DWALL" },
  connectWallet: { es: "CONECTAR WALLET", en: "CONNECT WALLET" },
  connected: { es: "Conectado", en: "Connected" },
  connect: { es: "Conecta la wallet primero", en: "Connect wallet first" },
  claimed: { es: "Ya reclamado con esta wallet", en: "Already claimed with this wallet" },
  claiming: { es: "Reclamando...", en: "Claiming..." },
  success: { es: "¡Reclamado con éxito!", en: "Successfully claimed!" },
  extraLife: { es: "¡+1 VIDA EXTRA!", en: "+1 EXTRA LIFE!" },
  weaponUnlocked: { es: "¡ARMA DESBLOQUEADA!", en: "WEAPON UNLOCKED!" },
  instructions: {
    es: "Joystick: pilotar. Boton rojo: disparar. WASD/flechas + espacio en PC",
    en: "Joystick: pilot. Red button: fire. WASD/arrows + space on PC"
  }
};

export default function Flight() {
  const { lang } = useLang();
  const t = (k) => T[k][lang];
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const audioRef = useRef({ correct: null, wrong: null, ambient: null });
  const [gameState, setGameState] = useState("menu");
  const [hud, setHud] = useState({ level: 1, score: 0, hp: 3, kills: 0, target: 8, weapon: "Basic Laser" });
  const [claimStatus, setClaimStatus] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [walletAddr, setWalletAddr] = useState("");
  const [notification, setNotification] = useState("");
  const [unlockedWeapons, setUnlockedWeapons] = useState(() => {
    try {
      const saved = localStorage.getItem("dwall_flight_weapons");
      return saved ? JSON.parse(saved) : [0];
    } catch {
      return [0];
    }
  });

  useEffect(() => {
    audioRef.current.correct = new Audio("/sounds/correct.mp3");
    audioRef.current.wrong = new Audio("/sounds/wrong.mp3");
    audioRef.current.ambient = new Audio("/sounds/ambient.mp3");
    audioRef.current.ambient.loop = true;
    audioRef.current.ambient.volume = 0.3;
    audioRef.current.correct.volume = 0.5;
    audioRef.current.wrong.volume = 0.5;
    return () => {
      if (audioRef.current.ambient) audioRef.current.ambient.pause();
    };
  }, []);

  const playSound = (name) => {
    if (!soundOn || !audioRef.current[name]) return;
    try {
      audioRef.current[name].currentTime = 0;
      audioRef.current[name].play().catch(() => {});
    } catch (e) {}
  };

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  const unlockWeapon = (weaponId) => {
    setUnlockedWeapons(prev => {
      if (prev.includes(weaponId)) return prev;
      const next = [...prev, weaponId];
      try { localStorage.setItem("dwall_flight_weapons", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleConnect = async () => {
    try {
      const c = await getContracts();
      if (c && c.signer) {
        const addr = await c.signer.getAddress();
        setWalletAddr(addr);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const c = await getContracts();
        if (c && c.signer) {
          const addr = await c.signer.getAddress();
          setWalletAddr(addr);
        }
      } catch (e) {}
    })();
  }, []);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      setClaimStatus(t("claiming"));
      const c = await getContracts();
      if (!c || !c.airdrop || !c.signer) {
        setClaimStatus(t("connect"));
        setClaiming(false);
        return;
      }
      const addr = await c.signer.getAddress();
      const info = await c.airdrop.getUserAirdropInfo(addr);
      if (info.hasClaimed) {
        setClaimStatus(t("claimed"));
        setClaiming(false);
        return;
      }
      const tx = await c.airdrop.claimAirdrop({ gasLimit: 500000n });
      await tx.wait();
      setClaimStatus(t("success"));
    } catch (e) {
      setClaimStatus(e.reason || e.message || "Error");
    } finally {
      setClaiming(false);
    }
  };

  const startGame = () => {
    setGameState("playing");
    setHud({
      level: selectedLevel,
      score: 0,
      hp: 3,
      kills: 0,
      target: LEVEL_CONFIG[selectedLevel - 1].enemies,
      weapon: WEAPONS[selectedWeapon].name
    });
    setClaimStatus("");
    if (soundOn && audioRef.current.ambient) {
      audioRef.current.ambient.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (gameState !== "playing" || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1930);
    scene.fog = new THREE.Fog(0x0a1930, 30, 200);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambientL = new THREE.AmbientLight(0x4488aa, 0.6);
    scene.add(ambientL);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const shipGroup = new THREE.Group();
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x22d3ee, emissive: 0x004466, shininess: 100 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 2.5, 8), bodyMat);
    body.rotation.x = Math.PI / 2;
    shipGroup.add(body);
    const cockpit = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.35),
      new THREE.MeshPhongMaterial({ color: 0x67e8f9, emissive: 0x225577 })
    );
    cockpit.position.set(0, 0.3, 0.2);
    shipGroup.add(cockpit);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0x0088cc });
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.6), wingMat);
    wingL.position.set(-0.9, 0, 0);
    shipGroup.add(wingL);
    const wingR = wingL.clone();
    wingR.position.set(0.9, 0, 0);
    shipGroup.add(wingR);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.4), wingMat);
    tail.position.set(0, 0.3, -1);
    shipGroup.add(tail);
    const engineGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const engineL = new THREE.Mesh(engineGeo, engineMat);
    engineL.position.set(-0.9, 0, -0.3);
    shipGroup.add(engineL);
    const engineR = engineL.clone();
    engineR.position.set(0.9, 0, -0.3);
    shipGroup.add(engineR);
    scene.add(shipGroup);

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

    const state = {
      level: selectedLevel,
      score: 0,
      hp: 3,
      kills: 0,
      target: LEVEL_CONFIG[selectedLevel - 1].enemies,
      weapon: WEAPONS[selectedWeapon],
      enemies: [], bullets: [],
      spawned: 0, spawnCounter: 0,
      shipVel: { x: 0, y: 0 },
      joyX: 0, joyY: 0,
      firing: false, fireCooldown: 0,
      running: true, hitFlash: 0
    };
    gameRef.current = state;

    const enemyTypes = [
      { geo: () => new THREE.OctahedronGeometry(0.7), color: 0xff3333, emissive: 0x660000, wing: 0xaa0000 },
      { geo: () => new THREE.TetrahedronGeometry(0.8), color: 0xff8800, emissive: 0x663300, wing: 0xaa4400 },
      { geo: () => new THREE.IcosahedronGeometry(0.6), color: 0xaa00ff, emissive: 0x330066, wing: 0x6600aa },
      { geo: () => new THREE.BoxGeometry(0.9, 0.9, 0.9), color: 0x00ff66, emissive: 0x006633, wing: 0x00aa44 },
      { geo: () => new THREE.DodecahedronGeometry(0.6), color: 0xffff00, emissive: 0x666600, wing: 0xaaaa00 }
    ];

    const spawnEnemy = () => {
      const cfg = LEVEL_CONFIG[state.level - 1];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const enemy = new THREE.Group();
      const eBody = new THREE.Mesh(
        type.geo(),
        new THREE.MeshPhongMaterial({ color: type.color, emissive: type.emissive })
      );
      enemy.add(eBody);
      const w1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 1, 4),
        new THREE.MeshPhongMaterial({ color: type.wing })
      );
      w1.rotation.z = Math.PI / 2;
      w1.position.x = -0.7;
      enemy.add(w1);
      const w2 = w1.clone();
      w2.position.x = 0.7;
      w2.rotation.z = -Math.PI / 2;
      enemy.add(w2);
      enemy.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15,
        -120
      );
      enemy.userData = {
        speed: cfg.speed * (0.8 + Math.random() * 0.4),
        hp: 1,
        rotSpeed: 0.01 + Math.random() * 0.03
      };
      scene.add(enemy);
      state.enemies.push(enemy);
      state.spawned++;
    };

    const createBullet = (offsetX, offsetY, angleX, size, damage, color) => {
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(size, 6, 6),
        new THREE.MeshBasicMaterial({ color })
      );
      b.position.copy(shipGroup.position);
      b.position.x += offsetX;
      b.position.y += offsetY;
      b.position.z -= 1;
      b.userData = { life: 100, vx: angleX, damage };
      scene.add(b);
      state.bullets.push(b);
    };

    const fireBullet = () => {
      const w = state.weapon;
      if (w.pattern === "single") {
        createBullet(0, 0, 0, 0.15, 1, w.color);
      } else if (w.pattern === "twin") {
        createBullet(-0.4, 0, 0, 0.15, 1, w.color);
        createBullet(0.4, 0, 0, 0.15, 1, w.color);
      } else if (w.pattern === "spread") {
        createBullet(0, 0, 0, 0.15, 1, w.color);
        createBullet(-0.2, 0, -0.15, 0.15, 1, w.color);
        createBullet(0.2, 0, 0.15, 0.15, 1, w.color);
      } else if (w.pattern === "cannon") {
        createBullet(0, 0, 0, 0.35, 3, w.color);
      }
    };

    const keys = {};
    const onKeyDown = (e) => (keys[e.key] = true);
    const onKeyUp = (e) => (keys[e.key] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      if (!state.running) return;
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const cfg = LEVEL_CONFIG[state.level - 1];

      let inX = state.joyX;
      let inY = state.joyY;
      if (keys["ArrowLeft"] || keys["a"]) inX = -1;
      if (keys["ArrowRight"] || keys["d"]) inX = 1;
      if (keys["ArrowUp"] || keys["w"]) inY = 1;
      if (keys["ArrowDown"] || keys["s"]) inY = -1;
      if (keys[" "]) state.firing = true;

      state.shipVel.x += (inX * 0.02 - state.shipVel.x * 0.1);
      state.shipVel.y += (inY * 0.02 - state.shipVel.y * 0.1);
      shipGroup.position.x = Math.max(-15, Math.min(15, shipGroup.position.x + state.shipVel.x * 60 * dt));
      shipGroup.position.y = Math.max(-8, Math.min(8, shipGroup.position.y + state.shipVel.y * 60 * dt));
      shipGroup.rotation.z = -state.shipVel.x * 8;
      shipGroup.rotation.x = state.shipVel.y * 4;

      camera.position.x = shipGroup.position.x * 0.3;
      camera.position.y = 3 + shipGroup.position.y * 0.3;
      camera.lookAt(shipGroup.position.x, shipGroup.position.y, -10);

      if (state.firing && state.fireCooldown <= 0) {
        fireBullet();
        state.fireCooldown = state.weapon.cooldown;
      }
      if (state.fireCooldown > 0) state.fireCooldown--;

      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.position.z -= 1.5;
        b.position.x += b.userData.vx * 1.5;
        b.userData.life--;
        if (b.userData.life <= 0 || b.position.z < -150) {
          scene.remove(b);
          state.bullets.splice(i, 1);
        }
      }

      if (state.spawned < state.target) {
        state.spawnCounter++;
        if (state.spawnCounter >= cfg.spawnRate) {
          spawnEnemy();
          state.spawnCounter = 0;
        }
      }

      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        e.position.z += e.userData.speed * 60 * dt;
        e.rotation.y += e.userData.rotSpeed;
        e.rotation.x += e.userData.rotSpeed * 0.5;
        e.position.x += Math.sin(e.position.z * 0.05) * 0.05;

        if (e.position.z > shipGroup.position.z - 1 && e.position.z < shipGroup.position.z + 1) {
          const dx = e.position.x - shipGroup.position.x;
          const dy = e.position.y - shipGroup.position.y;
          if (Math.sqrt(dx * dx + dy * dy) < 1.2) {
            state.hp--;
            state.hitFlash = 10;
            playSound("wrong");
            scene.remove(e);
            state.enemies.splice(i, 1);
            if (state.hp <= 0) {
              state.running = false;
              if (audioRef.current.ambient) audioRef.current.ambient.pause();
              setGameState("gameover");
            }
            continue;
          }
        }

        if (e.position.z > 15) {
          state.hp--;
          state.hitFlash = 10;
          playSound("wrong");
          scene.remove(e);
          state.enemies.splice(i, 1);
          if (state.hp <= 0) {
            state.running = false;
            if (audioRef.current.ambient) audioRef.current.ambient.pause();
            setGameState("gameover");
          }
          continue;
        }

        for (let j = state.bullets.length - 1; j >= 0; j--) {
          const b = state.bullets[j];
          if (b.position.distanceTo(e.position) < 1) {
            scene.remove(e);
            state.enemies.splice(i, 1);
            state.kills++;
            state.score += 100 * state.level;
            playSound("correct");
            if (b.userData.damage < 3) {
              scene.remove(b);
              state.bullets.splice(j, 1);
            }
            break;
          }
        }
      }

      if (state.kills >= state.target && state.enemies.length === 0) {
        if (state.level >= TOTAL_LEVELS) {
          state.running = false;
          if (audioRef.current.ambient) audioRef.current.ambient.pause();
          setGameState("victory");
        } else {
          state.level++;
          state.spawned = 0;
          state.kills = 0;
          state.target = LEVEL_CONFIG[state.level - 1].enemies;

          // Desbloquear arma correspondiente
          const newWeapon = WEAPONS.find(w => w.unlockLevel === state.level);
          if (newWeapon) {
            unlockWeapon(newWeapon.id);
            showNotif(t("weaponUnlocked") + " " + newWeapon.name);
          }

          // Vida extra en niveles 3 y 5
          if (state.level === 3 || state.level === 5) {
            state.hp++;
            showNotif(t("extraLife"));
          }
        }
      }

      if (state.hitFlash > 0) {
        body.material.emissive = new THREE.Color(0xff0000);
        cockpit.material.emissive = new THREE.Color(0xff0000);
        state.hitFlash--;
      } else {
        body.material.emissive = new THREE.Color(0x004466);
        cockpit.material.emissive = new THREE.Color(0x225577);
      }

      if (Math.random() < 0.1) {
        setHud({
          level: state.level, score: state.score, hp: state.hp,
          kills: state.kills, target: state.target,
          weapon: state.weapon.name
        });
      }

      renderer.render(scene, camera);
    };
    animate();

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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t("title")}</h1>
      <button onClick={() => setSoundOn(!soundOn)} style={styles.soundBtn}>
        {soundOn ? "🔊" : "🔇"}
      </button>

      {notification && (
        <div style={styles.notification}>{notification}</div>
      )}

      {gameState === "menu" && (
        <div style={styles.menu}>
          {walletAddr ? (
            <div style={styles.walletBox}>
              <span style={{ color: "#22d3ee", fontSize: 12 }}>
                {t("connected")}: {walletAddr.slice(0,6)}...{walletAddr.slice(-4)}
              </span>
            </div>
          ) : (
            <button onClick={handleConnect} style={styles.btnConnect}>
              {t("connectWallet")}
            </button>
          )}
          <p style={styles.instructions}>{t("instructions")}</p>

          <div style={styles.selectorBox}>
            <p style={styles.selectorLabel}>{t("chooseLevel")}</p>
            <div style={styles.selectorRow}>
              {[1,2,3,4,5].map(lv => (
                <button
                  key={lv}
                  onClick={() => setSelectedLevel(lv)}
                  style={{
                    ...styles.selectorBtn,
                    ...(selectedLevel === lv ? styles.selectorBtnActive : {})
                  }}
                >
                  {lv}
                </button>
              ))}
            </div>
            <p style={styles.selectorHint}>{LEVEL_CONFIG[selectedLevel - 1].name}</p>
          </div>

          <div style={styles.selectorBox}>
            <p style={styles.selectorLabel}>{t("chooseWeapon")}</p>
            <div style={styles.weaponsGrid}>
              {WEAPONS.map(w => {
                const isUnlocked = unlockedWeapons.includes(w.id);
                const isSelected = selectedWeapon === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => isUnlocked && setSelectedWeapon(w.id)}
                    disabled={!isUnlocked}
                    style={{
                      ...styles.weaponBtn,
                      ...(isSelected && isUnlocked ? styles.weaponBtnActive : {}),
                      opacity: isUnlocked ? 1 : 0.4,
                      cursor: isUnlocked ? "pointer" : "not-allowed"
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: "bold" }}>{w.name}</div>
                    <div style={{ fontSize: 10, marginTop: 2 }}>
                      {isUnlocked ? "✓" : `🔒 ${t("unlockAt")} ${w.unlockLevel}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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
            <span>{t("weapon")}: {hud.weapon}</span>
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
          <h2 style={{ color: "#22d3ee", fontSize: 32 }}>{t("victory")}</h2>
          <p style={{ color: "#fff", fontSize: 20 }}>{t("score")}: {hud.score}</p>
          <button onClick={handleClaim} disabled={claiming} style={styles.btnPrimary}>
            {t("claim")}
          </button>
          {claimStatus && <p style={{ color: "#fbbf24", marginTop: 12 }}>{claimStatus}</p>}
          <button onClick={() => setGameState("menu")} style={styles.btnSecondary}>{t("retry")}</button>
        </div>
      )}

      {gameState === "gameover" && (
        <div style={styles.menu}>
          <h2 style={{ color: "#ff3333", fontSize: 32 }}>{t("gameover")}</h2>
          <p style={{ color: "#fff", fontSize: 20 }}>{t("score")}: {hud.score}</p>
          <button onClick={() => setGameState("menu")} style={styles.btnPrimary}>{t("retry")}</button>
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
    position: "relative"
  },
  title: { fontSize: 32, color: "#22d3ee", textShadow: "0 0 20px #22d3ee", margin: "8px 0" },
  soundBtn: {
    position: "absolute", top: 12, right: 12,
    background: "transparent", border: "1px solid #22d3ee",
    color: "#22d3ee", borderRadius: 6, padding: "6px 10px",
    cursor: "pointer", fontSize: 18
  },
  notification: {
    position: "fixed", top: 80, left: "50%",
    transform: "translateX(-50%)", zIndex: 100,
    background: "rgba(34,211,238,0.95)", color: "#001122",
    padding: "12px 24px", borderRadius: 8,
    fontWeight: "bold", fontSize: 16,
    boxShadow: "0 0 30px #22d3ee"
  },
  menu: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 14, marginTop: 20,
    paddingBottom: 30
  },
  walletBox: {
    padding: "8px 16px",
    background: "rgba(34,211,238,0.1)",
    border: "1px solid #22d3ee",
    borderRadius: 6
  },
  btnConnect: {
    padding: "10px 24px", fontSize: 14,
    background: "transparent", color: "#22d3ee",
    border: "2px solid #22d3ee", borderRadius: 8,
    fontWeight: "bold", cursor: "pointer"
  },
  instructions: { color: "#88ccdd", fontSize: 13, textAlign: "center", maxWidth: 400 },
  selectorBox: { textAlign: "center", width: "100%", maxWidth: 500 },
  selectorLabel: { color: "#22d3ee", marginBottom: 8, fontSize: 14, fontWeight: "bold" },
  selectorRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  selectorBtn: {
    width: 48, height: 48, borderRadius: 8,
    border: "1px solid #22d3ee", background: "transparent",
    color: "#22d3ee", fontSize: 18, fontWeight: "bold",
    cursor: "pointer"
  },
  selectorBtnActive: { background: "#22d3ee", color: "#001122", boxShadow: "0 0 15px #22d3ee" },
  selectorHint: { color: "#88ccdd", fontSize: 12, marginTop: 6 },
  weaponsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 8,
    maxWidth: 500
  },
  weaponBtn: {
    padding: "10px 8px", borderRadius: 8,
    border: "1px solid #22d3ee", background: "transparent",
    color: "#22d3ee", textAlign: "center"
  },
  weaponBtnActive: { background: "#22d3ee", color: "#001122", boxShadow: "0 0 15px #22d3ee" },
  btnPrimary: {
    padding: "14px 32px", fontSize: 18,
    background: "linear-gradient(90deg, #22d3ee, #0088cc)",
    color: "#001122", border: "none", borderRadius: 8,
    fontWeight: "bold", cursor: "pointer",
    boxShadow: "0 0 20px rgba(34,211,238,0.5)"
  },
  btnSecondary: {
    padding: "10px 20px", fontSize: 14,
    background: "transparent", color: "#22d3ee",
    border: "1px solid #22d3ee", borderRadius: 6,
    cursor: "pointer", marginTop: 8
  },
  hud: {
    width: "100%", display: "flex", justifyContent: "space-between",
    padding: "8px 12px", background: "rgba(0,0,0,0.6)",
    borderBottom: "1px solid #22d3ee", fontSize: 12,
    flexWrap: "wrap", gap: 8
  },
  canvas: {
    width: "100%", height: "60vh", maxWidth: 1200,
    border: "1px solid #22d3ee", borderRadius: 8, overflow: "hidden"
  },
  touchControls: {
    display: "flex", justifyContent: "space-between",
    width: "100%", padding: "16px 24px", marginTop: 12
  },
  joystick: {
    width: 120, height: 120, borderRadius: "50%",
    background: "rgba(34,211,238,0.15)", border: "2px solid #22d3ee",
    position: "relative", touchAction: "none"
  },
  joystickDot: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)", width: 40, height: 40,
    borderRadius: "50%", background: "#22d3ee",
    boxShadow: "0 0 15px #22d3ee"
  },
  fireBtn: {
    width: 100, height: 100, borderRadius: "50%",
    background: "radial-gradient(#ff6600, #cc0000)",
    border: "3px solid #ff9900", fontSize: 40,
    cursor: "pointer", boxShadow: "0 0 20px rgba(255,102,0,0.6)"
  }
};
