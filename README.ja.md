# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

[Sentinel Bot](https://sentinel.redclawey.com) 用 MCP サーバー — AI エージェントによるアルゴリズム取引バックテスト、ボット管理、アカウント操作。

本サーバーは [Model Context Protocol (MCP)](https://modelcontextprotocol.io) を実装し、17 のツールを提供します。AI エージェントが暗号通貨のバックテスト実行、取引ボットのデプロイ、アカウント管理、決済処理をすべて自然言語で行えます。

## クイックスタート

### 1. API Key の取得

[sentinel.redclawey.com](https://sentinel.redclawey.com) で無料登録。**無料トライアルを含むすべてのプランで API Key が利用可能です**。ダッシュボードの **設定 > API Keys** からキーを生成してください。クレジットを購入してバックテストを開始し、ボットが必要になったらプランをアップグレードしましょう。

### 2. インストール

#### Claude Code（推奨）

```bash
claude mcp add sentinel -- npx mcp-server-sentinel
```

環境変数を設定：
```bash
export SENTINEL_API_KEY=sk-your-api-key-here
```

#### Claude Desktop

`claude_desktop_config.json` に追加：

```json
{
  "mcpServers": {
    "sentinel": {
      "command": "npx",
      "args": ["-y", "mcp-server-sentinel"],
      "env": {
        "SENTINEL_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

#### 手動設定（任意の MCP クライアント）

```json
{
  "command": "npx",
  "args": ["-y", "mcp-server-sentinel"],
  "env": {
    "SENTINEL_API_KEY": "sk-your-api-key-here",
    "SENTINEL_API_URL": "https://sentinel.redclawey.com/api/v1"
  }
}
```

## 環境変数

| 変数 | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `SENTINEL_API_KEY` | はい | — | API キー（`sk-` で始まる） |
| `SENTINEL_API_URL` | いいえ | `https://sentinel.redclawey.com/api/v1` | API ベース URL |

## ツール（17 個）

### バックテスト

| ツール | 説明 |
|---|---|
| `run_backtest` | バックテストを送信して結果を待機。8 種類のエントリーと 6 種類のエグジットをサポート。デフォルトではサマリー指標を返却。`include_trades=true` で全取引リストを取得。 |
| `get_backtest_result` | Job ID で特定のバックテスト結果を取得。完了までポーリング可能。 |
| `list_backtests` | 最近のバックテストジョブを一覧表示。ステータス/通貨ペアでフィルタ可能。 |
| `cancel_backtest` | 実行中またはキュー内のバックテストジョブをキャンセル。 |

### ボット管理

| ツール | 説明 |
|---|---|
| `list_bots` | すべての取引ボットを一覧表示。ステータスフィルタ対応（idle/running/paused/stopped/error/halted）。 |
| `create_bot` | 新しいボットを作成。バックテスト結果の `strategy_blocks` を渡してテスト済み戦略をデプロイ。 |
| `get_bot` | ボットの詳細情報と現在のステータスを取得。 |
| `start_bot` | ボットを起動（`exchange_id` の設定が必要）。リアルタイム取引シグナルを配信。 |
| `stop_bot` | 実行中または一時停止中のボットを停止。 |
| `delete_bot` | ボットを永久削除（先に停止が必要）。 |
| `get_bot_performance` | ボットの累計損益、勝率、取引回数を取得。 |

### 取引所

| ツール | 説明 |
|---|---|
| `list_exchanges` | 設定済み取引所の認証情報を一覧表示（Binance、Bybit、OKX など）。ボット作成時に取引所 ID を使用。 |

### アカウント・決済

| ツール | 説明 |
|---|---|
| `get_account_info` | 現在のプラン、クレジット残高、ボット使用量（使用中/上限）、アップグレード提案。 |
| `get_plan_info` | 全プランの静的な料金・機能比較。 |
| `create_payment_link` | Helio チェックアウトリンクを作成（クレジットカード/USDC）。プランアップグレードまたはクレジット補充用。 |
| `create_crypto_invoice` | NOWPayments 請求書を作成（300 種類以上の暗号通貨）。プランアップグレードまたはクレジット補充用。 |
| `verify_payment` | 決済完了とプランアップグレードの確認。 |

## 使用例

AI エージェントの典型的なワークフロー：

```
1. get_account_info        -> 現在のプラン・クレジット・ボット容量を確認
2. run_backtest            -> 戦略をテスト（例：BTC 4h EMA クロス）
3. run_backtest            -> 別の戦略と比較（例：RSI + ATR トレーリングストップ）
4. create_bot              -> 勝った戦略をデプロイ（strategy_blocks をコピー）
5. list_exchanges          -> exchange_id を取得
6. start_bot               -> 本番稼働
7. get_bot_performance     -> 結果を監視
```

クレジットが不足した場合：
```
get_account_info           -> credits_balance: 0
create_payment_link        -> strategy_id: "credits_topup", amount_usd: 20
  -> 決済 URL を返却 -> ユーザーがブラウザで決済完了
verify_payment             -> クレジット追加を確認
run_backtest               -> バックテストを再開
```

## 対応通貨ペア

BTC, ETH, SOL, XRP, BNB, DOGE, LINK, TRX, SUI

## 対応タイムフレーム

1m, 5m, 15m, 1h, 4h, 1d

## エントリーブロックタイプ

| タイプ | 説明 | 主要パラメータ |
|---|---|---|
| `ema_cross` | EMA クロスオーバー | `fast_period`, `slow_period` |
| `macd_cross` | MACD シグナルクロス | `fast_period`, `slow_period`, `signal_period` |
| `rsi` | RSI 買われすぎ/売られすぎ | `period`, `overbought`, `oversold` |
| `breakout` | 価格ブレイクアウト | `period`, `threshold` |
| `volume_breakout` | 出来高ブレイクアウト | `period`, `multiplier` |
| `bollinger_bounce` | ボリンジャーバンド反発 | `period`, `std_dev` |
| `smc_structure` | スマートマネーコンセプト構造 | `lookback` |
| `smc_level_entry` | SMC キーレベルエントリー | `lookback`, `zone_type` |

## エグジットブロックタイプ

| タイプ | 説明 | 主要パラメータ |
|---|---|---|
| `fixed_pct` | 固定パーセント TP/SL | `tp_pct`, `sl_pct` |
| `atr_mult` | ATR 倍率 TP/SL | `tp_atr_mult`, `sl_atr_mult`, `atr_period` |
| `atr_trail` | ATR トレーリングストップ | `trail_atr_mult`, `atr_period` |
| `time` | 時間ベースエグジット | `max_bars` |
| `key_bar` | キーバーパターンエグジット | `pattern` |
| `combined` | 複数条件組合せエグジット | 上記の任意の組合せ |

## 料金プラン

| プラン | 料金 | ボット数 | API Key | 通貨ペア数 |
|---|---|---|---|---|
| トライアル | 無料（7 日間） | 1 | 利用可 | BTC |
| Starter | $19/月 | 3 | 利用可 | 5 |
| Pro | $49/月 | 5 | 利用可 | 8 |
| Expert | $99/月 | 8 | 利用可 | 10 |
| Expert 10 | $125/月 | 10 | 利用可 | 10 |
| Expert 15 | $190/月 | 15 | 利用可 | 10 |
| Expert 30 | $385/月 | 30 | 利用可 | 10 |
| Expert 60 | $775/月 | 60 | 利用可 | 10 |

**すべてのプランで API Key が利用可能です。** 無料トライアルから始めて、クレジットを購入してバックテストし、必要に応じてプランをアップグレードしましょう。

クレジットはバックテスト実行ごとに消費されます。`create_payment_link` または `create_crypto_invoice` で `strategy_id: "credits_topup"` を使用して補充（最低 $10、$1 あたり 17 クレジット）。

## 決済方法

- **クレジットカード / USDC**：Helio 経由（`create_payment_link`）— Visa、Mastercard、または Solana 上の USDC
- **300 種類以上の暗号通貨**：NOWPayments 経由（`create_crypto_invoice`）— BTC、ETH、SOL、USDT など

## 開発

```bash
git clone https://github.com/clarencyu-boop/mcp-server-sentinel.git
cd mcp-server-sentinel
npm install
SENTINEL_API_KEY=sk-your-key node src/index.mjs
```

## ライセンス

MIT
