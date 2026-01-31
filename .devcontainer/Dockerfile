# デフォルトで多くのライブラリが入っているフル版イメージを使用
FROM mcr.microsoft.com/devcontainers/python:3.11

# OSのアップデートを一切せず、Pygameだけを入れる
# (依存ライブラリが足りない場合は実行時にエラーが出るが、まずはビルドを成功させる)
RUN pip install --no-cache-dir pygame