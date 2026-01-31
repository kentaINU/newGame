import { useEffect, useRef, useState, useCallback } from 'react';
import * as CONFIG from './constants';
import { createEnemies, checkCollision } from './GameLogic';

function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('START'); // 'START', 'PLAYING', 'GAMEOVER', 'CLEAR'
  const lastShotTime = useRef(0);

  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let player = { x: CONFIG.CANVAS_WIDTH / 2 - 25, y: CONFIG.CANVAS_HEIGHT - 50, w: 50, h: 20, color: '#00ffcc' };
    let playerBullets = [];
    let enemyBullets = [];
    let enemies = createEnemies();
    let enemyDirection = 1;
    let keys = {};

    const handleKeyDown = (e) => (keys[e.code] = true);
    const handleKeyUp = (e) => (keys[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      // プレイヤー移動
      if (keys['ArrowLeft'] && player.x > 0) player.x -= CONFIG.PLAYER_SPEED;
      if (keys['ArrowRight'] && player.x < CONFIG.CANVAS_WIDTH - player.w) player.x += CONFIG.PLAYER_SPEED;

      // 発射
      const now = Date.now();
      if (keys['Space'] && now - lastShotTime.current > CONFIG.SHOOT_INTERVAL) {
        playerBullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 15 });
        lastShotTime.current = now;
      }

      // 敵の移動
      let hitEdge = false;
      enemies.filter(e => e.alive).forEach(e => {
        e.x += CONFIG.ENEMY_SPEED * enemyDirection;
        if (e.x + e.w > CONFIG.CANVAS_WIDTH || e.x < 0) hitEdge = true;
        if (Math.random() < CONFIG.ENEMY_SHOOT_CHANCE) {
          enemyBullets.push({ x: e.x + e.w / 2, y: e.y + e.h, w: 4, h: 10 });
        }
      });

      if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(e => e.y += CONFIG.ENEMY_DROP_SPEED);
      }

      // 判定：自機の弾 -> 敵
      playerBullets.forEach((b, bi) => {
        b.y -= CONFIG.PLAYER_BULLET_SPEED;
        enemies.filter(e => e.alive).forEach(e => {
          if (checkCollision(b, e)) {
            e.alive = false;
            playerBullets.splice(bi, 1);
            setScore(s => s + 100);
          }
        });
      });

      // 判定：敵の弾 -> 自機
      enemyBullets.forEach((b, bi) => {
        b.y += CONFIG.ENEMY_BULLET_SPEED;
        if (checkCollision(b, player)) setGameState('GAMEOVER');
      });

      // クリア・ゲームオーバー条件
      if (enemies.every(e => !e.alive)) setGameState('CLEAR');
      if (enemies.some(e => e.alive && e.y + e.h > player.y)) setGameState('GAMEOVER');
    };

    const draw = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.w, player.h);

      ctx.fillStyle = '#ffff00';
      playerBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      ctx.fillStyle = '#ff0000';
      enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      enemies.forEach(e => {
        if (e.alive) {
          ctx.fillStyle = e.color;
          ctx.fillRect(e.x, e.y, e.w, e.h);
        }
      });
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'monospace' }}>
      <h1>SPACE INVADERS</h1>
      <h2>SCORE: {score}</h2>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} style={{ border: '2px solid #333' }} />
        
        {gameState !== 'PLAYING' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            {gameState === 'GAMEOVER' && <h2 style={{ color: '#ff4444', fontSize: '48px' }}>GAME OVER</h2>}
            {gameState === 'CLEAR' && <h2 style={{ color: '#00ffcc', fontSize: '48px' }}>MISSION CLEAR!</h2>}
            {gameState === 'START' && <h2 style={{ color: '#fff', fontSize: '32px' }}>READY?</h2>}
            <button onClick={startGame} style={{ padding: '15px 30px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#00ffcc', border: 'none' }}>
              {gameState === 'START' ? 'START GAME' : 'RETRY'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;