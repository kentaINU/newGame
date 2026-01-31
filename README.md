# 🚀 React Physics Invader 開発ブランチ

このプロジェクトは、**Vite + React** をベースに、物理演算エンジン **Matter.js** を活用したWebゲームです。

## 🛠 開発環境の構成

- **Runtime**: Node.js 20 (via Docker)
- **Build Tool**: Vite 5.x
- **Frontend**: React 18.x
- **Physics Engine**: Matter.js
- **Environment**: VS Code Dev Containers

## 📂 ディレクトリ構造

```text
.
├── .devcontainer/
│   └── devcontainer.json    # コンテナの定義と自動起動設定
└── frontend/                # Webアプリ本体
    ├── src/
    │   ├── main.jsx         # エントリーポイント
    │   └── App.jsx          # ゲームロジック（React × Canvas）
    ├── index.html           # ページ土台
    ├── package.json         # 依存ライブラリ管理
    ├── vite.config.js       # Viteの設定
    └── .gitignore           # Git管理除外設定
