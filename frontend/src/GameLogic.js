export const createEnemies = () => {
  const enemies = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
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
  return enemies;
};

export const checkCollision = (obj1, obj2) => {
  return (
    obj1.x < obj2.x + obj2.w &&
    obj1.x + obj1.w > obj2.x &&
    obj1.y < obj2.y + obj2.h &&
    obj1.y + obj1.h > obj2.y
  );
};