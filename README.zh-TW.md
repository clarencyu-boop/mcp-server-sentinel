# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

[Sentinel Bot](https://sentinel.redclawey.com) 的 MCP 伺服器 — 透過 AI 代理進行演算法交易回測、機器人管理及帳戶操作。

本伺服器實作了 [Model Context Protocol (MCP)](https://modelcontextprotocol.io)，提供 17 個工具，讓 AI 代理可以執行加密貨幣回測、部署交易機器人、管理帳戶及處理付款 — 全部透過自然語言完成。

## 快速開始

### 1. 取得 API Key

在 [sentinel.redclawey.com](https://sentinel.redclawey.com) 免費註冊。**所有方案（包含免費試用）都可使用 API Key**。在儀表板的 **設定 > API Keys** 中產生金鑰。購買點數開始回測，再依需求升級方案以取得更多機器人。

### 2. 安裝

#### Claude Code（推薦）

```bash
claude mcp add sentinel -- npx mcp-server-sentinel
```

然後設定環境變數：
```bash
export SENTINEL_API_KEY=sk-your-api-key-here
```

#### Claude Desktop

在 `claude_desktop_config.json` 中加入：

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

#### 手動設定（任何 MCP 客戶端）

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

## 環境變數

| 變數 | 必填 | 預設值 | 說明 |
|---|---|---|---|
| `SENTINEL_API_KEY` | 是 | — | 您的 API 金鑰（以 `sk-` 開頭） |
| `SENTINEL_API_URL` | 否 | `https://sentinel.redclawey.com/api/v1` | API 基礎 URL |

## 工具（17 個）

### 回測

| 工具 | 說明 |
|---|---|
| `run_backtest` | 提交回測並等待結果。支援 8 種進場類型和 6 種出場類型。預設回傳摘要指標；設定 `include_trades=true` 可取得完整交易清單。 |
| `get_backtest_result` | 依 Job ID 取得特定回測結果。可選擇輪詢直到完成。 |
| `list_backtests` | 列出近期回測任務，可依狀態/幣種篩選。 |
| `cancel_backtest` | 取消執行中或排隊中的回測任務。 |

### 機器人管理

| 工具 | 說明 |
|---|---|
| `list_bots` | 列出所有交易機器人，可依狀態篩選（idle/running/paused/stopped/error/halted）。 |
| `create_bot` | 建立新機器人。傳入回測結果的 `strategy_blocks` 即可部署已測試的策略。 |
| `get_bot` | 取得機器人完整詳情與目前狀態。 |
| `start_bot` | 啟動機器人（需先設定 `exchange_id`）。發送即時交易訊號。 |
| `stop_bot` | 停止執行中或暫停的機器人。 |
| `delete_bot` | 永久刪除機器人（需先停止）。 |
| `get_bot_performance` | 取得機器人的累計損益、勝率和交易次數。 |

### 交易所

| 工具 | 說明 |
|---|---|
| `list_exchanges` | 列出已設定的交易所憑證（Binance、Bybit、OKX 等）。建立機器人時使用交易所 ID。 |

### 帳戶與付款

| 工具 | 說明 |
|---|---|
| `get_account_info` | 目前方案、點數餘額、機器人使用量（已用/上限）及升級建議。 |
| `get_plan_info` | 靜態方案定價與各層級功能比較。 |
| `create_payment_link` | 建立 Helio 結帳連結（信用卡/USDC），用於方案升級或點數儲值。 |
| `create_crypto_invoice` | 建立 NOWPayments 發票（300+ 種加密貨幣），用於方案升級或點數儲值。 |
| `verify_payment` | 確認付款是否完成及方案是否已升級。 |

## 使用範例

AI 代理的典型工作流程：

```
1. get_account_info        -> 查看目前方案、點數、機器人容量
2. run_backtest            -> 測試策略（例：BTC 4h EMA 交叉）
3. run_backtest            -> 比較另一策略（例：RSI + ATR 追蹤停損）
4. create_bot              -> 部署勝出的策略（複製 strategy_blocks）
5. list_exchanges          -> 找到 exchange_id
6. start_bot               -> 上線交易
7. get_bot_performance     -> 監控結果
```

點數用完時：
```
get_account_info           -> credits_balance: 0
create_payment_link        -> strategy_id: "credits_topup", amount_usd: 20
  -> 回傳付款連結 -> 使用者在瀏覽器中完成付款
verify_payment             -> 確認點數已到帳
run_backtest               -> 繼續回測
```

## 支援幣種

BTC, ETH, SOL, XRP, BNB, DOGE, LINK, TRX, SUI

## 支援時間框架

1m, 5m, 15m, 1h, 4h, 1d

## 進場區塊類型

| 類型 | 說明 | 主要參數 |
|---|---|---|
| `ema_cross` | EMA 交叉 | `fast_period`, `slow_period` |
| `macd_cross` | MACD 訊號交叉 | `fast_period`, `slow_period`, `signal_period` |
| `rsi` | RSI 超買/超賣 | `period`, `overbought`, `oversold` |
| `breakout` | 價格突破 | `period`, `threshold` |
| `volume_breakout` | 成交量突破 | `period`, `multiplier` |
| `bollinger_bounce` | 布林通道反彈 | `period`, `std_dev` |
| `smc_structure` | Smart Money 結構 | `lookback` |
| `smc_level_entry` | SMC 關鍵位進場 | `lookback`, `zone_type` |

## 出場區塊類型

| 類型 | 說明 | 主要參數 |
|---|---|---|
| `fixed_pct` | 固定百分比止盈/止損 | `tp_pct`, `sl_pct` |
| `atr_mult` | ATR 倍數止盈/止損 | `tp_atr_mult`, `sl_atr_mult`, `atr_period` |
| `atr_trail` | ATR 追蹤停損 | `trail_atr_mult`, `atr_period` |
| `time` | 時間出場 | `max_bars` |
| `key_bar` | 關鍵K線出場 | `pattern` |
| `combined` | 多條件組合出場 | 以上任意組合 |

## 方案定價

| 方案 | 價格 | 機器人數 | API Key | 幣種數 |
|---|---|---|---|---|
| 試用 | 免費（7 天） | 1 | 可用 | BTC |
| Starter | $19/月 | 3 | 可用 | 5 |
| Pro | $49/月 | 5 | 可用 | 8 |
| Expert | $99/月 | 8 | 可用 | 10 |
| Expert 10 | $125/月 | 10 | 可用 | 10 |
| Expert 15 | $190/月 | 15 | 可用 | 10 |
| Expert 30 | $385/月 | 30 | 可用 | 10 |
| Expert 60 | $775/月 | 60 | 可用 | 10 |

**所有方案皆可使用 API Key。** 從免費試用開始，購買點數進行回測，再依需求升級方案取得更多機器人或幣種。

點數依回測次數消耗。使用 `create_payment_link` 或 `create_crypto_invoice` 搭配 `strategy_id: "credits_topup"` 儲值（最低 $10，每 $1 = 17 點）。

## 付款方式

- **信用卡 / USDC**：透過 Helio（`create_payment_link`）— Visa、Mastercard 或 Solana 上的 USDC
- **300+ 種加密貨幣**：透過 NOWPayments（`create_crypto_invoice`）— BTC、ETH、SOL、USDT 等

## 開發

```bash
git clone https://github.com/clarencyu-boop/mcp-server-sentinel.git
cd mcp-server-sentinel
npm install
SENTINEL_API_KEY=sk-your-key node src/index.mjs
```

## 授權

MIT
