import { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // ゲーム状態
    const player = { x: 375, y: 550, w: 50, h: 20, color: '#00ffcc' };
    const bullets = [];
    const enemies = [];
    const enemyRows = 4;
    const enemyCols = 10;
    const keys = {};

    // 敵の初期化
    for (let r = 0; r < enemyRows; r++) {
      for (let c = 0; c < enemyCols; c++) {
        enemies.push({
          x: c * 60 + 50,
          y: r * 40 + 50,
          w: 40,
          h: 25,
          alive: true,
          color: `hsl(${r * 40 + 200}, 70%, 50%)`
        });
      }
    }

    // 入力イベント
    const handleKeyDown = (e) => (keys[e.code] = true);
    const handleKeyUp = (e) => (keys[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // メインループ
    const update = () => {
      if (gameOver) return;

      // 1. プレイヤー移動
      if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
      if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += 5;

      // 2. 弾の発射（連射制限）
      if (keys['Space']) {
        if (bullets.length === 0 || bullets[bullets.length - 1].y < player.y - 100) {
          bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 15 });
        }
      }

      // 3. 弾の移動と判定
      bullets.forEach((b, bi) => {
        b.y -= 8;
        if (b.y < 0) bullets.splice(bi, 1);

        enemies.forEach((e) => {
          if (e.alive && b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
            e.alive = false;
            bullets.splice(bi, 1);
            setScore(s => s + 100);
          }
        });
      });

      // 全滅判定
      if (enemies.every(e => !e.alive)) setGameOver(true);
    };

    const draw = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // プレイヤー
      ctx.fillStyle = player.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = player.color;
      ctx.fillRect(player.x, player.y, player.w, player.h);

      // 弾
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      // 敵
      enemies.forEach(e => {
        if (e.alive) {
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.fillRect(e.x, e.y, e.w, e.h);
        }
      });

      ctx.shadowBlur = 0; // リセット
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
  }, [gameOver]);

  return (
    <div style={{
      textAlign: 'center', backgroundColor: '#111', minHeight: '100vh', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ color: '#00ffcc', fontFamily: 'monospace', margin: '10px' }}>SPACE INVADERS REACT</h1>
      <div style={{ color: '#fff', fontSize: '24px', marginBottom: '10px', fontFamily: 'monospace' }}>
        SCORE: {score.toString().padStart(6, '0')}
      </div>
      
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={800} height={600} style={{ border: '2px solid #333', borderRadius: '4px' }} />
        {gameOver && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: '#fff', fontSize: '48px', fontWeight: 'bold', textShadow: '0 0 20px #00ffcc'
          }}>
            MISSION CLEAR!
          </div>
        )}
      </div>
      
      <p style={{ color: '#666', marginTop: '15px' }}>[Arrow Keys] to Move | [Space] to Shoot</p>
    </div>
  );
}

export default App;