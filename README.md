# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

MCP server for [Sentinel Bot](https://sentinel.redclawey.com) — algorithmic trading backtesting, bot management, and account operations via AI agents.

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io) and provides 17 tools that let AI agents run crypto backtests, deploy trading bots, manage accounts, and handle payments — all through natural language.

## Quick Start

### 1. Get an API Key

Sign up for free at [sentinel.redclawey.com](https://sentinel.redclawey.com). API key access is available on **all plans including the free trial**. Generate an API key from your dashboard under **Settings > API Keys**. Buy credits to start backtesting, then upgrade your plan when you need more bots.

### 2. Install

#### Claude Code (recommended)

```bash
claude mcp add sentinel -- npx mcp-server-sentinel
```

Then set the environment variable:
```bash
export SENTINEL_API_KEY=sk-your-api-key-here
```

#### Claude Desktop

Add to your `claude_desktop_config.json`:

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

#### Manual (any MCP client)

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

## Tools (17)

### Backtesting

| Tool | Description |
|---|---|
| `run_backtest` | Submit a backtest and wait for the result. Supports 8 entry types and 6 exit types. Returns summary metrics by default; set `include_trades=true` for full trade list. |
| `get_backtest_result` | Fetch a specific backtest result by job ID. Optionally polls until completion. |
| `list_backtests` | List recent backtest jobs with optional status/symbol filters. |
| `cancel_backtest` | Cancel a running or queued backtest job. |

### Bot Management

| Tool | Description |
|---|---|
| `list_bots` | List all trading bots with status filter (idle/running/paused/stopped/error/halted). |
| `create_bot` | Create a new bot. Pass `strategy_blocks` from a backtest result to deploy a tested strategy. |
| `get_bot` | Get full details and current status of a bot. |
| `start_bot` | Start a bot (must have `exchange_id` configured). Dispatches live trading signals. |
| `stop_bot` | Stop a running or paused bot. |
| `delete_bot` | Permanently delete a bot (must be stopped first). |
| `get_bot_performance` | Get cumulative PnL, win rate, and trade count for a bot. |

### Exchanges

| Tool | Description |
|---|---|
| `list_exchanges` | List configured exchange credentials (Binance, Bybit, OKX, etc.). Use the exchange ID when creating bots. |

### Account & Payments

| Tool | Description |
|---|---|
| `get_account_info` | Current plan, credits balance, bot usage (used/max), and upgrade suggestions. |
| `get_plan_info` | Static plan pricing and feature comparison across all tiers. |
| `create_payment_link` | Create a Helio checkout link (card/USDC) for plan upgrades or credits top-up. |
| `create_crypto_invoice` | Create a NOWPayments invoice (300+ cryptocurrencies) for plan upgrades or credits top-up. |
| `verify_payment` | Check if a payment completed and the plan was upgraded. |

## Example Workflow

Here's how an AI agent typically uses these tools:

```
1. get_account_info        -> Check current plan, credits, bot capacity
2. run_backtest            -> Test a strategy (e.g., EMA cross on BTC 4h)
3. run_backtest            -> Compare with another strategy (e.g., RSI + ATR trail)
4. create_bot              -> Deploy the winning strategy (copy strategy_blocks)
5. list_exchanges          -> Find exchange_id
6. start_bot               -> Go live
7. get_bot_performance     -> Monitor results
```

If credits run out:
```
get_account_info           -> credits_balance: 0
create_payment_link        -> strategy_id: "credits_topup", amount_usd: 20
  -> Returns payment URL -> user completes in browser
verify_payment             -> Confirm credits added
run_backtest               -> Resume backtesting
```

## Supported Symbols

BTC, ETH, SOL, XRP, BNB, DOGE, LINK, TRX, SUI

## Supported Timeframes

1m, 5m, 15m, 1h, 4h, 1d

## Entry Block Types

| Type | Description | Key Parameters |
|---|---|---|
| `ema_cross` | EMA crossover | `fast_period`, `slow_period` |
| `macd_cross` | MACD signal crossover | `fast_period`, `slow_period`, `signal_period` |
| `rsi` | RSI overbought/oversold | `period`, `overbought`, `oversold` |
| `breakout` | Price breakout | `period`, `threshold` |
| `volume_breakout` | Volume spike breakout | `period`, `multiplier` |
| `bollinger_bounce` | Bollinger Band bounce | `period`, `std_dev` |
| `smc_structure` | Smart Money Concept structure | `lookback` |
| `smc_level_entry` | SMC level entry | `lookback`, `zone_type` |

## Exit Block Types

| Type | Description | Key Parameters |
|---|---|---|
| `fixed_pct` | Fixed percentage TP/SL | `tp_pct`, `sl_pct` |
| `atr_mult` | ATR multiplier TP/SL | `tp_atr_mult`, `sl_atr_mult`, `atr_period` |
| `atr_trail` | ATR trailing stop | `trail_atr_mult`, `atr_period` |
| `time` | Time-based exit | `max_bars` |
| `key_bar` | Key bar pattern exit | `pattern` |
| `combined` | Multiple exit conditions | Combine any of the above |

## Pricing

| Plan | Price | Bots | API Key | Symbols |
|---|---|---|---|---|
| Trial | Free (7 days) | 1 | Yes | BTC |
| Starter | $19/mo | 3 | Yes | 5 |
| Pro | $49/mo | 5 | Yes | 8 |
| Expert | $99/mo | 8 | Yes | 10 |
| Expert 10 | $125/mo | 10 | Yes | 10 |
| Expert 15 | $190/mo | 15 | Yes | 10 |
| Expert 30 | $385/mo | 30 | Yes | 10 |
| Expert 60 | $775/mo | 60 | Yes | 10 |

**API key access is available on all plans.** Start with the free trial, buy credits to run backtests, and upgrade when you need more bots or symbols.

Credits are consumed per backtest run. Top up with `create_payment_link` or `create_crypto_invoice` using `strategy_id: "credits_topup"` (min $10, 17 credits per $1).

## Payment Methods

- **Card / USDC**: Via Helio (`create_payment_link`) — Visa, Mastercard, or USDC on Solana
- **300+ Cryptocurrencies**: Via NOWPayments (`create_crypto_invoice`) — BTC, ETH, SOL, USDT, and more

## Development

```bash
git clone https://github.com/clarencyu-boop/mcp-server-sentinel.git
cd mcp-server-sentinel
npm install
SENTINEL_API_KEY=sk-your-key node src/index.mjs
```

## License

MIT
