# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

[Sentinel Bot](https://sentinel.redclawey.com) 的 MCP 伺服器 — 透過 AI 代理進行演算法交易回測、機器人管理及帳戶操作。

本伺服器實作了 [Model Context Protocol (MCP)](https://modelcontextprotocol.io)，提供 36 個工具，讓 AI 代理可以執行加密貨幣回測、部署交易機器人、參數最佳化、瀏覽策略市集、管理帳戶及處理付款 — 全部透過自然語言完成。

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

## 工具（36 個）

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
| `pause_bot` | 暫停執行中的機器人（保留部位，停止新訊號）。僅限 RUNNING 狀態。 |
| `recover_bot` | 恢復 HALTED 狀態的機器人（重置熔斷機制）。僅限 HALTED 狀態。 |
| `delete_bot` | 永久刪除機器人（需先停止）。 |
| `get_bot_performance` | 取得機器人的累計損益、勝率和交易次數。 |
| `get_bot_trades` | 取得機器人的分頁交易紀錄，含進出場價格與損益。 |

### 交易所

| 工具 | 說明 |
|---|---|
| `list_exchanges` | 列出已設定的交易所憑證（Binance、Bybit、OKX 等）。建立機器人時使用交易所 ID。 |

### OKX 交易所

| 工具 | 說明 |
|---|---|
| `okx_orderbook` | 取得 OKX 訂單簿（公開資料，無需憑證）。 |
| `okx_funding_rate` | 取得 OKX 永續合約目前資金費率。 |
| `okx_set_leverage` | 設定 OKX 槓桿與保證金模式（需 OKX 憑證）。 |
| `okx_positions` | 取得目前 OKX 持倉（需 OKX 憑證）。 |
| `okx_algo_order` | 在 OKX 下條件/演算法委託（止盈/止損/追蹤/OCO）。 |
| `okx_market_overview` | 取得 OKX 漲幅榜與成交量排行（公開資料）。 |

### AI 策略

| 工具 | 說明 |
|---|---|
| `build_strategy` | 以自然語言透過 AI 生成交易策略。消耗 1 點。回傳 `strategy_blocks` JSON，可直接用於 `create_bot` 或 `run_backtest`。 |

### Grid 最佳化

| 工具 | 說明 |
|---|---|
| `run_grid_backtest` | 參數掃描回測。每組參數消耗 1 點。支援等待模式。 |
| `get_grid_status` | 查詢 Grid 回測進度與前 10 名結果。 |
| `get_grid_results` | 取得完整分頁 Grid 結果，可依各項指標排序。 |

### 分析與訊號

| 工具 | 說明 |
|---|---|
| `get_analysis` | 取得最新 SMC 分析：方向、評分、AI 摘要。需訂閱分析服務。 |
| `get_analysis_history` | 列出歷史每日分析紀錄。 |
| `get_signals` | 取得機器人交易訊號，含方向、價格、執行狀態。 |

### 策略市集

| 工具 | 說明 |
|---|---|
| `list_strategies` | 瀏覽市集策略，依損益、勝率、Sharpe 排名。 |
| `get_strategy_detail` | 完整策略詳情 + 近期交易 + 訂閱狀態。 |
| `subscribe_strategy` | 訂閱跟單交易。免費策略立即啟用；付費策略回傳付款連結。 |

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
1. build_strategy          -> AI 依描述生成策略（消耗 1 點）
2. run_backtest            -> 以歷史資料驗證
3. run_grid_backtest       -> 最佳化參數
4. get_grid_results        -> 找出最佳參數組合
5. create_bot              -> 以最佳參數部署
6. start_bot               -> 上線交易
7. get_signals             -> 監控訊號執行
8. get_analysis            -> 查看每日市場分析
9. get_bot_performance     -> 檢視損益
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
