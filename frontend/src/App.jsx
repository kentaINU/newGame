import { useEffect, useRef, useState } from 'react';
import * as CONFIG from './constants';
import { createEnemies, checkCollision } from './GameLogic';

function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('START'); 
  const lastShotTime = useRef(0);

  // --- キャラクター描画関数 ---
  // ねこ型ロケット
  const drawPlayer = (ctx, x, y, w, h) => {
    ctx.fillStyle = '#FFFFFF'; // 体
    ctx.fillRect(x + 10, y, w - 20, h);
    ctx.fillStyle = '#FFC0CB'; // 耳
    ctx.beginPath();
    ctx.moveTo(x + 10, y); ctx.lineTo(x + 20, y - 10); ctx.lineTo(x + 25, y); ctx.fill();
    ctx.moveTo(x + w - 10, y); ctx.lineTo(x + w - 20, y - 10); ctx.lineTo(x + w - 25, y); ctx.fill();
    ctx.fillStyle = '#333'; // 目
    ctx.fillRect(x + 18, y + 5, 4, 4);
    ctx.fillRect(x + w - 22, y + 5, 4, 4);
    ctx.fillStyle = '#FF69B4'; // リボン
    ctx.fillRect(x + w/2 - 5, y + 10, 10, 5);
  };

  // ぷにぷにエイリアン
  const drawEnemy = (ctx, e, frame) => {
    const bounce = Math.sin(frame * 0.1) * 3; // ぷにぷに動く
    ctx.fillStyle = e.color;
    // 体
    ctx.beginPath();
    ctx.ellipse(e.x + e.w/2, e.y + e.h/2 + bounce, e.w/2, e.h/2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 目（きょろきょろ）
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(e.x + e.w/3, e.y + e.h/2 + bounce, 5, 0, Math.PI * 2);
    ctx.arc(e.x + (e.w/3)*2, e.y + e.h/2 + bounce, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    const eyeX = Math.cos(frame * 0.05) * 2;
    ctx.beginPath();
    ctx.arc(e.x + e.w/3 + eyeX, e.y + e.h/2 + bounce, 2, 0, Math.PI * 2);
    ctx.arc(e.x + (e.w/3)*2 + eyeX, e.y + e.h/2 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let frameCount = 0;

    let player = { x: CONFIG.CANVAS_WIDTH / 2 - 25, y: CONFIG.CANVAS_HEIGHT - 60, w: 50, h: 30 };
    let playerBullets = [];
    let enemyBullets = [];
    let enemies = createEnemies().map(e => ({
      ...e, 
      color: `hsl(${Math.random() * 360}, 80%, 70%)` // カラフルなパステルカラー
    }));
    let enemyDirection = 1;
    let keys = {};

    const handleKeyDown = (e) => (keys[e.code] = true);
    const handleKeyUp = (e) => (keys[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      frameCount++;
      if (keys['ArrowLeft'] && player.x > 0) player.x -= CONFIG.PLAYER_SPEED;
      if (keys['ArrowRight'] && player.x < CONFIG.CANVAS_WIDTH - player.w) player.x += CONFIG.PLAYER_SPEED;

      const now = Date.now();
      if (keys['Space'] && now - lastShotTime.current > CONFIG.SHOOT_INTERVAL) {
        playerBullets.push({ x: player.x + player.w / 2 - 5, y: player.y, w: 10, h: 10, type: 'heart' });
        lastShotTime.current = now;
      }

      let hitEdge = false;
      const speed = CONFIG.ENEMY_SPEED + (level * 0.4);
      const shootChance = Math.min(0.05, CONFIG.ENEMY_SHOOT_CHANCE + (level * 0.005));

      enemies.forEach(e => {
        if (!e.alive) return;
        e.x += speed * enemyDirection;
        if (e.x + e.w > CONFIG.CANVAS_WIDTH || e.x < 0) hitEdge = true;
        if (Math.random() < shootChance) {
          const dx = (player.x + player.w / 2) - (e.x + e.w / 2);
          enemyBullets.push({ x: e.x + e.w/2, y: e.y + e.h, w: 8, h: 8, vx: (dx/400) * 2 });
        }
      });

      if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(e => e.y += CONFIG.ENEMY_DROP_SPEED);
      }

      playerBullets.forEach((b, bi) => {
        b.y -= CONFIG.PLAYER_BULLET_SPEED;
        enemies.forEach(e => {
          if (e.alive && checkCollision(b, e)) {
            e.alive = false;
            playerBullets.splice(bi, 1);
            setScore(s => s + 100);
          }
        });
      });

      enemyBullets.forEach((b, bi) => {
        b.y += CONFIG.ENEMY_BULLET_SPEED;
        if(b.vx) b.x += b.vx;
        if (checkCollision(b, player)) setGameState('GAMEOVER');
      });

      if (enemies.every(e => !e.alive)) setLevel(l => l + 1);
      if (enemies.some(e => e.alive && e.y + e.h > player.y)) setGameState('GAMEOVER');
    };

    const draw = () => {
      // 背景：パステルパープル
      ctx.fillStyle = '#F0E6FF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 星を降らせる（簡易背景演出）
      ctx.fillStyle = '#FFF';
      for(let i=0; i<10; i++) {
        ctx.fillRect((frameCount + i*100)%canvas.width, (i*80)%canvas.height, 2, 2);
      }

      // プレイヤー描画
      drawPlayer(ctx, player.x, player.y, player.w, player.h);

      // ハートの弾
      playerBullets.forEach(b => {
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI*2);
        ctx.fill();
      });

      // 敵の弾（キラキラ）
      enemyBullets.forEach(b => {
        ctx.fillStyle = '#FFD700';
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(frameCount * 0.1);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      });

      // エイリアン描画
      enemies.forEach(e => {
        if (e.alive) drawEnemy(ctx, e, frameCount);
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
  }, [gameState, level]);

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#FFFAF0', minHeight: '100vh', color: '#6A5ACD', fontFamily: '"Comic Sans MS", cursive' }}>
      <h1 style={{ fontSize: '40px', textShadow: '2px 2px #FFB6C1' }}>✨ PUNI PUNI INVADERS ✨</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        <h3>LV: {level}</h3>
        <h3>SCORE: {score}</h3>
      </div>
      
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} 
                style={{ border: '8px solid #FFB6C1', borderRadius: '20px', backgroundColor: '#FFF' }} />
        
        {gameState !== 'PLAYING' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px'
          }}>
            <h2 style={{ fontSize: '40px' }}>{gameState === 'GAMEOVER' ? 'Oh no! 🙀' : 'Ready? 🎀'}</h2>
            <button onClick={startGame} style={{
              padding: '15px 40px', fontSize: '24px', cursor: 'pointer',
              backgroundColor: '#FF69B4', color: '#fff', border: 'none', borderRadius: '50px',
              boxShadow: '0 5px #C71585'
            }}>
              {gameState === 'START' ? 'GO!' : 'RETRY'}
            </button>
          </div>
        )}
      </div>
      <p style={{ color: '#AAA' }}>Arrow keys to move, Space to shoot Hearts!</p>
    </div>
  );
}

export default App;