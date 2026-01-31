import os
import pygame
import sys

# 音声エラーを回避（音を出さない設定）
os.environ['SDL_AUDIODRIVER'] = 'dummy'

print("Initializing Pygame...")
pygame.init()

print("Setting up display...")
try:
    # 画面サイズの設定
    screen = pygame.display.set_mode((400, 300))
    print("Display success!")
except Exception as e:
    print(f"Display failed: {e}")
    sys.exit(1)

# --- 以下、描画ループ ---