# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

MCP server for [Sentinel Bot](https://sentinel.redclawey.com) — algorithmic trading backtesting, bot management, and account operations via AI agents.

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io), providing 36 tools that let AI agents run crypto backtests, deploy trading bots, optimize parameters, browse strategy marketplace, and manage accounts & payments — all through natural language.

## Why Use This MCP Server?

This MCP server is built for [Sentinel — an autonomous algorithmic trading platform](https://sentinel.redclawey.com) designed for AI agent workflows. By connecting your AI agent to Sentinel via MCP, you get a complete agent-driven trading pipeline:

- **Natural language backtesting** — describe a strategy idea, AI generates and tests it
- **One-conversation deployment** — go from backtest to live trading bot without writing code
- **Real-time monitoring** — PnL tracking, trading signals, and SMC market analysis
- **Full autonomy** — strategy research, parameter optimization, and trade execution, all handled by your AI agent

Best paired with Claude Code, Claude Desktop, or any MCP-compatible AI client.

## Quick Start

### 1. Get an API Key

Sign up for free at [sentinel.redclawey.com](https://sentinel.redclawey.com). **All plans (including the free trial) support API Keys**. Generate a key in your dashboard under **Settings > API Keys**. Purchase credits to start backtesting, then upgrade your plan as needed for more bots.

### 2. Installation

#### Claude Code (Recommended)

```bash
claude mcp add sentinel -- npx mcp-server-sentinel
```

Then set your environment variable:
```bash
export SENTINEL_API_KEY=sk-your-api-key-here
```

#### Claude Desktop

Add to `claude_desktop_config.json`:

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

#### Manual Setup (Any MCP Client)

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

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SENTINEL_API_KEY` | Yes | — | Your API key (starts with `sk-`) |
| `SENTINEL_API_URL` | No | `https://sentinel.redclawey.com/api/v1` | API base URL |

## Tools (36)

### Backtesting

| Tool | Description |
|---|---|
| `run_backtest` | Submit a backtest and wait for results. Supports 8 entry types and 6 exit types. Returns summary metrics by default; set `include_trades=true` for the full trade list. |
| `get_backtest_result` | Fetch a specific backtest result by Job ID. Optionally polls until completion. |
| `list_backtests` | List recent backtest jobs, filterable by status/symbol. |
| `cancel_backtest` | Cancel a running or queued backtest job. |

### Bot Management

| Tool | Description |
|---|---|
| `list_bots` | List all trading bots with optional status filter (idle/running/paused/stopped/error/halted). |
| `create_bot` | Create a new bot. Pass `strategy_blocks` from a backtest result to deploy a tested strategy. |
| `get_bot` | Get full bot details and current status. |
| `start_bot` | Start a bot (requires `exchange_id` to be set). Dispatches live trading signals. |
| `stop_bot` | Stop a running or paused bot. |
| `pause_bot` | Pause a running bot (keeps positions, stops new signals). Only RUNNING bots. |
| `recover_bot` | Recover a HALTED bot (circuit breaker reset). Only HALTED bots. |
| `delete_bot` | Permanently delete a bot (must be stopped first). |
| `get_bot_performance` | Get cumulative PnL, win rate, and trade count for a bot. |
| `get_bot_trades` | Get paginated trade history for a bot with entry/exit prices, PnL. |

### Exchanges

| Tool | Description |
|---|---|
| `list_exchanges` | List configured exchange credentials (Binance, Bybit, OKX, etc.). Use the exchange ID when creating a bot. |

### OKX Exchange

| Tool | Description |
|---|---|
| `okx_orderbook` | Fetch OKX order book (public, no credentials needed). |
| `okx_funding_rate` | Get current funding rate for OKX perpetual swap. |
| `okx_set_leverage` | Set leverage and margin mode on OKX (requires OKX credentials). |
| `okx_positions` | Get current OKX positions (requires OKX credentials). |
| `okx_algo_order` | Place conditional/algo order on OKX (TP/SL/trailing/OCO). |
| `okx_market_overview` | Get OKX top movers and volume leaders (public). |

### AI Strategy

| Tool | Description |
|---|---|
| `build_strategy` | Generate a trading strategy from natural language using AI. Costs 1 credit. Returns `strategy_blocks` JSON for `create_bot` or `run_backtest`. |

### Grid Optimization

| Tool | Description |
|---|---|
| `run_grid_backtest` | Parameter sweep backtest. Each combo costs 1 credit. Supports wait mode. |
| `get_grid_status` | Check grid backtest progress and top 10 results. |
| `get_grid_results` | Get full paginated grid results, sortable by various metrics. |

### Analysis & Signals

| Tool | Description |
|---|---|
| `get_analysis` | Get latest SMC analysis: direction, scores, AI summaries. Requires Analysis Subscription. |
| `get_analysis_history` | List historical daily analysis runs. |
| `get_signals` | Get trading signals from bots with direction, prices, execution status. |

### Strategy Marketplace

| Tool | Description |
|---|---|
| `list_strategies` | Browse marketplace strategies ranked by PnL, win rate, Sharpe. |
| `get_strategy_detail` | Full strategy details + recent trades + subscription status. |
| `subscribe_strategy` | Subscribe for copy-trading. Free strategies activate immediately; paid returns payment URL. |

### Account & Payments

| Tool | Description |
|---|---|
| `get_account_info` | Current plan, credits balance, bot usage (used/max), and upgrade suggestions. |
| `get_plan_info` | Static plan pricing and feature comparison across tiers. |
| `create_payment_link` | Create a Helio checkout link (credit card/USDC) for plan upgrades or credit top-ups. |
| `create_crypto_invoice` | Create a NOWPayments invoice (300+ cryptocurrencies) for plan upgrades or credit top-ups. |
| `verify_payment` | Confirm whether a payment completed and the plan was upgraded. |

## Usage Examples

Typical AI agent workflow:

```
1. build_strategy          -> AI generates strategy from description (1 credit)
2. run_backtest            -> Validate on historical data
3. run_grid_backtest       -> Optimize parameters
4. get_grid_results        -> Find best parameter combo
5. create_bot              -> Deploy with optimal params
6. start_bot               -> Go live
7. get_signals             -> Monitor signal execution
8. get_analysis            -> Check daily market analysis
9. get_bot_performance     -> Review PnL
```

When credits run out:
```
get_account_info           -> credits_balance: 0
create_payment_link        -> strategy_id: "credits_topup", amount_usd: 20
  -> Returns payment URL -> User completes payment in browser
verify_payment             -> Confirm credits added
run_backtest               -> Continue backtesting
```

## Supported Symbols

BTC, ETH, SOL, XRP, BNB, DOGE, LINK, TRX, SUI

## Supported Timeframes

1m, 5m, 15m, 1h, 4h, 1d

## Entry Block Types

| Type | Description | Key Parameters |
|---|---|---|
| `ema_cross` | EMA Crossover | `fast_period`, `slow_period` |
| `macd_cross` | MACD Signal Cross | `fast_period`, `slow_period`, `signal_period` |
| `rsi` | RSI Overbought/Oversold | `period`, `overbought`, `oversold` |
| `breakout` | Price Breakout | `period`, `threshold` |
| `volume_breakout` | Volume Breakout | `period`, `multiplier` |
| `bollinger_bounce` | Bollinger Band Bounce | `period`, `std_dev` |
| `smc_structure` | Smart Money Concept Structure | `lookback` |
| `smc_level_entry` | SMC Key Level Entry | `lookback`, `zone_type` |

## Exit Block Types

| Type | Description | Key Parameters |
|---|---|---|
| `fixed_pct` | Fixed Percentage TP/SL | `tp_pct`, `sl_pct` |
| `atr_mult` | ATR Multiple TP/SL | `tp_atr_mult`, `sl_atr_mult`, `atr_period` |
| `atr_trail` | ATR Trailing Stop | `trail_atr_mult`, `atr_period` |
| `time` | Time-based Exit | `max_bars` |
| `key_bar` | Key Bar Pattern Exit | `pattern` |
| `combined` | Multi-condition Combined Exit | Any combination of the above |

## Plan Pricing

| Plan | Price | Bots | API Key | Symbols |
|---|---|---|---|---|
| Trial | Free (7 days) | 1 | Available | BTC |
| Starter | $19/mo | 3 | Available | 5 |
| Pro | $49/mo | 5 | Available | 8 |
| Expert | $99/mo | 8 | Available | 10 |
| Expert 10 | $125/mo | 10 | Available | 10 |
| Expert 15 | $190/mo | 15 | Available | 10 |
| Expert 30 | $385/mo | 30 | Available | 10 |
| Expert 60 | $775/mo | 60 | Available | 10 |

**All plans include API Key access.** Start with the free trial, purchase credits for backtesting, then upgrade your plan as needed for more bots or symbols.

Credits are consumed per backtest run. Use `create_payment_link` or `create_crypto_invoice` with `strategy_id: "credits_topup"` to top up (minimum $10, 17 credits per $1).

## Payment Methods

- **Credit Card / USDC**: Via Helio (`create_payment_link`) — Visa, Mastercard, or USDC on Solana
- **300+ Cryptocurrencies**: Via NOWPayments (`create_crypto_invoice`) — BTC, ETH, SOL, USDT, etc.

## Development

```bash
git clone https://github.com/clarencyu-boop/mcp-server-sentinel.git
cd mcp-server-sentinel
npm install
SENTINEL_API_KEY=sk-your-key node src/index.mjs
```

## License

MIT
