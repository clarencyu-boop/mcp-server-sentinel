# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

[Sentinel Bot](https://sentinel.redclawey.com) 的 MCP 服务器 — 通过 AI 代理进行算法交易回测、机器人管理及账户操作。

本服务器实现了 [Model Context Protocol (MCP)](https://modelcontextprotocol.io)，提供 17 个工具，让 AI 代理可以执行加密货币回测、部署交易机器人、管理账户及处理付款 — 全部通过自然语言完成。

## 快速开始

### 1. 获取 API Key

在 [sentinel.redclawey.com](https://sentinel.redclawey.com) 免费注册。**所有方案（包含免费试用）都可使用 API Key**。在仪表板的 **设置 > API Keys** 中生成密钥。购买点数开始回测，再根据需求升级方案以获得更多机器人。

### 2. 安装

#### Claude Code（推荐）

```bash
claude mcp add sentinel -- npx mcp-server-sentinel
```

然后设置环境变量：
```bash
export SENTINEL_API_KEY=sk-your-api-key-here
```

#### Claude Desktop

在 `claude_desktop_config.json` 中添加：

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

#### 手动配置（任何 MCP 客户端）

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

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `SENTINEL_API_KEY` | 是 | — | 您的 API 密钥（以 `sk-` 开头） |
| `SENTINEL_API_URL` | 否 | `https://sentinel.redclawey.com/api/v1` | API 基础 URL |

## 工具（17 个）

### 回测

| 工具 | 说明 |
|---|---|
| `run_backtest` | 提交回测并等待结果。支持 8 种入场类型和 6 种出场类型。默认返回摘要指标；设置 `include_trades=true` 可获取完整交易列表。 |
| `get_backtest_result` | 按 Job ID 获取特定回测结果。可选轮询直到完成。 |
| `list_backtests` | 列出近期回测任务，可按状态/币种筛选。 |
| `cancel_backtest` | 取消运行中或排队中的回测任务。 |

### 机器人管理

| 工具 | 说明 |
|---|---|
| `list_bots` | 列出所有交易机器人，可按状态筛选（idle/running/paused/stopped/error/halted）。 |
| `create_bot` | 创建新机器人。传入回测结果的 `strategy_blocks` 即可部署已测试的策略。 |
| `get_bot` | 获取机器人完整详情和当前状态。 |
| `start_bot` | 启动机器人（需先配置 `exchange_id`）。发送实时交易信号。 |
| `stop_bot` | 停止运行中或暂停的机器人。 |
| `delete_bot` | 永久删除机器人（需先停止）。 |
| `get_bot_performance` | 获取机器人的累计盈亏、胜率和交易次数。 |

### 交易所

| 工具 | 说明 |
|---|---|
| `list_exchanges` | 列出已配置的交易所凭证（Binance、Bybit、OKX 等）。创建机器人时使用交易所 ID。 |

### 账户与付款

| 工具 | 说明 |
|---|---|
| `get_account_info` | 当前方案、点数余额、机器人使用量（已用/上限）及升级建议。 |
| `get_plan_info` | 静态方案定价与各层级功能比较。 |
| `create_payment_link` | 创建 Helio 结账链接（信用卡/USDC），用于方案升级或点数充值。 |
| `create_crypto_invoice` | 创建 NOWPayments 发票（300+ 种加密货币），用于方案升级或点数充值。 |
| `verify_payment` | 确认付款是否完成及方案是否已升级。 |

## 使用示例

AI 代理的典型工作流程：

```
1. get_account_info        -> 查看当前方案、点数、机器人容量
2. run_backtest            -> 测试策略（例：BTC 4h EMA 交叉）
3. run_backtest            -> 比较另一策略（例：RSI + ATR 追踪止损）
4. create_bot              -> 部署胜出的策略（复制 strategy_blocks）
5. list_exchanges          -> 找到 exchange_id
6. start_bot               -> 上线交易
7. get_bot_performance     -> 监控结果
```

点数用完时：
```
get_account_info           -> credits_balance: 0
create_payment_link        -> strategy_id: "credits_topup", amount_usd: 20
  -> 返回付款链接 -> 用户在浏览器中完成付款
verify_payment             -> 确认点数已到账
run_backtest               -> 继续回测
```

## 支持币种

BTC, ETH, SOL, XRP, BNB, DOGE, LINK, TRX, SUI

## 支持时间框架

1m, 5m, 15m, 1h, 4h, 1d

## 入场区块类型

| 类型 | 说明 | 主要参数 |
|---|---|---|
| `ema_cross` | EMA 交叉 | `fast_period`, `slow_period` |
| `macd_cross` | MACD 信号交叉 | `fast_period`, `slow_period`, `signal_period` |
| `rsi` | RSI 超买/超卖 | `period`, `overbought`, `oversold` |
| `breakout` | 价格突破 | `period`, `threshold` |
| `volume_breakout` | 成交量突破 | `period`, `multiplier` |
| `bollinger_bounce` | 布林通道反弹 | `period`, `std_dev` |
| `smc_structure` | Smart Money 结构 | `lookback` |
| `smc_level_entry` | SMC 关键位入场 | `lookback`, `zone_type` |

## 出场区块类型

| 类型 | 说明 | 主要参数 |
|---|---|---|
| `fixed_pct` | 固定百分比止盈/止损 | `tp_pct`, `sl_pct` |
| `atr_mult` | ATR 倍数止盈/止损 | `tp_atr_mult`, `sl_atr_mult`, `atr_period` |
| `atr_trail` | ATR 追踪止损 | `trail_atr_mult`, `atr_period` |
| `time` | 时间出场 | `max_bars` |
| `key_bar` | 关键K线出场 | `pattern` |
| `combined` | 多条件组合出场 | 以上任意组合 |

## 方案定价

| 方案 | 价格 | 机器人数 | API Key | 币种数 |
|---|---|---|---|---|
| 试用 | 免费（7 天） | 1 | 可用 | BTC |
| Starter | $19/月 | 3 | 可用 | 5 |
| Pro | $49/月 | 5 | 可用 | 8 |
| Expert | $99/月 | 8 | 可用 | 10 |
| Expert 10 | $125/月 | 10 | 可用 | 10 |
| Expert 15 | $190/月 | 15 | 可用 | 10 |
| Expert 30 | $385/月 | 30 | 可用 | 10 |
| Expert 60 | $775/月 | 60 | 可用 | 10 |

**所有方案均可使用 API Key。** 从免费试用开始，购买点数进行回测，再根据需求升级方案获得更多机器人或币种。

点数按回测次数消耗。使用 `create_payment_link` 或 `create_crypto_invoice` 配合 `strategy_id: "credits_topup"` 充值（最低 $10，每 $1 = 17 点）。

## 付款方式

- **信用卡 / USDC**：通过 Helio（`create_payment_link`）— Visa、Mastercard 或 Solana 上的 USDC
- **300+ 种加密货币**：通过 NOWPayments（`create_crypto_invoice`）— BTC、ETH、SOL、USDT 等

## 开发

```bash
git clone https://github.com/clarencyu-boop/mcp-server-sentinel.git
cd mcp-server-sentinel
npm install
SENTINEL_API_KEY=sk-your-key node src/index.mjs
```

## 许可证

MIT
