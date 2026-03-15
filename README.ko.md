# mcp-server-sentinel

**[English](README.md)** | **[繁體中文](README.zh-TW.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)** | **[한국어](README.ko.md)**

[Sentinel Bot](https://sentinel.redclawey.com) MCP 서버 — AI 에이전트를 통한 알고리즘 트레이딩 백테스트, 봇 관리 및 계정 운영.

이 서버는 [Model Context Protocol (MCP)](https://modelcontextprotocol.io)을 구현하며, AI 에이전트가 암호화폐 백테스트 실행, 트레이딩 봇 배포, 파라미터 최적화, 전략 마켓플레이스 탐색, 계정 관리, 결제 처리를 자연어로 수행할 수 있는 36개 도구를 제공합니다.

## 왜 이 MCP 서버를 사용하나요?

이 MCP 서버는 [Sentinel — AI 에이전트 기반 자동 알고리즘 트레이딩 플랫폼](https://sentinel.redclawey.com) 전용으로 설계되었습니다. MCP를 통해 AI 에이전트와 Sentinel을 연결하면 완전한 에이전트 기반 트레이딩 파이프라인을 구축할 수 있습니다:

- **자연어 백테스트** — 전략 아이디어를 설명하면 AI가 자동으로 생성 및 테스트
- **한 번의 대화로 배포** — 백테스트에서 라이브 봇까지 코드 작성 불필요
- **실시간 모니터링** — PnL 추적, 트레이딩 시그널, SMC 시장 분석
- **완전 자율** — 전략 리서치, 파라미터 최적화, 거래 실행을 모두 AI 에이전트가 처리

Claude Code, Claude Desktop 또는 MCP 호환 AI 클라이언트와 함께 사용하는 것을 권장합니다.

## 빠른 시작

### 1. API Key 발급

[sentinel.redclawey.com](https://sentinel.redclawey.com)에서 무료 가입하세요. **무료 체험판을 포함한 모든 플랜에서 API Key를 사용할 수 있습니다**. 대시보드의 **설정 > API Keys**에서 키를 생성하세요. 크레딧을 구매해 백테스트를 시작하고, 봇이 더 필요할 때 플랜을 업그레이드하세요.

### 2. 설치

#### Claude Code (권장)

```bash
claude mcp add sentinel -- npx mcp-server-sentinel
```

환경 변수 설정:
```bash
export SENTINEL_API_KEY=sk-your-api-key-here
```

#### Claude Desktop

`claude_desktop_config.json`에 추가:

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

#### 수동 설정 (모든 MCP 클라이언트)

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

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `SENTINEL_API_KEY` | 예 | — | API 키 (`sk-`로 시작) |
| `SENTINEL_API_URL` | 아니오 | `https://sentinel.redclawey.com/api/v1` | API 기본 URL |

## 도구 (36개)

### 백테스트

| 도구 | 설명 |
|---|---|
| `run_backtest` | 백테스트를 제출하고 결과를 대기합니다. 8가지 진입 유형과 6가지 청산 유형을 지원합니다. 기본적으로 요약 지표를 반환하며, `include_trades=true`로 전체 거래 목록을 가져올 수 있습니다. |
| `get_backtest_result` | Job ID로 특정 백테스트 결과를 가져옵니다. 완료까지 폴링할 수 있습니다. |
| `list_backtests` | 최근 백테스트 작업을 나열합니다. 상태/심볼로 필터링할 수 있습니다. |
| `cancel_backtest` | 실행 중이거나 대기 중인 백테스트 작업을 취소합니다. |

### 봇 관리

| 도구 | 설명 |
|---|---|
| `list_bots` | 모든 트레이딩 봇을 나열합니다. 상태 필터 지원 (idle/running/paused/stopped/error/halted). |
| `create_bot` | 새 봇을 생성합니다. 백테스트 결과의 `strategy_blocks`를 전달하여 검증된 전략을 배포합니다. |
| `get_bot` | 봇의 전체 정보와 현재 상태를 가져옵니다. |
| `start_bot` | 봇을 시작합니다 (`exchange_id` 설정 필요). 실시간 거래 신호를 전송합니다. |
| `stop_bot` | 실행 중이거나 일시 중지된 봇을 중지합니다. |
| `pause_bot` | 실행 중인 봇을 일시 중지합니다 (포지션 유지, 새 신호 중단). RUNNING 상태만 가능. |
| `recover_bot` | HALTED 상태의 봇을 복구합니다 (서킷 브레이커 리셋). HALTED 상태만 가능. |
| `delete_bot` | 봇을 영구 삭제합니다 (먼저 중지 필요). |
| `get_bot_performance` | 봇의 누적 손익, 승률, 거래 횟수를 가져옵니다. |
| `get_bot_trades` | 봇의 페이지네이션된 거래 이력을 가져옵니다 (진입/청산 가격, 손익 포함). |

### 거래소

| 도구 | 설명 |
|---|---|
| `list_exchanges` | 설정된 거래소 인증 정보를 나열합니다 (Binance, Bybit, OKX 등). 봇 생성 시 거래소 ID를 사용합니다. |

### OKX 거래소

| 도구 | 설명 |
|---|---|
| `okx_orderbook` | OKX 호가창을 가져옵니다 (공개 데이터, 인증 불필요). |
| `okx_funding_rate` | OKX 무기한 선물의 현재 펀딩 비율을 가져옵니다. |
| `okx_set_leverage` | OKX에서 레버리지와 마진 모드를 설정합니다 (OKX 인증 필요). |
| `okx_positions` | 현재 OKX 포지션을 가져옵니다 (OKX 인증 필요). |
| `okx_algo_order` | OKX에서 조건부/알고 주문을 실행합니다 (TP/SL/트레일링/OCO). |
| `okx_market_overview` | OKX 상승률 순위와 거래량 리더를 가져옵니다 (공개 데이터). |

### AI 전략

| 도구 | 설명 |
|---|---|
| `build_strategy` | 자연어로 AI를 활용해 트레이딩 전략을 생성합니다. 1 크레딧 소모. `strategy_blocks` JSON을 반환하며, `create_bot` 또는 `run_backtest`에 바로 사용 가능합니다. |

### Grid 최적화

| 도구 | 설명 |
|---|---|
| `run_grid_backtest` | 파라미터 스윕 백테스트. 각 조합당 1 크레딧 소모. 대기 모드 지원. |
| `get_grid_status` | Grid 백테스트 진행 상황과 상위 10개 결과를 확인합니다. |
| `get_grid_results` | 전체 페이지네이션된 Grid 결과를 가져옵니다. 다양한 지표로 정렬 가능. |

### 분석 및 신호

| 도구 | 설명 |
|---|---|
| `get_analysis` | 최신 SMC 분석을 가져옵니다: 방향, 점수, AI 요약. 분석 구독 필요. |
| `get_analysis_history` | 과거 일간 분석 실행 이력을 나열합니다. |
| `get_signals` | 봇의 거래 신호를 가져옵니다 (방향, 가격, 실행 상태 포함). |

### 전략 마켓플레이스

| 도구 | 설명 |
|---|---|
| `list_strategies` | 마켓플레이스 전략을 탐색합니다. 손익, 승률, 샤프 비율로 랭킹. |
| `get_strategy_detail` | 전체 전략 상세 + 최근 거래 + 구독 상태. |
| `subscribe_strategy` | 카피 트레이딩을 구독합니다. 무료 전략은 즉시 활성화; 유료 전략은 결제 URL을 반환합니다. |

### 계정 및 결제

| 도구 | 설명 |
|---|---|
| `get_account_info` | 현재 플랜, 크레딧 잔액, 봇 사용량 (사용/한도), 업그레이드 제안. |
| `get_plan_info` | 전체 플랜의 정적 요금 및 기능 비교. |
| `create_payment_link` | Helio 결제 링크 생성 (신용카드/USDC). 플랜 업그레이드 또는 크레딧 충전용. |
| `create_crypto_invoice` | NOWPayments 인보이스 생성 (300+ 암호화폐). 플랜 업그레이드 또는 크레딧 충전용. |
| `verify_payment` | 결제 완료 및 플랜 업그레이드 확인. |

## 사용 예시

AI 에이전트의 일반적인 워크플로우:

```
1. build_strategy          -> AI가 설명에서 전략 생성 (1 크레딧)
2. run_backtest            -> 과거 데이터로 검증
3. run_grid_backtest       -> 파라미터 최적화
4. get_grid_results        -> 최적 파라미터 조합 탐색
5. create_bot              -> 최적 파라미터로 배포
6. start_bot               -> 실전 가동
7. get_signals             -> 신호 실행 모니터링
8. get_analysis            -> 일간 시장 분석 확인
9. get_bot_performance     -> 손익 확인
```

크레딧이 부족할 때:
```
get_account_info           -> credits_balance: 0
create_payment_link        -> strategy_id: "credits_topup", amount_usd: 20
  -> 결제 URL 반환 -> 사용자가 브라우저에서 결제 완료
verify_payment             -> 크레딧 추가 확인
run_backtest               -> 백테스트 재개
```

## 지원 심볼

BTC, ETH, SOL, XRP, BNB, DOGE, LINK, TRX, SUI

## 지원 타임프레임

1m, 5m, 15m, 1h, 4h, 1d

## 진입 블록 유형

| 유형 | 설명 | 주요 파라미터 |
|---|---|---|
| `ema_cross` | EMA 크로스오버 | `fast_period`, `slow_period` |
| `macd_cross` | MACD 시그널 크로스 | `fast_period`, `slow_period`, `signal_period` |
| `rsi` | RSI 과매수/과매도 | `period`, `overbought`, `oversold` |
| `breakout` | 가격 돌파 | `period`, `threshold` |
| `volume_breakout` | 거래량 돌파 | `period`, `multiplier` |
| `bollinger_bounce` | 볼린저 밴드 반등 | `period`, `std_dev` |
| `smc_structure` | 스마트 머니 컨셉 구조 | `lookback` |
| `smc_level_entry` | SMC 핵심 레벨 진입 | `lookback`, `zone_type` |

## 청산 블록 유형

| 유형 | 설명 | 주요 파라미터 |
|---|---|---|
| `fixed_pct` | 고정 비율 TP/SL | `tp_pct`, `sl_pct` |
| `atr_mult` | ATR 배수 TP/SL | `tp_atr_mult`, `sl_atr_mult`, `atr_period` |
| `atr_trail` | ATR 트레일링 스톱 | `trail_atr_mult`, `atr_period` |
| `time` | 시간 기반 청산 | `max_bars` |
| `key_bar` | 키 바 패턴 청산 | `pattern` |
| `combined` | 복합 조건 청산 | 위 유형의 조합 |

## 요금제

| 플랜 | 가격 | 봇 수 | API Key | 심볼 수 |
|---|---|---|---|---|
| 체험판 | 무료 (7일) | 1 | 사용 가능 | BTC |
| Starter | $19/월 | 3 | 사용 가능 | 5 |
| Pro | $49/월 | 5 | 사용 가능 | 8 |
| Expert | $99/월 | 8 | 사용 가능 | 10 |
| Expert 10 | $125/월 | 10 | 사용 가능 | 10 |
| Expert 15 | $190/월 | 15 | 사용 가능 | 10 |
| Expert 30 | $385/월 | 30 | 사용 가능 | 10 |
| Expert 60 | $775/월 | 60 | 사용 가능 | 10 |

**모든 플랜에서 API Key를 사용할 수 있습니다.** 무료 체험판으로 시작하고, 크레딧을 구매해 백테스트를 실행한 후, 더 많은 봇이나 심볼이 필요할 때 업그레이드하세요.

크레딧은 백테스트 실행 시마다 소모됩니다. `create_payment_link` 또는 `create_crypto_invoice`에서 `strategy_id: "credits_topup"`을 사용하여 충전 (최소 $10, $1당 17 크레딧).

## 결제 방법

- **신용카드 / USDC**: Helio 경유 (`create_payment_link`) — Visa, Mastercard, 또는 Solana의 USDC
- **300+ 암호화폐**: NOWPayments 경유 (`create_crypto_invoice`) — BTC, ETH, SOL, USDT 등

## 개발

```bash
git clone https://github.com/clarencyu-boop/mcp-server-sentinel.git
cd mcp-server-sentinel
npm install
SENTINEL_API_KEY=sk-your-key node src/index.mjs
```

## 라이선스

MIT
