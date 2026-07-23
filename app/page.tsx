/* eslint-disable @next/next/no-img-element */
import Interactions from "./interactions";

// ---------- Static data (mock odds) ----------
const TEAMS = [
  { name: "Miami", abbr: "MIA", pct: 46, chg: -3, yes: 46, no: 55, color: "#f59e0b" },
  { name: "Cleveland", abbr: "CLE", pct: 29, chg: 1, yes: 29, no: 72, color: "#8b1e3f" },
  { name: "Golden State", abbr: "GSW", pct: 17, chg: 3, yes: 17, no: 84, color: "#1d428a" },
  { name: "L.A. Lakers", abbr: "LAL", pct: 5, chg: 0, yes: 5, no: 95, color: "#552583" },
  { name: "New York", abbr: "NYK", pct: 2, chg: 0, yes: 2, no: 98, color: "#f58426" },
  { name: "Dallas", abbr: "DAL", pct: 1, chg: 0, yes: 1, no: 99, color: "#00538c" },
];
const DATES = [
  { abbr: "JUL30", label: "Before Jul 30, 2026", pct: 45, chg: 20, yes: 45, no: 57 },
  { abbr: "JUL31", label: "Before Jul 31, 2026", pct: 47, chg: -22, yes: 55, no: 51 },
  { abbr: "AUG02", label: "Before Aug 2, 2026", pct: 59, chg: -20, yes: 59, no: 43 },
];
const CHART_TEAMS = [
  { key: "MIA", name: "Miami", color: "#f5a623", end: 46 },
  { key: "CLE", name: "Cleveland", color: "#b3243b", end: 29 },
  { key: "GSW", name: "Golden State", color: "#1d6fd0", end: 17 },
  { key: "LAL", name: "L.A. Lakers", color: "#7a3fb0", end: 5 },
];
const N = { "1D": 40, "1W": 48, "1M": 52, ALL: 60 } as const;
const SEED = { "1D": 11, "1W": 22, "1M": 33, ALL: 44 } as const;

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gen(seed: number, n: number, end: number) {
  let v = end * 0.6;
  const out: number[] = [];
  const r = mulberry(seed);
  for (let i = 0; i < n; i++) {
    v += (r() - 0.5) * 7;
    v = Math.max(2, Math.min(max - 5, v));
    out.push(v);
  }
  out[out.length - 1] = end;
  return out;
}
const W = 600,
  H = 210,
  pad = 8,
  max = 80,
  min = 0;
const x = (i: number, n: number) => (i / (n - 1)) * (W - 2 * pad) + pad;
const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);
function linePath(arr: number[]) {
  const n = arr.length;
  let d = `M ${x(0, n).toFixed(2)} ${y(arr[0]).toFixed(2)}`;
  for (let i = 1; i < n; i++) d += ` L ${x(i, n).toFixed(2)} ${y(arr[i]).toFixed(2)}`;
  return d;
}

// chart data for all ranges (passed to client for the toggle)
const chartData: Record<string, Record<string, number[]>> = {};
(Object.keys(N) as (keyof typeof N)[]).forEach((r) => {
  chartData[r] = {};
  CHART_TEAMS.forEach((t, i) => {
    chartData[r][t.key] = gen(SEED[r] + i * 7, N[r], t.end);
  });
});

function Arrow({ c }: { c: number }) {
  if (c > 0) return <span className="up">▲ {c}</span>;
  if (c < 0) return <span className="down">▼ {Math.abs(c)}</span>;
  return <span style={{ color: "var(--muted)" }}>— 0</span>;
}

function TeamRow({ t }: { t: (typeof TEAMS)[number] | (typeof DATES)[number] }) {
  const nm = "name" in t ? t.name : t.label;
  return (
    <div className="mrow" data-abbr={t.abbr}>
      <div className="left">
        <div className="team-chip" style={{ background: t.color }}>
          {t.abbr}
        </div>
        <div className="nm">{nm}</div>
      </div>
      <div className="mid">
        <div className="prob">{t.pct}%</div>
        <Arrow c={t.chg} />
        <div className="bar">
          <span style={{ width: `${t.pct}%` }} />
        </div>
      </div>
      <div className="yn">
        <button className="yes" data-t={nm}>
          <span className="lab">Yes</span>
          <span className="val">{t.yes}</span>
        </button>
        <button className="no" data-t={nm}>
          <span className="lab">No</span>
          <span className="val">{t.no}</span>
        </button>
        <div className="vtally" data-tally={t.abbr}>
          —
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      {/* ===== Header ===== */}
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a href="/" className="brand">
            <img className="logo-img" src="/logo.svg" alt="LeBronTeam" width={26} height={26} />
            LeBron<b>Team</b>
          </a>
          <nav className="mainnav">
            <a href="#chance">Markets</a>
            <a href="#rules">How it works</a>
            <a href="#timeline">Leaderboard</a>
            <a href="#footer">Research</a>
          </nav>
          <div className="topbar-right">
            <label className="searchbox">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
              <input placeholder="Search markets" />
            </label>
            <a href="#" className="btn btn-ghost">
              Log in
            </a>
            <a href="#" className="btn btn-solid">
              Sign up
            </a>
          </div>
        </div>
      </header>

      <div className="wrap">
        {/* Breadcrumb */}
        <div className="crumbs">
          <a href="#">Markets</a> / <a href="#">NBA</a> / <a href="#">Next Team</a> /{" "}
          <span>KXNEXTTEAMNBA-26LJAM</span>
        </div>

        {/* Banner */}
        <section className="banner">
          <div className="wrap banner-inner">
            <img className="banner-art" src="/lebron-flat.svg" alt="Flat illustration of LeBron James" />
            <div className="banner-copy">
              <img className="nba-badge" src="/nba-badge.svg" alt="NBA" />
              <h2>The LeBron Sweepstakes</h2>
              <p>Track the Lebron next team odds on the biggest free-agency storyline in the league. Where does he sign next?</p>
              <a href="#chance" className="btn btn-gold">
                See the odds
              </a>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="hero">
          <div className="hero-top">
            <div>
              <h1>Lebron next team</h1>
              <div className="sub">
                <span className="pill">
                  <span className="live-dot" />
                  Live
                </span>
                <span className="pill">Market #28</span>
                <span>Lebron next team odds &amp; predictions · resolves on official team announcement</span>
              </div>
            </div>
            <button className="chat-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9 9 0 0 1-4-1L3 20l1-4a8.5 8.5 0 0 1-1-4.5A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
              </svg>
              Live chat
            </button>
          </div>

          <div className="hero-grid">
            {/* Chart (SSR default range = 1W) */}
            <div className="card chart-card">
              <div className="chart-head">
                <div>
                  <div className="ttl">Team odds · top 4</div>
                  <div className="vol">
                    Total volume <b>$211,578,942</b>
                  </div>
                </div>
                <div className="ranges" id="ranges">
                  <button data-r="1D">1D</button>
                  <button data-r="1W" className="active">
                    1W
                  </button>
                  <button data-r="1M">1M</button>
                  <button data-r="ALL">
                    ALL
                  </button>
                </div>
              </div>
              <div className="chart-wrap">
                <svg id="chart" viewBox="0 0 600 210" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#552583" stopOpacity=".22" />
                      <stop offset="100%" stopColor="#552583" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g id="lines">
                    {CHART_TEAMS.map((t) => (
                      <path
                        key={t.key}
                        d={linePath(chartData["1W"][t.key])}
                        fill="none"
                        stroke={t.color}
                        strokeWidth={2.6}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ))}
                  </g>
                </svg>
              </div>
              <div className="legend" id="legend">
                {CHART_TEAMS.map((t) => (
                  <span key={t.key}>
                    <i style={{ background: t.color }} />
                    {t.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="card lb-card">
              <div className="ttl">Top contenders</div>
              <div className="hint">Implied chance of being LeBron&apos;s next team</div>
              <div id="leaderboard">
                {TEAMS.slice(0, 4).map((t) => (
                  <div className="lb-row" key={t.abbr}>
                    <div className="lb-team">
                      <div className="team-chip" style={{ background: t.color }}>
                        {t.abbr}
                      </div>
                      <div>
                        <div className="nm">{t.name}</div>
                        <div className="lb-bar">
                          <span style={{ width: `${t.pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="lb-pct">
                      {t.pct}%<small>{<Arrow c={t.chg} />}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Chance / team list ===== */}
      <section className="block" id="chance">
        <div className="wrap">
          <div className="sec-head">
            <h2>Chance</h2>
            <a href="#" className="more">
              More markets →
            </a>
          </div>
          <div className="pick-note">Pick up to 4 markets to compare side-by-side.</div>
          <div className="market-list" id="teamList">
            {TEAMS.map((t) => (
              <TeamRow key={t.abbr} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Related markets ===== */}
      <section className="block" id="related" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="sec-head">
            <h2>Explore this event</h2>
          </div>
          <div className="rel-grid">
            <div className="rel-card">
              <h3>New Team Date</h3>
              <p>When will LeBron&apos;s new team be announced? Trade the timeline before each deadline.</p>
              <div className="rel-foot">
                <span className="mini">3 markets live</span>
                <span className="go">Open →</span>
              </div>
            </div>
            <div className="rel-card">
              <h3>Next Conference</h3>
              <p>Will the next team be in the Eastern or Western Conference? Settle the debate.</p>
              <div className="rel-foot">
                <span className="mini">2 markets live</span>
                <span className="go">Open →</span>
              </div>
            </div>
            <div className="rel-card">
              <h3>Next Contract Size</h3>
              <p>Predict the total value of LeBron&apos;s next deal, from veteran minimum to max.</p>
              <div className="rel-foot">
                <span className="mini">4 markets live</span>
                <span className="go">Open →</span>
              </div>
            </div>
            <div className="rel-card">
              <h3>Next Team Outlet</h3>
              <p>Which outlet breaks the news first — and which city&apos;s beat reporters lead?</p>
              <div className="rel-foot">
                <span className="mini">5 markets live</span>
                <span className="go">Open →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== New Team Date markets ===== */}
      <section className="block" id="date">
        <div className="wrap">
          <div className="sec-head">
            <h2>New Team Date</h2>
            <a href="#" className="more">
              More markets →
            </a>
          </div>
          <p className="pick-note">When will LeBron&apos;s new team be announced?</p>
          <div className="market-list" id="dateList">
            {DATES.map((t) => (
              <TeamRow key={t.abbr} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Community: votes tally + comments (Vercel Blob) ===== */}
      <section className="block" id="community" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="sec-head">
            <h2>Community pulse</h2>
          </div>
          <p className="pick-note">
            Live votes are stored in Vercel Blob. Drop a comment with your take on where LeBron lands.
          </p>
          <div className="comments-card panel">
            <form id="cform" className="cform">
              <input id="cname" maxLength={40} placeholder="Your name (optional)" autoComplete="name" />
              <textarea id="cmsg" maxLength={500} placeholder="Where do you think LeBron goes next?" required />
              <div className="cform-foot">
                <span id="cwarn" className="cwarn" />
                <button type="submit" className="btn btn-gold">
                  Post comment
                </button>
              </div>
            </form>
            <div id="clist" className="clist">
              <div className="cload">Loading comments…</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Rules + timeline ===== */}
      <div className="wrap">
        <div className="two-col" id="rules">
          <div className="panel">
            <h3>
              Market Rules <span className="tag">Miami</span>
            </h3>
            <div className="rule-text">
              Resolves <b>Yes</b> if LeBron James&apos;s next team is <b>Miami</b> before <b>Oct 23, 2026</b>. Outcome
              verified from{" "}
              <a href="https://www.espn.com/" style={{ color: "var(--brand)", fontWeight: 600 }}>
                ESPN
              </a>{" "}
              and{" "}
              <a href="https://www.foxsports.com/" style={{ color: "var(--brand)", fontWeight: 600 }}>
                Fox Sports
              </a>
              .
            </div>
            <div className="disclaim">
              LeBronTeam is not affiliated, associated, authorized, endorsed by, or in any way officially connected
              with the NBA or any team. All trademarks, logos, and brand names are the property of their respective
              owners.
              <br />
              <br />
              <b>Note:</b> this event is mutually exclusive.
            </div>
            <div className="rule-links">
              <a href="#">View full rules</a>
              <a href="#">Help center</a>
              <a href="#">Report Insider Trading</a>
            </div>
          </div>

          <div className="panel" id="timeline">
            <h3>Timeline and payout</h3>
            <div className="kv">
              <span className="k">Market open</span>
              <span className="v">Jan 23, 2026 · 6:00pm EST</span>
            </div>
            <div className="kv">
              <span className="k">Market closes</span>
              <span className="v">After the outcome occurs</span>
            </div>
            <div className="kv">
              <span className="k">Projected payout</span>
              <span className="v">5 minutes after closing</span>
            </div>
            <div className="kv">
              <span className="k">Hard close</span>
              <span className="v">Oct 22, 2026 · 11:59pm EDT</span>
            </div>
            <div className="codes">
              Series&nbsp;: KXNEXTTEAMNBA
              <br />
              Event&nbsp;&nbsp;&nbsp;: KXNEXTTEAMNBA-26LJAM
              <br />
              Market&nbsp;: KXNEXTTEAMNBA-26LJAM-MIA
            </div>
            <div className="insider">
              <b>Insider trading is prohibited.</b> Persons employed by any Source Agency, or holding material
              non-public information on the Underlying, are not permitted to trade this contract.
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <footer id="footer">
        <div className="wrap foot-inner">
          <div className="foot-brand">
            <a href="/" className="brand">
              <img className="logo-img" src="/logo.svg" alt="LeBronTeam" width={26} height={26} />
              LeBron<b>Team</b>
            </a>
            <p>The community prediction market for where LeBron James plays next. Trade the odds, follow the timeline, and settle the debate.</p>
          </div>
          <div className="foot-col">
            <h4>Markets</h4>
            <a href="#chance">Next Team</a>
            <a href="#date">New Team Date</a>
            <a href="#related">Contract Size</a>
            <a href="#related">Next Conference</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">How it works</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div className="foot-col">
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Rules</a>
            <a href="#">Responsible trading</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span className="disc">
            © 2026 LeBronTeam. For entertainment and informational purposes only. This is an unofficial fan project and
            is not affiliated with the NBA, LeBron James, or any team. Predictions are not financial advice.
          </span>
          <span>Privacy · Terms · Disclosures</span>
        </div>
      </footer>

      <div id="toast" />

      {/* Client-side interactivity (chart toggle, votes, comments) */}
      <Interactions chartData={chartData} />
    </main>
  );
}
