import pygame
import os
import random

# 環境設定（あなたの環境に合わせて調整してください）
os.environ['DISPLAY'] = 'host.docker.internal:0.0'

pygame.init()

# 画面設定
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 800
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("インベーダー風ゲーム")

# 色
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

# プレイヤー設定
player_width = 50
player_height = 20
player_x = (SCREEN_WIDTH - player_width) // 2
player_y = SCREEN_HEIGHT - 50
player_speed = 7

# 弾設定
bullets = []
bullet_speed = -10

# 敵設定
enemies = []
enemy_width = 40
enemy_height = 30
for row in range(5):
    for col in range(8):
        enemy_x = 50 + col * 60
        enemy_y = 50 + row * 50
        enemies.append(pygame.Rect(enemy_x, enemy_y, enemy_width, enemy_height))

enemy_speed = 2
enemy_direction = 1

# メインループ
running = True
clock = pygame.time.Clock()

while running:
    screen.fill(BLACK)
    
    # 1. イベント処理
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE: # スペースキーで発射
                bullets.append(pygame.Rect(player_x + player_width//2 - 2, player_y, 5, 15))

    # 2. プレイヤーの移動
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and player_x > 0:
        player_x -= player_speed
    if keys[pygame.K_RIGHT] and player_x < SCREEN_WIDTH - player_width:
        player_x += player_speed

    # 3. 弾の移動と削除
    for bullet in bullets[:]:
        bullet.y += bullet_speed
        if bullet.y < 0:
            bullets.remove(bullet)

    # 4. 敵の移動
    move_down = False
    for enemy in enemies:
        enemy.x += enemy_speed * enemy_direction
        if enemy.right > SCREEN_WIDTH or enemy.left < 0:
            move_down = True
            
    if move_down:
        enemy_direction *= -1
        for enemy in enemies:
            enemy.y += 10

    # 5. 当たり判定（弾と敵）
    for bullet in bullets[:]:
        for enemy in enemies[:]:
            if bullet.colliderect(enemy):
                bullets.remove(bullet)
                enemies.remove(enemy)
                break

    # 6. 描画
    # プレイヤー
    pygame.draw.rect(screen, GREEN, (player_x, player_y, player_width, player_height))
    # 弾
    for bullet in bullets:
        pygame.draw.rect(screen, YELLOW, bullet)
    # 敵
    for enemy in enemies:
        pygame.draw.rect(screen, RED, enemy)

    # クリア判定
    if not enemies:
        print("CLEAR!")
        running = False

    pygame.display.flip()
    clock.tick(60)

pygame.quit()