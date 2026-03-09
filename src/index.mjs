#!/usr/bin/env node
/**
 * Sentinel Bot MCP Server v1.2.0
 *
 * Tools:
 *   Backtest:
 *     1.  run_backtest          — submit a backtest; returns slim summary by default
 *     2.  get_backtest_result   — fetch a specific backtest result by job_id
 *     3.  list_backtests        — list recent backtests
 *     4.  cancel_backtest       — cancel a running backtest job
 *   Bots:
 *     5.  list_bots             — list all trading bots
 *     6.  create_bot            — create a new trading bot
 *     7.  get_bot               — get bot details and status
 *     8.  start_bot             — start a bot (requires exchange configured)
 *     9.  stop_bot              — stop a running bot
 *    10.  delete_bot            — delete a stopped/idle bot
 *    11.  get_bot_performance   — get bot cumulative PnL summary
 *   Exchanges:
 *    12.  list_exchanges        — list configured exchange credentials
 *   Account & Payments:
 *    13.  get_account_info      — current plan, credits, bot usage, API key metadata
 *    14.  get_plan_info         — static plan pricing and feature comparison
 *    15.  create_payment_link   — Helio (card/USDC) checkout link for plan upgrade
 *    16.  create_crypto_invoice — NOWPayments (300+ crypto) invoice for plan upgrade
 *    17.  verify_payment        — check if a payment completed and plan was upgraded
 *
 * Transport: stdio (for Claude Code / any MCP client)
 * Auth: SENTINEL_API_KEY env var → X-Api-Key header (EXPERT plan required)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.SENTINEL_API_URL || "https://sentinel.redclawey.com/api/v1";
const API_KEY  = process.env.SENTINEL_API_KEY;

if (!API_KEY) {
  console.error("[sentinel-mcp] SENTINEL_API_KEY not set");
  process.exit(1);
}

// ── HTTP helpers ──────────────────────────────────────────────

const authHeaders = () => ({
  "X-Api-Key": API_KEY,
  "Content-Type": "application/json",
});

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  const body = await res.json();
  if (!res.ok) throw new Error(`Sentinel API ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Sentinel API ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 204) return { success: true };
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Sentinel API ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

// ── Backtest result helpers ───────────────────────────────────

/**
 * Strip large arrays from a completed backtest result.
 * strategy_blocks is passed explicitly from the request payload (API doesn't echo it back).
 */
function slimResult(data, strategy_blocks = null) {
  return {
    id: data.id,
    metadata: data.metadata,
    summary: data.summary,
    strategy_blocks,
    _note: strategy_blocks
      ? "Copy strategy_blocks into create_bot to deploy this strategy. Trades/equity omitted — set include_trades=true for full data."
      : "Trades and equity curve omitted. Set include_trades=true to get full data.",
  };
}

/** Poll backtest job until terminal state or timeout (default 5 min). */
async function waitForResult(jobId, timeoutMs = 300_000, intervalMs = 3_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const job = await apiGet(`/backtest/${jobId}`);
    if (job.status === "completed") {
      try { return await apiGet(`/backtest/${jobId}/result`); }
      catch { return job; }
    }
    if (job.status === "failed" || job.status === "cancelled") return job;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Backtest ${jobId} did not complete within ${timeoutMs / 1000}s`);
}

// ── Plan pricing reference (embedded — no API call needed) ────

const PLAN_CATALOG = {
  plans: [
    {
      id: "trial",        name: "Free Trial",       price_usd: 0,   duration: "7 days",
      max_bots: 1,        symbols: ["BTC"],          api_key_access: true,
    },
    {
      id: "plan_starter", name: "Starter",           price_usd: 19,  billing: "monthly",
      max_bots: 3,        symbols: ["BTC","ETH","SOL","XRP","BNB"],
      api_key_access: true,
    },
    {
      id: "plan_pro",     name: "Pro",               price_usd: 49,  billing: "monthly",
      max_bots: 5,        symbols: ["BTC","ETH","SOL","XRP","BNB","DOGE","LINK","TRX"],
      api_key_access: true,
    },
    {
      id: "plan_expert",  name: "Expert (8 bots)",   price_usd: 99,  billing: "monthly",
      max_bots: 8,        symbols: ["BTC","ETH","SOL","XRP","BNB","DOGE","LINK","TRX","SUI","WLFI"],
      api_key_access: true,
    },
    { id: "plan_expert_10", name: "Expert (10 bots)", price_usd: 125, billing: "monthly", max_bots: 10 },
    { id: "plan_expert_12", name: "Expert (12 bots)", price_usd: 151, billing: "monthly", max_bots: 12 },
    { id: "plan_expert_15", name: "Expert (15 bots)", price_usd: 190, billing: "monthly", max_bots: 15 },
    { id: "plan_expert_30", name: "Expert (30 bots)", price_usd: 385, billing: "monthly", max_bots: 30 },
    { id: "plan_expert_60", name: "Expert (60 bots)", price_usd: 775, billing: "monthly", max_bots: 60 },
  ],
  payment_methods: [
    { method: "helio",        description: "Card (Visa/Mastercard) or USDC on Solana", tool: "create_payment_link"   },
    { method: "nowpayments",  description: "300+ cryptocurrencies (BTC, ETH, SOL, USDT, …)", tool: "create_crypto_invoice" },
  ],
  note: "API key access is available on all plans including Free Trial. Buy credits to run backtests, upgrade plan for more bots.",
};

// ── MCP Server ────────────────────────────────────────────────

const server = new McpServer({
  name: "sentinel",
  version: "1.2.0",
});

// ════════════════════════════════════════════════════════════════
// SECTION 1: BACKTESTING
// ════════════════════════════════════════════════════════════════

server.tool(
  "run_backtest",
  "Submit a backtest job and wait for the result. Supports EMA cross, MACD, RSI, breakout, Bollinger, and SMC entry blocks combined with ATR, fixed-%, trailing, or time-based exits. Returns metrics including Sharpe ratio, max drawdown, win rate, and full trade list.",
  {
    symbol: z.enum(["BTC","ETH","SOL","XRP","BNB","DOGE","LINK","TRX","SUI"])
      .describe("Trading pair (without USDT)"),
    timeframe: z.enum(["1m","5m","15m","1h","4h","1d"])
      .describe("Candle timeframe"),
    start_date: z.string().describe("Start date ISO 8601, e.g. 2024-01-01"),
    end_date: z.string().describe("End date ISO 8601, e.g. 2025-01-01"),
    entry_type: z.enum(["ema_cross","macd_cross","rsi","breakout","volume_breakout","bollinger_bounce","smc_structure","smc_level_entry"])
      .describe("Entry block type"),
    entry_params: z.record(z.any()).optional()
      .describe("Entry block params (e.g. {fast_period:5, slow_period:20} for ema_cross). Omit for defaults."),
    exit_type: z.enum(["fixed_pct","atr_mult","atr_trail","time","key_bar","combined"])
      .describe("Exit block type"),
    exit_params: z.record(z.any()).optional()
      .describe("Exit block params (e.g. {tp_atr_mult:2, sl_atr_mult:1} for atr_mult). Omit for defaults."),
    direction: z.enum(["long","short","both"]).optional().default("both")
      .describe("Trade direction bias"),
    leverage: z.number().min(1).max(125).optional().default(1)
      .describe("Leverage multiplier (1-125). Use 1 for spot-equivalent."),
    position_size: z.number().min(0.01).max(1.0).optional().default(1.0)
      .describe("Fraction of capital per trade (0.01-1.0)"),
    wait: z.boolean().optional().default(true)
      .describe("If true (default), poll until complete. If false, return job_id immediately."),
    include_trades: z.boolean().optional().default(false)
      .describe("If false (default), return summary + strategy_blocks only (recommended). Set true to include full trade list and equity curve."),
  },
  async ({ symbol, timeframe, start_date, end_date, entry_type, entry_params, exit_type, exit_params, direction, leverage, position_size, wait, include_trades }) => {
    const payload = {
      symbol, timeframe,
      startDate: start_date, endDate: end_date,
      parameters: { riskPercent: 1.0, stopLossTicks: 10, takeProfitTicks: 20, sessionFilter: "all" },
      strategy_blocks: {
        name: `${entry_type}+${exit_type}`,
        direction: direction ?? "both",
        entry: { type: entry_type, params: entry_params ?? {} },
        exit:  { type: exit_type,  params: exit_params  ?? {} },
        filters: [],
      },
      leverage: leverage ?? 1,
      positionSize: position_size ?? 1.0,
    };

    const job = await apiPost("/backtest/run", payload);
    const jobId = job.jobId || job.id;

    if (!wait) {
      return { content: [{ type: "text", text: JSON.stringify({ job_id: jobId, status: job.status, message: "Submitted. Use get_backtest_result to poll." }, null, 2) }] };
    }

    const result = await waitForResult(jobId);
    const strategyBlocks = payload.strategy_blocks;
    const output = include_trades ? result : slimResult(result, strategyBlocks);
    return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
  }
);

server.tool(
  "get_backtest_result",
  "Fetch the result of a specific backtest job by its ID. Optionally polls until completion.",
  {
    job_id: z.string().describe("Backtest job ID (UUID)"),
    wait: z.boolean().optional().default(false)
      .describe("If true, poll until job completes (up to 5 min). Default: return current status immediately."),
    include_trades: z.boolean().optional().default(false)
      .describe("If false (default), return summary only. Set true to include full trade list and equity curve."),
  },
  async ({ job_id, wait, include_trades }) => {
    const result = wait ? await waitForResult(job_id) : await apiGet(`/backtest/${job_id}`);
    const output = (include_trades || result.status !== "completed") ? result : slimResult(result);
    return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
  }
);

server.tool(
  "list_backtests",
  "List recent backtest jobs for the authenticated user.",
  {
    limit: z.number().min(1).max(50).optional().default(10).describe("Number of jobs to return"),
    status: z.enum(["all","completed","running","failed","cancelled"]).optional().default("all").describe("Filter by status"),
    symbol: z.string().optional().describe("Filter by symbol (e.g. BTC)"),
  },
  async ({ limit, status, symbol }) => {
    const params = new URLSearchParams({ limit, status });
    if (symbol) params.set("symbol", symbol);
    const result = await apiGet(`/backtest/jobs?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "cancel_backtest",
  "Cancel a running or queued backtest job.",
  { job_id: z.string().describe("Backtest job ID (UUID)") },
  async ({ job_id }) => {
    const result = await apiPost(`/backtest/${job_id}/cancel`, {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ════════════════════════════════════════════════════════════════
// SECTION 2: BOT MANAGEMENT
// ════════════════════════════════════════════════════════════════

server.tool(
  "list_bots",
  "List all trading bots for the authenticated user. Returns bot IDs, names, symbols, timeframes, and current status (idle/running/paused/stopped/error/halted).",
  {
    limit: z.number().min(1).max(100).optional().default(20).describe("Max bots to return"),
    status_filter: z.enum(["idle","running","paused","stopped","error","halted"]).optional()
      .describe("Filter by bot status. Omit to return all."),
  },
  async ({ limit, status_filter }) => {
    const params = new URLSearchParams({ limit });
    if (status_filter) params.set("status", status_filter);
    const result = await apiGet(`/bots?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "create_bot",
  "Create a new trading bot. The bot starts in IDLE status and must be started separately. To use strategy_config, pass the strategy_blocks JSON from a backtest result. Requires an exchange_id to be set before starting.",
  {
    name: z.string().min(1).max(100).describe("Bot name (e.g. 'BTC EMA Cross Bot')"),
    symbol: z.string().min(2).max(20).describe("Trading pair, e.g. BTCUSDT"),
    timeframe: z.string().describe("Candle timeframe, e.g. 1h, 15m, 4h"),
    mode: z.enum(["simple","blocks","expert_blocks"]).optional().default("blocks")
      .describe("Bot mode: 'simple' (default strategy), 'blocks' (custom strategy_blocks), 'expert_blocks' (blocks + custom weights)."),
    strategy_config: z.record(z.any()).optional()
      .describe("Strategy blocks JSON (entry, exit, direction, filters). Can be copied from a backtest's strategy_blocks."),
    exchange_id: z.number().optional()
      .describe("Exchange credential ID from list_exchanges. Required before starting the bot."),
    description: z.string().max(500).optional().describe("Optional bot description"),
  },
  async ({ name, symbol, timeframe, mode, strategy_config, exchange_id, description }) => {
    const payload = { name, symbol: symbol.toUpperCase(), timeframe, mode };
    if (strategy_config !== undefined) payload.strategy_config = strategy_config;
    if (exchange_id !== undefined) payload.exchange_id = exchange_id;
    if (description !== undefined) payload.description = description;
    const result = await apiPost("/bots", payload);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_bot",
  "Get full details and current status of a trading bot by its ID.",
  { bot_id: z.string().describe("Bot UUID") },
  async ({ bot_id }) => {
    const result = await apiGet(`/bots/${bot_id}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "start_bot",
  "Start a trading bot. The bot must be IDLE or STOPPED and have an exchange_id configured. This dispatches a live trading task that executes signals on your exchange.",
  { bot_id: z.string().describe("Bot UUID") },
  async ({ bot_id }) => {
    const result = await apiPost(`/bots/${bot_id}/start`, {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "stop_bot",
  "Stop a running or paused trading bot. The bot status will change to STOPPED.",
  { bot_id: z.string().describe("Bot UUID") },
  async ({ bot_id }) => {
    const result = await apiPost(`/bots/${bot_id}/stop`, {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "delete_bot",
  "Permanently delete a bot. Bot must be in IDLE, STOPPED, or ERROR status (stop it first if running).",
  { bot_id: z.string().describe("Bot UUID") },
  async ({ bot_id }) => {
    const result = await apiDelete(`/bots/${bot_id}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_bot_performance",
  "Get cumulative performance summary for a bot: total trades, win rate, total PnL, and current status.",
  { bot_id: z.string().describe("Bot UUID") },
  async ({ bot_id }) => {
    const result = await apiGet(`/bots/${bot_id}/performance`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ════════════════════════════════════════════════════════════════
// SECTION 3: EXCHANGES
// ════════════════════════════════════════════════════════════════

server.tool(
  "list_exchanges",
  "List all configured exchange credentials for the authenticated user. Returns exchange IDs, names, types (binance/bybit/okx/…), and testnet flag. Use the exchange id when creating or starting a bot.",
  {
    limit: z.number().min(1).max(100).optional().default(20).describe("Max exchanges to return"),
  },
  async ({ limit }) => {
    const result = await apiGet(`/exchanges?limit=${limit}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ════════════════════════════════════════════════════════════════
// SECTION 4: ACCOUNT & PAYMENTS
// ════════════════════════════════════════════════════════════════

server.tool(
  "get_account_info",
  "Get current account information: plan type, plan expiry, credits balance, bot usage (used/max), and API key metadata.",
  {},
  async () => {
    // Run profile + credits + bots count in parallel
    const [profile, credits, bots] = await Promise.allSettled([
      apiGet("/auth/profile"),
      apiGet("/credits"),
      apiGet("/bots?limit=1"),
    ]);

    const profileData = profile.status === "fulfilled" ? profile.value : null;
    const creditsData = credits.status === "fulfilled" ? credits.value : null;
    const botsData    = bots.status    === "fulfilled" ? bots.value    : null;

    // Derive bot limit from plan catalog
    const planId = profileData?.plan ? `plan_${profileData.plan}` : null;
    const planEntry = PLAN_CATALOG.plans.find(p => p.id === planId || p.id === profileData?.plan);

    const botsUsed = botsData?.total ?? botsData?.items?.length ?? null;
    const botsMax  = profileData?.max_bots_override ?? planEntry?.max_bots ?? null;

    return {
      content: [{ type: "text", text: JSON.stringify({
        plan:            profileData?.plan ?? "unknown",
        plan_expires_at: profileData?.plan_expires_at ?? null,
        email:           profileData?.email ?? null,
        credits_balance: creditsData?.balance ?? creditsData?.credits_balance ?? null,
        bots: botsUsed !== null && botsMax !== null
          ? { used: botsUsed, max: botsMax, remaining: botsMax - botsUsed }
          : { used: botsUsed, max: botsMax },
        upgrade_tip: botsMax !== null && botsUsed !== null && botsUsed >= botsMax
          ? "Bot limit reached. Use get_plan_info + create_payment_link to upgrade."
          : null,
      }, null, 2) }],
    };
  }
);

server.tool(
  "get_plan_info",
  "Get static plan pricing, feature comparison, and available payment methods. Use this before calling create_payment_link or create_crypto_invoice.",
  {},
  async () => {
    return { content: [{ type: "text", text: JSON.stringify(PLAN_CATALOG, null, 2) }] };
  }
);

server.tool(
  "create_payment_link",
  "Create a Helio checkout link for upgrading to a paid plan using card (Visa/Mastercard) or USDC on Solana. Returns a payment_url that the user must open in a browser to complete checkout. After payment, the plan is automatically upgraded via webhook. Also supports credits_topup for purchasing backtest credits (min $10, 17 credits per $1).",
  {
    strategy_id: z.enum([
      "plan_starter","plan_pro",
      "plan_expert","plan_expert_10","plan_expert_12",
      "plan_expert_15","plan_expert_30","plan_expert_60",
      "credits_topup",
    ]).describe("Plan ID to purchase, or 'credits_topup' to buy backtest credits. Use get_plan_info to see pricing."),
    amount_usd: z.number().min(10).max(10000).optional()
      .describe("Amount in USD. Required for credits_topup (min $10, 17 credits per $1). Ignored for plan purchases (price is fixed)."),
    return_path: z.string().optional()
      .describe("Optional custom return path after payment (e.g. /dashboard/billing). Defaults to billing page."),
  },
  async ({ strategy_id, amount_usd, return_path }) => {
    const isTopup = strategy_id === "credits_topup";
    if (isTopup && !amount_usd) throw new Error("amount_usd is required for credits_topup (min $10).");

    const plan = PLAN_CATALOG.plans.find(p => p.id === strategy_id);
    const price = isTopup ? amount_usd : plan?.price_usd;
    if (!price) throw new Error(`Unknown strategy_id: ${strategy_id}`);

    const result = await apiPost("/payments/create-link", {
      strategy_id,
      plan_type: isTopup ? "one_time" : "subscription",
      amount_usd: price,
      strategy_name: isTopup ? `Credits Top-up ($${price})` : `Sentinel Bot — ${plan.name}`,
      return_path: return_path || "/dashboard/billing",
    });
    return {
      content: [{ type: "text", text: JSON.stringify({
        ...result,
        credits_estimate: isTopup ? Math.floor(price * 17) : undefined,
        instruction: isTopup
          ? `Open payment_url in a browser. You will receive ~${Math.floor(price * 17)} credits after payment. Use verify_payment to confirm.`
          : "Open payment_url in a browser to complete checkout. After payment, the plan upgrades automatically (webhook, ~1 min). Use verify_payment to confirm.",
      }, null, 2) }],
    };
  }
);

server.tool(
  "create_crypto_invoice",
  "Create a NOWPayments invoice for upgrading to a paid plan using 300+ cryptocurrencies (BTC, ETH, SOL, USDT, etc.). Returns an invoice_url that the user must open in a browser to select their crypto and send payment. Also supports credits_topup (min $10, 17 credits per $1).",
  {
    strategy_id: z.enum([
      "plan_starter","plan_pro",
      "plan_expert","plan_expert_10","plan_expert_12",
      "plan_expert_15","plan_expert_30","plan_expert_60",
      "credits_topup",
    ]).describe("Plan ID to purchase, or 'credits_topup' to buy backtest credits."),
    amount_usd: z.number().min(10).max(10000).optional()
      .describe("Amount in USD. Required for credits_topup (min $10, 17 credits per $1). Ignored for plan purchases."),
  },
  async ({ strategy_id, amount_usd }) => {
    const isTopup = strategy_id === "credits_topup";
    if (isTopup && !amount_usd) throw new Error("amount_usd is required for credits_topup (min $10).");

    const plan = PLAN_CATALOG.plans.find(p => p.id === strategy_id);
    const price = isTopup ? amount_usd : plan?.price_usd;
    if (!price) throw new Error(`Unknown strategy_id: ${strategy_id}`);

    const result = await apiPost("/nowpayments/create-invoice", {
      strategy_id,
      plan_type: isTopup ? "one_time" : "subscription",
      amount_usd: price,
      strategy_name: isTopup ? `Credits Top-up ($${price})` : `Sentinel Bot — ${plan.name}`,
    });
    return {
      content: [{ type: "text", text: JSON.stringify({
        ...result,
        credits_estimate: isTopup ? Math.floor(price * 17) : undefined,
        instruction: isTopup
          ? `Open invoice_url in a browser. You will receive ~${Math.floor(price * 17)} credits after payment.`
          : "Open invoice_url in a browser to select cryptocurrency and send payment. Plan upgrades automatically after confirmation. Use verify_payment to confirm.",
      }, null, 2) }],
    };
  }
);

server.tool(
  "verify_payment",
  "Check if a payment completed and the plan was upgraded. Call this after the user returns from the checkout page. Returns success status and the strategy_id that was purchased.",
  {
    payment_id: z.string().describe("payment_id returned by create_payment_link or order_id from create_crypto_invoice"),
  },
  async ({ payment_id }) => {
    const result = await apiGet(`/payments/verify/${payment_id}`);
    return {
      content: [{ type: "text", text: JSON.stringify({
        ...result,
        next_step: result.success
          ? "Payment confirmed. Call get_account_info to see updated plan and bot limits."
          : "Payment not yet confirmed. Wait 1-2 minutes and try again.",
      }, null, 2) }],
    };
  }
);

// ── Start ─────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[sentinel-mcp] Server running on stdio (v1.2.0 — 17 tools)");
