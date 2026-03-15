# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

[Sentinel Bot](https://sentinel.redclawey.com) 的 MCP 服务器 — 通过 AI 代理进行算法交易回测、机器人管理及账户操作。

本服务器实现了 [Model Context Protocol (MCP)](https://modelcontextprotocol.io)，提供 36 个工具，让 AI 代理可以执行加密货币回测、部署交易机器人、参数优化、浏览策略市场、管理账户及处理付款 — 全部通过自然语言完成。

## 为什么使用这个 MCP 服务器？

本 MCP 服务器专为 [Sentinel 自动化算法交易平台](https://sentinel.redclawey.com) 设计，支持完整的 AI Agent 交易工作流程。通过 MCP 连接你的 AI 代理与 Sentinel，即可获得完整的 Agent 驱动交易管线：

- **自然语言回测** — 描述策略想法，AI 自动生成并测试
- **一次对话即可部署** — 从回测到上线机器人，无需写代码
- **实时监控** — PnL 追踪、交易信号、SMC 市场分析
- **完全自主** — 策略研究、参数优化、交易执行，全由 AI 代理处理

推荐搭配 Claude Code、Claude Desktop 或任何支持 MCP 的 AI 客户端使用。

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

## 工具（36 个）

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
| `pause_bot` | 暂停运行中的机器人（保留仓位，停止新信号）。仅限 RUNNING 状态。 |
| `recover_bot` | 恢复 HALTED 状态的机器人（重置熔断机制）。仅限 HALTED 状态。 |
| `delete_bot` | 永久删除机器人（需先停止）。 |
| `get_bot_performance` | 获取机器人的累计盈亏、胜率和交易次数。 |
| `get_bot_trades` | 获取机器人的分页交易记录，含进出场价格与盈亏。 |

### 交易所

| 工具 | 说明 |
|---|---|
| `list_exchanges` | 列出已配置的交易所凭证（Binance、Bybit、OKX 等）。创建机器人时使用交易所 ID。 |

### OKX 交易所

| 工具 | 说明 |
|---|---|
| `okx_orderbook` | 获取 OKX 订单簿（公开数据，无需凭证）。 |
| `okx_funding_rate` | 获取 OKX 永续合约当前资金费率。 |
| `okx_set_leverage` | 设置 OKX 杠杆与保证金模式（需 OKX 凭证）。 |
| `okx_positions` | 获取当前 OKX 持仓（需 OKX 凭证）。 |
| `okx_algo_order` | 在 OKX 下条件/算法委托（止盈/止损/追踪/OCO）。 |
| `okx_market_overview` | 获取 OKX 涨幅榜与成交量排行（公开数据）。 |

### AI 策略

| 工具 | 说明 |
|---|---|
| `build_strategy` | 以自然语言通过 AI 生成交易策略。消耗 1 点。返回 `strategy_blocks` JSON，可直接用于 `create_bot` 或 `run_backtest`。 |

### Grid 优化

| 工具 | 说明 |
|---|---|
| `run_grid_backtest` | 参数扫描回测。每组参数消耗 1 点。支持等待模式。 |
| `get_grid_status` | 查询 Grid 回测进度与前 10 名结果。 |
| `get_grid_results` | 获取完整分页 Grid 结果，可按各项指标排序。 |

### 分析与信号

| 工具 | 说明 |
|---|---|
| `get_analysis` | 获取最新 SMC 分析：方向、评分、AI 摘要。需订阅分析服务。 |
| `get_analysis_history` | 列出历史每日分析记录。 |
| `get_signals` | 获取机器人交易信号，含方向、价格、执行状态。 |

### 策略市场

| 工具 | 说明 |
|---|---|
| `list_strategies` | 浏览市场策略，按盈亏、胜率、Sharpe 排名。 |
| `get_strategy_detail` | 完整策略详情 + 近期交易 + 订阅状态。 |
| `subscribe_strategy` | 订阅跟单交易。免费策略立即激活；付费策略返回付款链接。 |

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
1. build_strategy          -> AI 根据描述生成策略（消耗 1 点）
2. run_backtest            -> 以历史数据验证
3. run_grid_backtest       -> 优化参数
4. get_grid_results        -> 找出最佳参数组合
5. create_bot              -> 以最优参数部署
6. start_bot               -> 上线交易
7. get_signals             -> 监控信号执行
8. get_analysis            -> 查看每日市场分析
9. get_bot_performance     -> 查看盈亏
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
