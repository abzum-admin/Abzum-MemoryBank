#!/usr/bin/env python3
# Generates hindsight-clickhouse-flow.svg using the fireworks-tech-graph skill approach

lines = []
lines.append('<?xml version="1.0" encoding="UTF-8"?>')
lines.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 820" font-family="\'Segoe UI\',Arial,sans-serif">')

# Background
lines.append('  <rect width="960" height="820" fill="#f8f6f3"/>')
lines.append('  <rect x="6" y="6" width="948" height="808" rx="10" fill="none" stroke="#e8e3db" stroke-width="1"/>')

# Defs: arrow markers
lines.append('  <defs>')
for color, name in [("#059669","green"),("#2563eb","blue"),("#ea580c","orange"),("#6b7280","gray"),("#7c3aed","purple")]:
    lines.append(f'    <marker id="a-{name}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">')
    lines.append(f'      <polygon points="0 0, 10 3.5, 0 7" fill="{color}"/>')
    lines.append( '    </marker>')
lines.append('  </defs>')

# Title
lines.append('  <text x="480" y="30" text-anchor="middle" font-size="15" font-weight="700" fill="#1a1a1a" letter-spacing="0.3">Hindsight Memory Flow + ClickHouse Feedback Loop</text>')
lines.append('  <text x="480" y="46" text-anchor="middle" font-size="10" fill="#6b7280">Abzum Agent Architecture \u2014 Context Persistence v2.0 \u2014 All 9 Intelligence Types Covered</text>')

# ============================
# AGENT RUNTIME CONTAINER
# ============================
lines.append('  <rect x="40" y="57" width="880" height="106" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,3"/>')
lines.append('  <text x="480" y="76" text-anchor="middle" font-size="10" font-weight="700" fill="#475569" letter-spacing="2">HERMES AGENT RUNTIME</text>')

# Memory provider (left)
lines.append('  <rect x="60" y="83" width="232" height="67" rx="4" fill="#f0fdf4" stroke="#16a34a" stroke-width="1"/>')
lines.append('  <text x="176" y="97" text-anchor="middle" font-size="9" font-weight="700" fill="#16a34a">MEMORY PROVIDER (1/1 slot)</text>')
lines.append('  <text x="176" y="112" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">hindsight.recall(query, top_k=10)</text>')
lines.append('  <text x="176" y="126" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">hindsight.retain(content, metadata)</text>')
lines.append('  <text x="176" y="140" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">hindsight.reflect(topic)</text>')

# LLM Wiki skill (center)
lines.append('  <rect x="364" y="83" width="232" height="67" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="1"/>')
lines.append('  <text x="480" y="97" text-anchor="middle" font-size="9" font-weight="700" fill="#2563eb">HERMES SKILL (always active)</text>')
lines.append('  <text x="480" y="112" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">llm_wiki.query(task, max_pages=5)</text>')
lines.append('  <text x="480" y="126" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">llm_wiki.ingest(source, category)</text>')
lines.append('  <text x="480" y="140" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">llm_wiki.lint()</text>')

# Analytics hook (right)
lines.append('  <rect x="668" y="83" width="232" height="67" rx="4" fill="#fff7ed" stroke="#ea580c" stroke-width="1"/>')
lines.append('  <text x="784" y="97" text-anchor="middle" font-size="9" font-weight="700" fill="#ea580c">ANALYTICS HOOK (5 moments)</text>')
lines.append('  <text x="784" y="112" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">emit_signal("task_start", {...})</text>')
lines.append('  <text x="784" y="126" text-anchor="middle" font-family="Consolas,monospace" font-size="8.5" fill="#374151">emit_signal("task_end", {...})</text>')
lines.append('  <text x="784" y="140" text-anchor="middle" font-size="8.5" fill="#9a3412">failure never blocks agent execution</text>')

# ============================
# HINDSIGHT BOX (x=40-304, y=205-495)
# ============================
lines.append('  <rect x="40" y="205" width="265" height="290" rx="6" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>')
# Colored header
lines.append('  <rect x="40" y="205" width="265" height="33" rx="6" fill="#16a34a"/>')
lines.append('  <rect x="40" y="224" width="265" height="14" fill="#16a34a"/>')
lines.append('  <text x="172" y="226" text-anchor="middle" font-size="12" font-weight="700" fill="white">HINDSIGHT</text>')
lines.append('  <text x="172" y="249" text-anchor="middle" font-size="8.5" fill="#6b7280">91.4% LongMemEval \u2022 MIT \u2022 PostgreSQL+pgvector</text>')

# 4 networks
networks = [
    ("World \u24cc", "Objective org facts", "Semantic"),
    ("Experience \u24d1", "Agent actions + outcomes", "Episodic + Outcome"),
    ("Opinion \u24de", "Confidence-scored beliefs", "Persona"),
    ("Observation \u24c2", "Preference-neutral summaries", "Persona + Semantic"),
]
for i, (name, desc, itype) in enumerate(networks):
    y = 258 + i * 47
    lines.append(f'  <rect x="55" y="{y}" width="235" height="40" rx="4" fill="#dcfce7" stroke="#bbf7d0" stroke-width="1"/>')
    lines.append(f'  <text x="67" y="{y + 14}" font-size="10" font-weight="700" fill="#15803d">{name}</text>')
    lines.append(f'  <text x="67" y="{y + 27}" font-size="8.5" fill="#374151">{desc}</text>')
    lines.append(f'  <text x="281" y="{y + 27}" text-anchor="end" font-size="8" fill="#6b7280">{itype}</text>')

# TEMPR strip
lines.append('  <rect x="55" y="448" width="235" height="22" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>')
lines.append('  <text x="172" y="463" text-anchor="middle" font-size="8.5" fill="#15803d">TEMPR: Semantic \u2022 BM25 \u2022 Graph \u2022 Temporal</text>')
lines.append('  <text x="172" y="486" text-anchor="middle" font-size="9" fill="#6b7280">Covers 7/9 intelligence types</text>')

# ============================
# LLM WIKI BOX (x=348-611, y=205-495)
# ============================
lines.append('  <rect x="348" y="205" width="264" height="290" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>')
lines.append('  <rect x="348" y="205" width="264" height="33" rx="6" fill="#2563eb"/>')
lines.append('  <rect x="348" y="224" width="264" height="14" fill="#2563eb"/>')
lines.append('  <text x="480" y="226" text-anchor="middle" font-size="12" font-weight="700" fill="white">LLM WIKI</text>')
lines.append('  <text x="480" y="249" text-anchor="middle" font-size="8.5" fill="#6b7280">Hermes Skill \u2022 Zero Infrastructure \u2022 Markdown in git</text>')

wiki_rows = [
    ("wiki/procedures/", "SOPs, model routing rules"),
    ("wiki/decisions/", "\u2514\u2192 replaces ByteRover"),
    ("wiki/entities/", "clients, agents, projects"),
    ("wiki/concepts/", "tech + frameworks"),
    ("wiki/syntheses/", "saved Q&amp;A answers"),
]
for i, (path, desc) in enumerate(wiki_rows):
    y = 258 + i * 38
    lines.append(f'  <rect x="363" y="{y}" width="234" height="31" rx="4" fill="#dbeafe" stroke="#bfdbfe" stroke-width="1"/>')
    lines.append(f'  <text x="375" y="{y + 13}" font-family="Consolas,monospace" font-size="9.5" fill="#1d4ed8">{path}</text>')
    lines.append(f'  <text x="375" y="{y + 26}" font-size="8.5" fill="#374151">{desc}</text>')

lines.append('  <rect x="363" y="450" width="234" height="20" rx="4" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>')
lines.append('  <text x="480" y="464" text-anchor="middle" font-size="8.5" fill="#1d4ed8">3 ops: ingest \u2022 query \u2022 lint</text>')
lines.append('  <text x="480" y="486" text-anchor="middle" font-size="9" fill="#6b7280">Procedural (primary) \u2022 Semantic</text>')

# ============================
# CLICKHOUSE BOX (x=655-919, y=205-495)
# ============================
lines.append('  <rect x="655" y="205" width="265" height="290" rx="6" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>')
lines.append('  <rect x="655" y="205" width="265" height="33" rx="6" fill="#ea580c"/>')
lines.append('  <rect x="655" y="224" width="265" height="14" fill="#ea580c"/>')
lines.append('  <text x="787" y="226" text-anchor="middle" font-size="12" font-weight="700" fill="white">CLICKHOUSE</text>')
lines.append('  <text x="787" y="249" text-anchor="middle" font-size="8.5" fill="#6b7280">Columnar OLAP \u2022 Direct Agent Hooks \u2022 HyperDX UI</text>')

signals = [
    ("task_start",    "Intent",              "\u2460"),
    ("action",        "Behavioral",          "\u2461"),
    ("task_end",      "Outcome + Relational", "\u2462"),
    ("user_feedback", "Persona",             "\u2463"),
    ("periodic",      "Reflect",             "\u2464"),
]
for i, (sig, typ, num) in enumerate(signals):
    y = 258 + i * 36
    lines.append(f'  <rect x="670" y="{y}" width="235" height="29" rx="4" fill="#fff7ed" stroke="#fed7aa" stroke-width="1"/>')
    lines.append(f'  <text x="682" y="{y + 12}" font-family="Consolas,monospace" font-size="10" fill="#9a3412">{sig}</text>')
    lines.append(f'  <text x="682" y="{y + 24}" font-size="8" fill="#6b7280">{num} {typ}</text>')

lines.append('  <rect x="670" y="440" width="235" height="33" rx="4" fill="#fef3c7" stroke="#fbbf24" stroke-width="1"/>')
lines.append('  <text x="787" y="455" text-anchor="middle" font-size="9" font-weight="700" fill="#92400e">Relational \u2713   Temporal \u2713</text>')
lines.append('  <text x="787" y="468" text-anchor="middle" font-size="8.5" fill="#92400e">Fills Hindsight gaps \u2192 9/9 types covered</text>')
lines.append('  <text x="787" y="486" text-anchor="middle" font-size="9" fill="#6b7280">SQL analytics \u2022 time-series \u2022 drift detection</text>')

# ============================
# ANALYSIS AGENT (x=245-714, y=568-660)
# ============================
lines.append('  <rect x="245" y="568" width="470" height="92" rx="8" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/>')
lines.append('  <rect x="245" y="568" width="470" height="30" rx="8" fill="#7c3aed"/>')
lines.append('  <rect x="245" y="583" width="470" height="15" fill="#7c3aed"/>')
lines.append('  <text x="480" y="588" text-anchor="middle" font-size="11" font-weight="700" fill="white">ANALYSIS AGENT</text>')
lines.append('  <text x="480" y="611" text-anchor="middle" font-size="9" fill="#6b21a8">Paperclip Meta-Layer \u2022 Scheduled \u2022 not project-level</text>')
lines.append('  <text x="480" y="628" text-anchor="middle" font-size="9" fill="#374151">Weekly: model routing \u2022 agent performance \u2022 cost optimisation</text>')
lines.append('  <text x="480" y="643" text-anchor="middle" font-size="9" fill="#374151">Monthly: process optimisation \u2022 client intelligence</text>')

# FELIX COO (x=758-917, y=576-648)
lines.append('  <rect x="758" y="576" width="160" height="72" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>')
lines.append('  <text x="838" y="598" text-anchor="middle" font-size="11" font-weight="700" fill="#92400e">FELIX COO</text>')
lines.append('  <text x="838" y="613" text-anchor="middle" font-size="9" fill="#374151">Human review queue</text>')
lines.append('  <text x="838" y="628" text-anchor="middle" font-size="8.5" fill="#6b7280">prompt changes</text>')
lines.append('  <text x="838" y="641" text-anchor="middle" font-size="8.5" fill="#6b7280">budget \u2022 client risk</text>')

# ============================
# ARROWS
# ============================

# Agent -> Hindsight: retain (down, green solid)
lines.append('  <line x1="163" y1="163" x2="163" y2="203" stroke="#059669" stroke-width="2" marker-end="url(#a-green)"/>')
# Hindsight -> Agent: recall (up, green dashed)
lines.append('  <line x1="178" y1="203" x2="178" y2="163" stroke="#059669" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#a-green)"/>')
lines.append('  <rect x="110" y="175" width="40" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="130" y="185" text-anchor="middle" font-size="8" fill="#059669">retain</text>')
lines.append('  <rect x="182" y="175" width="36" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="200" y="185" text-anchor="middle" font-size="8" fill="#059669">recall</text>')

# Agent -> LLM Wiki: ingest (down, blue solid)
lines.append('  <line x1="469" y1="163" x2="469" y2="203" stroke="#2563eb" stroke-width="2" marker-end="url(#a-blue)"/>')
# LLM Wiki -> Agent: query (up, blue dashed)
lines.append('  <line x1="485" y1="203" x2="485" y2="163" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#a-blue)"/>')
lines.append('  <rect x="424" y="175" width="36" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="442" y="185" text-anchor="middle" font-size="8" fill="#2563eb">ingest</text>')
lines.append('  <rect x="489" y="175" width="32" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="505" y="185" text-anchor="middle" font-size="8" fill="#2563eb">query</text>')

# Agent -> ClickHouse: emit_signal (down, orange)
lines.append('  <line x1="780" y1="163" x2="780" y2="203" stroke="#ea580c" stroke-width="2" marker-end="url(#a-orange)"/>')
lines.append('  <rect x="725" y="175" width="48" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="749" y="185" text-anchor="middle" font-size="8" fill="#ea580c">5 signals</text>')

# ClickHouse -> Analysis Agent (gray dashed, down + diagonal)
lines.append('  <path d="M 787 497 L 787 545 L 714 568" stroke="#6b7280" stroke-width="1.5" stroke-dasharray="4,2" fill="none" marker-end="url(#a-gray)"/>')
lines.append('  <rect x="726" y="516" width="60" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="756" y="526" text-anchor="middle" font-size="8" fill="#6b7280">SQL queries</text>')

# Analysis Agent -> LLM Wiki (purple solid, up-left path)
lines.append('  <path d="M 415 568 L 415 497 L 478 497" stroke="#7c3aed" stroke-width="1.5" fill="none" marker-end="url(#a-purple)"/>')
lines.append('  <rect x="366" y="521" width="78" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="405" y="531" text-anchor="middle" font-size="8" fill="#7c3aed">update SOPs</text>')

# Analysis Agent -> Hindsight (purple dashed, route left + up along canvas edge)
lines.append('  <path d="M 247 600 L 24 600 L 24 348 L 38 348" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,2" fill="none" marker-end="url(#a-purple)"/>')
lines.append('  <rect x="85" y="588" width="68" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="119" y="598" text-anchor="middle" font-size="8" fill="#7c3aed">BI learning</text>')

# Analysis Agent -> Felix COO (gray dashed)
lines.append('  <line x1="715" y1="608" x2="756" y2="608" stroke="#6b7280" stroke-width="1" stroke-dasharray="3,2" fill="none" marker-end="url(#a-gray)"/>')
lines.append('  <rect x="715" y="596" width="42" height="13" rx="2" fill="#f8f6f3" opacity="0.95"/>')
lines.append('  <text x="736" y="606" text-anchor="middle" font-size="8" fill="#6b7280">escalate</text>')

# ============================
# LEGEND
# ============================
lines.append('  <rect x="40" y="714" width="880" height="88" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>')
lines.append('  <text x="60" y="731" font-size="9" font-weight="700" fill="#374151">LEGEND</text>')

legend = [
    (60,  750, "#059669","2",   "",    "green",  "Memory read (recall) \u2014 before every task"),
    (60,  768, "#059669","1.5", "4,2", "green",  "Memory write (retain) \u2014 after every task"),
    (60,  786, "#2563eb","2",   "",    "blue",   "Procedural knowledge (ingest / query)"),
    (350, 750, "#ea580c","2",   "",    "orange", "Analytics event (emit_signal) \u2014 never blocks agent"),
    (350, 768, "#6b7280","1.5", "4,2", "gray",   "SQL analytics query / escalation to Felix"),
    (350, 786, "#7c3aed","1.5", "",    "purple", "BI feedback loop \u2014 self-improvement"),
    (650, 750, "#7c3aed","1.5", "4,2", "purple", "BI learning retained in Hindsight (async)"),
    (650, 768, "#6b7280","1",   "3,2", "gray",   "Human escalation \u2014 prompt/budget changes"),
]
for lx, ly, col, sw, dash, nm, lbl in legend:
    da = f' stroke-dasharray="{dash}"' if dash else ""
    lines.append(f'  <line x1="{lx}" y1="{ly}" x2="{lx + 45}" y2="{ly}" stroke="{col}" stroke-width="{sw}"{da} marker-end="url(#a-{nm})"/>')
    lines.append(f'  <text x="{lx + 50}" y="{ly + 4}" font-size="8.5" fill="#374151">{lbl}</text>')

lines.append('  <text x="480" y="793" text-anchor="middle" font-size="8" fill="#94a3b8">Abzum Memory Stack v2.0 \u2022 execution/context_persistence.md \u2022 9/9 intelligence types covered</text>')

lines.append('</svg>')

out = 'C:/Apps/Abzum-MemoryBank-BusinessIntelligence/diagrams/hindsight-clickhouse-flow.svg'
with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print(f"Generated: {out}  ({len(lines)} lines)")
