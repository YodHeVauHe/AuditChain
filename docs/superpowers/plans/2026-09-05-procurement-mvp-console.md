# AuditChain Console + Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the two-role Next.js console (Procurement commits events with evidence; Auditor verifies evidence, chains and anomalies) and the one-command docker-compose deployment of the full demo.

**Architecture:** The console is the institution side: it owns the off-chain evidence store (files on disk + SQLite metadata) and the institution Ed25519 key, signs events, and talks to the nodes only over their HTTP API (built by the node plan). Pages: `/` procurement, `/audit` auditor.

**Tech Stack:** Next.js (App Router, TypeScript, Tailwind), node:crypto for Ed25519/SHA-256, better-sqlite3 for console-side metadata, vitest, Docker Compose.

**Prerequisite:** The node plan (`docs/superpowers/plans/2026-09-05-procurement-mvp-node.md`) is implemented — its HTTP API and binaries are consumed here.

## Global Constraints

- Canonical JSON must byte-match the Rust implementation: keys sorted lexicographically, no whitespace, `JSON.stringify`-style escaping. The parity fixture from the node plan Task 1 is authoritative and must be asserted verbatim in vitest: `{"actor":"treasury","evidence":[{"filename":"payment-instruction.txt","sha256":"9f2c41aa67d8b0e5c314f7a92e8b6d401cf5a83b72e09d16c4f8a7b3e2d95c10"}],"occurred_at":"2026-03-14","ref":"PAY-2026-0123","title":"Advance payment released","type":"payment_made"}`
- All demo strings are ASCII (canonical parity depends on identical escaping).
- Env vars (console): `AUDITCHAIN_NODES` (comma-separated node base URLs, index 0 is the leader), `INSTITUTION_KEY_PATH` (PKCS#8 PEM), `EVIDENCE_STORE_PATH` (directory), `CONSOLE_DB_PATH` (SQLite file).
- The console never touches node SQLite files; only HTTP: `POST /events`, `GET /chain`, `GET /events/:ref`, `GET /integrity`, `GET /internal/status`.
- Node response shapes (from the node plan): `POST /events` → 200 `{"status":"committed","height":N,"block_hash":"…"}` | 400 `{"error":…}` | 409 `{"error":"duplicate ref: …"}` | 504 `{"status":"pending","reason":…}`; `GET /chain` → `{"node_id","head_height","blocks":[{"header_hash","block":{header,events,leader_signature,certificate}}]}`; `GET /integrity` → `{"node_id","ok","head_height","blocks":[{"height","ok","reason"}]}`; `GET /internal/status` → `{"node_id","head_height","head_hash","validator_pubkey"}`.
- Evidence verification always re-hashes bytes and compares against ledger hashes — never trusts the console's own metadata columns.
- Ports: nodes 7001–7003 → containers 7000; console 3000.
- The PitchDeck directory is untouched.

---

### Task 1: Scaffold the console app

**Files:**
- Create: `console/` (Next.js app via create-next-app), then set `console/package.json` scripts
- Create: `console/src/app/layout.tsx` (dark theme + nav)
- Create: `console/src/app/page.tsx` (placeholder)
- Create: `console/vitest.config.ts`

**Interfaces:**
- Produces: the app shell all later tasks extend; vitest wired (`npm test` = `vitest run`).

- [ ] **Step 1: Scaffold**

From the repo root:

```bash
npx create-next-app@latest console --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install=false
```

Accept defaults for anything the flags don't cover (no turbopack prompt: choose No). Then add deps:

```bash
cd console && npm i better-sqlite3 && npm i -D vitest @types/better-sqlite3
```

Add to `console/package.json` scripts: `"test": "vitest run"`.

`console/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node" },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

- [ ] **Step 2: Dark layout and placeholder page**

Replace `console/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "AuditChain Console", description: "Procurement commitments and audit verification" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0e0c09] text-[#efe9dd] antialiased">
        <header className="border-b border-[#2a251c] bg-[#12100c]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-mono text-sm tracking-[0.3em] uppercase text-[#c9a45c]">
              AuditChain
            </Link>
            <nav className="flex gap-6 font-mono text-xs tracking-[0.2em] uppercase text-[#8a8271]">
              <Link href="/" className="hover:text-[#efe9dd]">Procurement</Link>
              <Link href="/audit" className="hover:text-[#efe9dd]">Auditor</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
```

Replace `console/src/app/page.tsx`:

```tsx
export default function Home() {
  return <p className="text-sm text-[#8a8271]">Console skeleton — tasks follow.</p>;
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build completes; `/` renders the placeholder.

- [ ] **Step 4: Commit**

```bash
git add console
git commit -m "feat(console): scaffold Next.js app with dark layout"
```

---

### Task 2: Canonical JSON with Rust parity

**Files:**
- Create: `console/src/lib/canonical.ts`
- Test: `console/src/lib/canonical.test.ts`

**Interfaces:**
- Produces: `canonicalJSON(v: unknown): string` — must byte-match Rust `canonicalize`.

- [ ] **Step 1: Write the failing test**

`console/src/lib/canonical.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canonicalJSON } from "./canonical";

// Same fixture as node/src/canonical.rs — the cross-language contract.
const FIXTURE =
  '{"actor":"treasury","evidence":[{"filename":"payment-instruction.txt","sha256":"9f2c41aa67d8b0e5c314f7a92e8b6d401cf5a83b72e09d16c4f8a7b3e2d95c10"}],"occurred_at":"2026-03-14","ref":"PAY-2026-0123","title":"Advance payment released","type":"payment_made"}';

describe("canonicalJSON", () => {
  it("sorts keys recursively and drops whitespace", () => {
    const event = {
      type: "payment_made",
      ref: "PAY-2026-0123",
      title: "Advance payment released",
      actor: "treasury",
      occurred_at: "2026-03-14",
      evidence: [{ sha256: "9f2c41aa67d8b0e5c314f7a92e8b6d401cf5a83b72e09d16c4f8a7b3e2d95c10", filename: "payment-instruction.txt" }],
    };
    expect(canonicalJSON(event)).toBe(FIXTURE);
  });

  it("is stable across reserialization", () => {
    const once = canonicalJSON(JSON.parse(FIXTURE));
    expect(canonicalJSON(JSON.parse(once))).toBe(once);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — `canonicalJSON` not implemented.

- [ ] **Step 3: Implement**

`console/src/lib/canonical.ts`:

```ts
function sortValue(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortValue);
  if (v !== null && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = sortValue((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  return v;
}

export function canonicalJSON(v: unknown): string {
  return JSON.stringify(sortValue(v));
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add console/src/lib
git commit -m "feat(console): canonical JSON matching Rust parity fixture"
```

---

### Task 3: Anomaly rules engine (R1/R2)

**Files:**
- Create: `console/src/lib/anomalies.ts`
- Test: `console/src/lib/anomalies.test.ts`

**Interfaces:**
- Consumes: `ChainEvent` shape (matches ledger event JSON).
- Produces: `detectAnomalies(events: ChainEvent[]): Anomaly[]` with `Anomaly { ruleId: "R1" | "R2"; severity: "critical"; eventRef: string; explanation: string }`, and `PREDECESSOR: Record<string, string>`.

- [ ] **Step 1: Write failing tests**

`console/src/lib/anomalies.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { detectAnomalies, type ChainEvent } from "./anomalies";

function ev(ref: string, type: string, occurred: string): ChainEvent {
  return { ref, type, title: ref, actor: "seed", occurred_at: occurred };
}

// The seeded slide-8 lifecycle: PAY (14 Mar) precedes CON (16 Mar) — one R1.
const SEEDED: ChainEvent[] = [
  ev("BUD-2026-0031", "budget_created", "2026-02-04"),
  ev("PR-2026-0117", "procurement_started", "2026-02-12"),
  ev("BID-2026-0089", "bid_received", "2026-02-21"),
  ev("EVAL-2026-0064", "bid_evaluated", "2026-02-27"),
  ev("SEL-2026-0058", "supplier_selected", "2026-03-05"),
  ev("CON-2026-0455", "contract_approved", "2026-03-16"),
  ev("PAY-2026-0123", "payment_made", "2026-03-14"),
];

describe("detectAnomalies", () => {
  it("seeded scenario yields exactly one R1 on PAY-2026-0123", () => {
    const out = detectAnomalies(SEEDED);
    expect(out).toHaveLength(1);
    expect(out[0].ruleId).toBe("R1");
    expect(out[0].eventRef).toBe("PAY-2026-0123");
    expect(out[0].severity).toBe("critical");
    expect(out[0].explanation).toContain("contract_approved");
  });

  it("clean chain yields nothing", () => {
    const clean = SEEDED.map((e) => ({ ...e, occurred_at: e.occurred_at }));
    // move PAY after CON
    clean[6].occurred_at = "2026-03-20";
    expect(detectAnomalies(clean)).toHaveLength(0);
  });

  it("R2 fires when the required predecessor is missing entirely", () => {
    const only = [ev("BUD-2026-0031", "budget_created", "2026-02-04"), ev("PAY-1", "payment_made", "2026-03-01")];
    const out = detectAnomalies(only);
    expect(out).toHaveLength(1);
    expect(out[0].ruleId).toBe("R2");
    expect(out[0].eventRef).toBe("PAY-1");
  });

  it("R1 fires when predecessor exists only later in time", () => {
    const out = detectAnomalies([ev("PR-1", "procurement_started", "2026-01-01"), ev("BUD-1", "budget_created", "2026-02-01")]);
    expect(out).toHaveLength(1);
    expect(out[0].ruleId).toBe("R1");
    expect(out[0].eventRef).toBe("PR-1");
  });

  it("ignores budget_created (no predecessor)", () => {
    expect(detectAnomalies([ev("BUD-1", "budget_created", "2026-01-01")])).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement**

`console/src/lib/anomalies.ts`:

```ts
export interface ChainEvent {
  ref: string;
  type: string;
  title: string;
  actor: string;
  occurred_at: string;
  amount?: number;
  evidence?: { filename: string; sha256: string }[];
  institution_signature?: string;
}

export interface Anomaly {
  ruleId: "R1" | "R2";
  severity: "critical";
  eventRef: string;
  explanation: string;
}

export const PREDECESSOR: Record<string, string> = {
  procurement_started: "budget_created",
  bid_received: "procurement_started",
  bid_evaluated: "bid_received",
  supplier_selected: "bid_evaluated",
  contract_approved: "supplier_selected",
  payment_made: "contract_approved",
};

export function detectAnomalies(events: ChainEvent[]): Anomaly[] {
  const out: Anomaly[] = [];
  for (const e of events) {
    const predType = PREDECESSOR[e.type];
    if (!predType) continue;
    const preds = events.filter((p) => p.type === predType);
    if (preds.length === 0) {
      out.push({
        ruleId: "R2",
        severity: "critical",
        eventRef: e.ref,
        explanation: `${e.type} committed with no ${predType} anywhere in the chain`,
      });
      continue;
    }
    if (!preds.some((p) => p.occurred_at <= e.occurred_at)) {
      out.push({
        ruleId: "R1",
        severity: "critical",
        eventRef: e.ref,
        explanation: `${e.type} (${e.occurred_at}) committed before its required predecessor ${predType} (${preds[0].occurred_at})`,
      });
    }
  }
  return out;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS (7 tests total).

- [ ] **Step 5: Commit**

```bash
git add console/src/lib
git commit -m "feat(console): R1/R2 anomaly rules engine"
```

---

### Task 4: Node client, evidence store, institution signing

**Files:**
- Create: `console/src/lib/nodes.ts`
- Create: `console/src/lib/evidence.ts`
- Create: `console/src/lib/sign.ts`
- Test: `console/src/lib/evidence.test.ts`, `console/src/lib/sign.test.ts`

**Interfaces:**
- Consumes: node HTTP API (see Global Constraints).
- Produces:
  - `nodes.nodeUrls(): string[]`; `nodes.submitEvent(ev: unknown): Promise<SubmitResult>` where `SubmitResult = { status: "committed"; height: number; blockHash: string } | { status: "pending"; reason: string } | { status: "rejected"; error: string }`; `nodes.getChain(i?): Promise<ChainResponse>`; `nodes.getIntegrity(i?)`; `nodes.getStatus(i?)`; `nodes.getEvent(ref, i?)`
  - `evidence.initStore(): void` (creates tables); `evidence.storeFile(ref: string, filename: string, bytes: Buffer): StoredFile` with `StoredFile { filename: string; sha256: string }`; `evidence.listFiles(ref: string): { filename: string; path: string }[]`; `evidence.readFile(ref: string, filename: string): Buffer | null`
  - `sign.canonicalSign(event: Record<string, unknown>, privateKeyPem: string): string` — removes/ignores `institution_signature`, canonicalizes, signs, returns hex

- [ ] **Step 1: Implement (pure/IO modules — behavior verified by tests in this task)**

`console/src/lib/nodes.ts`:

```ts
import type { ChainEvent } from "./anomalies";

export type SubmitResult =
  | { status: "committed"; height: number; blockHash: string }
  | { status: "pending"; reason: string }
  | { status: "rejected"; error: string };

export function nodeUrls(): string[] {
  const raw = process.env.AUDITCHAIN_NODES ?? "http://127.0.0.1:7001";
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

function base(i: number): string {
  const urls = nodeUrls();
  return urls[Math.min(i, urls.length - 1)];
}

export async function submitEvent(ev: unknown): Promise<SubmitResult> {
  let resp: Response;
  try {
    resp = await fetch(`${base(0)}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(ev),
    });
  } catch (e) {
    return { status: "rejected", error: `leader unreachable: ${(e as Error).message}` };
  }
  const body = await resp.json().catch(() => ({}));
  if (resp.status === 200 && body.status === "committed") {
    return { status: "committed", height: body.height, blockHash: body.block_hash };
  }
  if (resp.status === 504 && body.status === "pending") {
    return { status: "pending", reason: body.reason };
  }
  return { status: "rejected", error: body.error ?? `node returned ${resp.status}` };
}

export interface ChainResponse {
  node_id: string;
  head_height: number;
  blocks: { header_hash: string; block: { header: { height: number }; events: ChainEvent[] } }[];
}

export async function getChain(i = 0): Promise<ChainResponse> {
  const r = await fetch(`${base(i)}/chain`, { cache: "no-store" });
  if (!r.ok) throw new Error(`chain unavailable from node ${i}: ${r.status}`);
  return r.json();
}

export async function getIntegrity(i = 0) {
  const r = await fetch(`${base(i)}/integrity`, { cache: "no-store" });
  if (!r.ok) throw new Error(`integrity unavailable from node ${i}: ${r.status}`);
  return r.json() as Promise<{ node_id: string; ok: boolean; head_height: number; blocks: { height: number; ok: boolean; reason: string | null }[] }>;
}

export async function getStatus(i = 0) {
  const r = await fetch(`${base(i)}/internal/status`, { cache: "no-store" });
  if (!r.ok) throw new Error(`node ${i} unreachable: ${r.status}`);
  return r.json() as Promise<{ node_id: string; head_height: number; head_hash: string; validator_pubkey: string }>;
}

export async function getEvent(ref: string, i = 0) {
  const r = await fetch(`${base(i)}/events/${encodeURIComponent(ref)}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`event lookup failed: ${r.status}`);
  return r.json() as Promise<{ event: ChainEvent; height: number; block_hash: string }>;
}
```

`console/src/lib/evidence.ts`:

```ts
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface StoredFile {
  filename: string;
  sha256: string;
}

function storePath(): string {
  return process.env.EVIDENCE_STORE_PATH ?? "./data/evidence";
}

function dbPath(): string {
  return process.env.CONSOLE_DB_PATH ?? "./data/console.db";
}

let db: Database.Database | null = null;

function conn(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(dbPath()), { recursive: true });
    db = new Database(dbPath());
    db.exec(
      "CREATE TABLE IF NOT EXISTS evidence (id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT NOT NULL, filename TEXT NOT NULL, sha256 TEXT NOT NULL, path TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)"
    );
  }
  return db;
}

export function initStore(): void {
  conn();
}

export function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function storeFile(ref: string, filename: string, bytes: Buffer): StoredFile {
  const dir = storePath();
  fs.mkdirSync(dir, { recursive: true });
  const safe = filename.replace(/[^A-Za-z0-9._-]/g, "_");
  const onDisk = `${Date.now()}-${safe}`;
  const full = path.join(dir, onDisk);
  fs.writeFileSync(full, bytes);
  const sha256 = sha256Hex(bytes);
  conn()
    .prepare(
      "INSERT INTO evidence (ref, filename, sha256, path, size, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(ref, safe, sha256, full, bytes.length, new Date().toISOString());
  return { filename: safe, sha256 };
}

export function listFiles(ref: string): { filename: string; path: string }[] {
  return conn()
    .prepare("SELECT filename, path FROM evidence WHERE ref = ? ORDER BY id ASC")
    .all(ref) as { filename: string; path: string }[];
}

export function readFile(ref: string, filename: string): Buffer | null {
  const row = conn()
    .prepare("SELECT path FROM evidence WHERE ref = ? AND filename = ? ORDER BY id DESC")
    .get(ref, filename) as { path: string } | undefined;
  if (!row || !fs.existsSync(row.path)) return null;
  return fs.readFileSync(row.path);
}
```

`console/src/lib/sign.ts`:

```ts
import fs from "node:fs";
import { createPrivateKey, sign as cryptoSign } from "node:crypto";
import { canonicalJSON } from "./canonical";

export function canonicalSign(event: Record<string, unknown>, privateKeyPem: string): string {
  const unsigned = { ...event };
  delete unsigned.institution_signature;
  const payload = Buffer.from(canonicalJSON(unsigned), "utf8");
  const key = createPrivateKey(privateKeyPem);
  return cryptoSign(null, payload, key).toString("hex");
}

export function institutionKeyPem(): string {
  return fs.readFileSync(process.env.INSTITUTION_KEY_PATH ?? "./config/institution.pem", "utf8");
}
```

- [ ] **Step 2: Tests**

`console/src/lib/sign.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateKeyPairSync, createPublicKey, verify as cryptoVerify, sign as cryptoSign } from "node:crypto";
import { canonicalSign } from "./sign";
import { canonicalJSON } from "./canonical";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

describe("canonicalSign", () => {
  it("signs the canonical event without institution_signature, Ed25519-verifiable", () => {
    const event = {
      ref: "BUD-2026-0031",
      type: "budget_created",
      title: "FY2026 Procurement Budget",
      actor: "finance-directorate",
      occurred_at: "2026-02-04",
      evidence: [{ filename: "budget-memo.txt", sha256: "ab".repeat(32) }],
      institution_signature: "STALE",
    };
    const sig = canonicalSign(event, pem as string);
    expect(sig).toHaveLength(128);
    const unsigned = { ...event };
    delete unsigned.institution_signature;
    const payload = Buffer.from(canonicalJSON(unsigned), "utf8");
    const pubPem = createPublicKey(publicKey).export({ type: "spki", format: "pem" }).toString();
    expect(cryptoVerify(null, payload, pubPem, Buffer.from(sig, "hex"))).toBe(true);
    // tampered payload fails
    expect(cryptoVerify(null, Buffer.from("nope"), pubPem, Buffer.from(sig, "hex"))).toBe(false);
  });
});
```

`console/src/lib/evidence.test.ts`:

```ts
import { describe, expect, it, beforeAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { storeFile, readFile, listFiles, sha256Hex, initStore } from "./evidence";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ac-ev-"));
process.env.EVIDENCE_STORE_PATH = path.join(dir, "files");
process.env.CONSOLE_DB_PATH = path.join(dir, "console.db");

beforeAll(() => {
  initStore();
});

describe("evidence store", () => {
  it("stores, lists, and re-reads files byte-for-byte", () => {
    const bytes = Buffer.from("FY2026 procurement budget memo - approved allocation.", "utf8");
    const stored = storeFile("BUD-2026-0031", "budget memo.txt", bytes);
    expect(stored.filename).toBe("budget_memo.txt");
    expect(stored.sha256).toBe(sha256Hex(bytes));
    expect(listFiles("BUD-2026-0031")).toHaveLength(1);
    expect(readFile("BUD-2026-0031", "budget_memo.txt")?.equals(bytes)).toBe(true);
    expect(readFile("BUD-2026-0031", "missing.txt")).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: PASS (9 tests).

- [ ] **Step 4: Commit**

```bash
git add console/src/lib
git commit -m "feat(console): node client, evidence store, institution signing"
```

---

### Task 5: API routes (commit, chain, integrity, status, verify, anomalies)

**Files:**
- Create: `console/src/app/api/commit/route.ts`
- Create: `console/src/app/api/chain/route.ts`
- Create: `console/src/app/api/event/route.ts`
- Create: `console/src/app/api/integrity/route.ts`
- Create: `console/src/app/api/nodes-status/route.ts`
- Create: `console/src/app/api/verify-evidence/route.ts`
- Create: `console/src/app/api/anomalies/route.ts`

**Interfaces:**
- Consumes: `nodes.ts`, `evidence.ts`, `sign.ts`, `anomalies.ts`.
- Produces (consumed by the UI in Tasks 6–7):
  - `POST /api/commit` (FormData: ref, type, title, actor, occurred_at, amount?, files*) → 200 `{"status":"committed","height":N,"blockHash":…,"evidence":[{filename,sha256}]}` | 202 `{"status":"pending","reason":…}` | 400 `{"status":"rejected","error":…}`
  - `GET /api/chain?node=N` → node chain JSON passthrough
  - `GET /api/event?ref=R&node=N` → `{event,height,block_hash}` or 404
  - `GET /api/integrity?node=N` → integrity JSON passthrough
  - `GET /api/nodes-status` → `{"nodes":[{url,node_id,head_height,reachable,chain_divergent,error?}]}` (one entry per configured node; `reachable:false` on fetch error; `chain_divergent` compares each node's full block-hash list against the first reachable node's — `null` when incomparable)
  - `POST /api/verify-evidence` (FormData: ref, file) → `{"ref","actualSha256","match":boolean,"expected":[{filename,sha256}]}` — hashes the uploaded bytes and compares against the ledger's evidence hashes for that ref
  - `GET /api/anomalies` → `{"anomalies":[Anomaly],"events":[ChainEvent]}`

- [ ] **Step 1: Implement the routes**

`console/src/app/api/commit/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { canonicalSign, institutionKeyPem } from "@/lib/sign";
import { storeFile, listFiles } from "@/lib/evidence";
import { submitEvent } from "@/lib/nodes";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const ref = String(form.get("ref") ?? "").trim();
  const type = String(form.get("type") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const actor = String(form.get("actor") ?? "").trim();
  const occurredAt = String(form.get("occurred_at") ?? "").trim();
  const amountRaw = String(form.get("amount") ?? "").trim();
  if (!ref || !type || !title || !actor || !occurredAt) {
    return NextResponse.json({ status: "rejected", error: "ref, type, title, actor and occurred_at are required" }, { status: 400 });
  }
  const existing = listFiles(ref);
  const evidence: { filename: string; sha256: string }[] = existing.map((f) => ({
    filename: f.filename,
    // re-hash from disk: never trust the metadata column
    sha256: createHash("sha256").update(fs.readFileSync(f.path)).digest("hex"),
  }));
  for (const f of form.getAll("files")) {
    if (f instanceof File && f.size > 0) {
      const bytes = Buffer.from(await f.arrayBuffer());
      evidence.push(storeFile(ref, f.name, bytes));
    }
  }
  const event: Record<string, unknown> = {
    ref,
    type,
    title,
    actor,
    occurred_at: occurredAt,
    evidence,
  };
  if (amountRaw) {
    const amount = Number(amountRaw);
    if (!Number.isInteger(amount) || amount < 0) {
      return NextResponse.json({ status: "rejected", error: "amount must be a non-negative integer (minor units)" }, { status: 400 });
    }
    event.amount = amount;
  }
  event.institution_signature = canonicalSign(event, institutionKeyPem());
  const result = await submitEvent(event);
  if (result.status === "committed") {
    return NextResponse.json({ ...result, evidence });
  }
  return NextResponse.json(result, { status: result.status === "pending" ? 202 : 400 });
}
```

`console/src/app/api/chain/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getChain } from "@/lib/nodes";

export async function GET(req: NextRequest) {
  const node = Number(req.nextUrl.searchParams.get("node") ?? 0);
  try {
    return NextResponse.json(await getChain(node));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
```

`console/src/app/api/event/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/lib/nodes";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref") ?? "";
  const node = Number(req.nextUrl.searchParams.get("node") ?? 0);
  if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });
  try {
    const ev = await getEvent(ref, node);
    if (!ev) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(ev);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
```

`console/src/app/api/integrity/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getIntegrity } from "@/lib/nodes";

export async function GET(req: NextRequest) {
  const node = Number(req.nextUrl.searchParams.get("node") ?? 0);
  try {
    return NextResponse.json(await getIntegrity(node));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
```

`console/src/app/api/nodes-status/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getChain, getStatus, nodeUrls } from "@/lib/nodes";

interface NodeRow {
  url: string;
  node_id: string | null;
  head_height: number | null;
  reachable: boolean;
  // true/false = chain compared against the reference node; null = incomparable
  chain_divergent: boolean | null;
  error?: string;
}

export async function GET() {
  const raw = await Promise.all(
    nodeUrls().map(async (url, i) => {
      try {
        const s = await getStatus(i);
        let hashes: string[] | null = null;
        try {
          const chain = await getChain(i);
          hashes = chain.blocks.map((b) => b.header_hash);
        } catch {
          hashes = null; // status reachable, chain read failed — divergence unknown
        }
        return { url, ...s, reachable: true, hashes };
      } catch (e) {
        return { url, node_id: null, head_height: null, reachable: false, hashes: null, error: (e as Error).message };
      }
    })
  );
  const reference = raw.find((n) => n.hashes)?.hashes ?? null;
  const nodes: NodeRow[] = raw.map(({ hashes, ...n }) => ({
    ...n,
    chain_divergent:
      reference === null || hashes === null ? null : hashes.join("") !== reference.join(""),
  }));
  return NextResponse.json({ nodes });
}
```

`console/src/app/api/verify-evidence/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getEvent } from "@/lib/nodes";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const ref = String(form.get("ref") ?? "").trim();
  const file = form.get("file");
  if (!ref || !(file instanceof File)) {
    return NextResponse.json({ error: "ref and file are required" }, { status: 400 });
  }
  const ev = await getEvent(ref);
  if (!ev) return NextResponse.json({ error: `event not found: ${ref}` }, { status: 404 });
  const expected = ev.event.evidence ?? [];
  const actualSha256 = createHash("sha256").update(Buffer.from(await file.arrayBuffer())).digest("hex");
  const match = expected.some((e) => e.sha256 === actualSha256);
  return NextResponse.json({ ref, actualSha256, match, expected });
}
```

`console/src/app/api/anomalies/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getChain } from "@/lib/nodes";
import { detectAnomalies } from "@/lib/anomalies";

export async function GET() {
  try {
    const chain = await getChain(0);
    const events = chain.blocks.flatMap((b) => b.block.events ?? []);
    return NextResponse.json({ anomalies: detectAnomalies(events), events });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build && npm test`
Expected: build clean; all tests still pass.

- [ ] **Step 3: Commit**

```bash
git add console/src/app/api
git commit -m "feat(console): API routes for commit, chain, integrity, verify, anomalies"
```

---

### Task 6: Procurement page (`/`)

**Files:**
- Modify: `console/src/app/page.tsx`
- Create: `console/src/components/commit-form.tsx` (client component)

**Interfaces:**
- Consumes: `POST /api/commit`, `GET /api/chain`.
- Produces: working commit flow with receipt display.

- [ ] **Step 1: Implement the commit form (client component)**

`console/src/components/commit-form.tsx`:

```tsx
"use client";

import { useState } from "react";

const TYPES = [
  "budget_created",
  "procurement_started",
  "bid_received",
  "bid_evaluated",
  "supplier_selected",
  "contract_approved",
  "payment_made",
];

interface Receipt {
  status: string;
  height?: number;
  blockHash?: string;
  reason?: string;
  error?: string;
  evidence?: { filename: string; sha256: string }[];
}

export function CommitForm() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setReceipt(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/commit", { method: "POST", body: form });
    setReceipt(await res.json());
    setBusy(false);
    if (res.ok) e.currentTarget.reset();
  }

  const input = "w-full rounded border border-[#2a251c] bg-[#12100c] px-3 py-2 text-sm text-[#efe9dd] placeholder:text-[#57503f] focus:border-[#c9a45c] focus:outline-none";
  const label = "block font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8271]";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border border-[#2a251c] bg-[#12100c] p-6 md:grid-cols-2">
      <div>
        <label className={label} htmlFor="ref">Ref</label>
        <input id="ref" name="ref" required placeholder="PR-2026-0118" className={input} />
      </div>
      <div>
        <label className={label} htmlFor="type">Event type</label>
        <select id="type" name="type" required className={input}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={label} htmlFor="title">Title</label>
        <input id="title" name="title" required className={input} />
      </div>
      <div>
        <label className={label} htmlFor="actor">Actor</label>
        <input id="actor" name="actor" required placeholder="procurement-directorate" className={input} />
      </div>
      <div>
        <label className={label} htmlFor="occurred_at">Occurred at</label>
        <input id="occurred_at" name="occurred_at" type="date" required className={input} />
      </div>
      <div>
        <label className={label} htmlFor="amount">Amount (minor units, optional)</label>
        <input id="amount" name="amount" type="number" min="0" className={input} />
      </div>
      <div>
        <label className={label} htmlFor="files">Evidence files</label>
        <input id="files" name="files" type="file" multiple className={input} />
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded border border-[#c9a45c] bg-[#c9a45c]/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-[#c9a45c] hover:bg-[#c9a45c]/20 disabled:opacity-50"
        >
          {busy ? "Committing…" : "Commit event"}
        </button>
      </div>
      {receipt && (
        <div className={`md:col-span-2 rounded border p-4 font-mono text-xs leading-relaxed ${
          receipt.status === "committed" ? "border-[#c9a45c]/40 bg-[#c9a45c]/5 text-[#efe9dd]"
          : receipt.status === "pending" ? "border-[#d9a441]/40 bg-[#d9a441]/5 text-[#d9c9a4]"
          : "border-[#b3564c]/40 bg-[#b3564c]/5 text-[#e0a49b]"}`}>
          <p className="uppercase tracking-[0.2em]">{receipt.status}</p>
          {receipt.status === "committed" && (
            <>
              <p className="mt-1">block {receipt.height} · hash {receipt.blockHash}</p>
              {receipt.evidence?.map((f) => (
                <p key={f.filename} className="mt-1 text-[#8a8271] break-all">{f.filename} · sha256 {f.sha256}</p>
              ))}
            </>
          )}
          {receipt.reason && <p className="mt-1">{receipt.reason}</p>}
          {receipt.error && <p className="mt-1">{receipt.error}</p>}
        </div>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Page with committed-events table**

`console/src/app/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { CommitForm } from "@/components/commit-form";

interface ChainEvent {
  ref: string;
  type: string;
  title: string;
  actor: string;
  occurred_at: string;
  amount?: number;
  evidence?: { filename: string; sha256: string }[];
}

export default function ProcurementPage() {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/chain?node=0", { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text());
      const chain = await r.json();
      setEvents(chain.blocks.flatMap((b: { block: { events: ChainEvent[] } }) => b.block.events ?? []));
      setHeadHeight(chain.head_height);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Procurement</h1>
        <p className="mt-1 text-sm text-[#8a8271]">
          Commit procurement events as they happen. Evidence stays here — only its SHA-256 crosses to the ledger.
          {headHeight !== null && <span className="ml-2 font-mono text-xs text-[#c9a45c]">ledger head: {headHeight}</span>}
        </p>
        {error && <p className="mt-2 rounded border border-[#b3564c]/40 bg-[#b3564c]/5 p-3 font-mono text-xs text-[#e0a49b]">ledger unreachable: {error}</p>}
      </div>
      <CommitForm />
      <div>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#8a8271]">Committed events</h2>
        <div className="overflow-x-auto rounded-lg border border-[#2a251c]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#12100c] font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8271]">
              <tr>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Occurred</th>
                <th className="px-4 py-3">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.ref} className="border-t border-[#2a251c]">
                  <td className="px-4 py-3 font-mono text-xs text-[#c9a45c]">{e.ref}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.type}</td>
                  <td className="px-4 py-3">{e.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.occurred_at}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#8a8271]">{e.evidence?.length ?? 0}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-[#57503f]">No events committed yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add console/src
git commit -m "feat(console): procurement page with commit form and receipts"
```

---

### Task 7: Auditor page (`/audit`)

**Files:**
- Modify: `console/src/app/page.tsx` (no change)
- Create: `console/src/app/audit/page.tsx` (client component, single file with inline sections)

**Interfaces:**
- Consumes: `GET /api/anomalies`, `GET /api/integrity?node=N`, `GET /api/nodes-status`, `GET /api/chain?node=N`, `POST /api/verify-evidence`.
- Produces: the auditor's timeline, evidence verification panel, integrity check, node status strip, anomalies panel.

- [ ] **Step 1: Implement the page**

`console/src/app/audit/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ChainEvent, Anomaly } from "@/lib/anomalies";

interface IntegrityReport {
  node_id?: string;
  ok?: boolean;
  head_height?: number;
  blocks?: { height: number; ok: boolean; reason: string | null }[];
  error?: string;
}

interface NodeStatus {
  url: string;
  node_id: string | null;
  head_height: number | null;
  reachable: boolean;
  chain_divergent: boolean | null;
}

export default function AuditPage() {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [nodeCount, setNodeCount] = useState(3);
  const [node, setNode] = useState(0);
  const [integrity, setIntegrity] = useState<IntegrityReport | null>(null);
  const [statuses, setStatuses] = useState<NodeStatus[]>([]);
  const [openRef, setOpenRef] = useState<string | null>(null);

  async function loadTimeline() {
    const r = await fetch("/api/anomalies", { cache: "no-store" });
    const j = await r.json();
    if (j.events) setEvents(j.events);
    if (j.anomalies) setAnomalies(j.anomalies);
  }

  async function loadStatuses() {
    const r = await fetch("/api/nodes-status", { cache: "no-store" });
    const j = await r.json();
    if (j.nodes) {
      setStatuses(j.nodes);
      setNodeCount(j.nodes.length);
    }
  }

  async function runIntegrity(i: number) {
    setIntegrity(null);
    const r = await fetch(`/api/integrity?node=${i}`, { cache: "no-store" });
    setIntegrity(await r.json());
  }

  useEffect(() => {
    loadTimeline();
    loadStatuses();
    const t = setInterval(() => { loadTimeline(); loadStatuses(); }, 5000);
    return () => clearInterval(t);
  }, []);

  const card = "rounded-lg border border-[#2a251c] bg-[#12100c] p-6";

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Auditor</h1>
        <p className="mt-1 text-sm text-[#8a8271]">
          Verify evidence against the ledger, check any node's integrity, and review anomalies. Trust no single node — pick any.
        </p>
      </div>

      {/* node status strip */}
      <div className="grid gap-3 md:grid-cols-3">
        {statuses.map((s, i) => (
          <div key={s.url} className="rounded border border-[#2a251c] bg-[#12100c] p-4 font-mono text-xs">
            <p className="uppercase tracking-[0.2em] text-[#8a8271]">node {i + 1}</p>
            <p className={s.reachable ? "mt-1 text-[#7da97b]" : "mt-1 text-[#e0a49b]"}>
              {s.reachable ? `reachable · head ${s.head_height}` : "unreachable"}
            </p>
            {s.chain_divergent === true && (
              <p className="mt-1 text-[#e0a49b]">CHAIN DIVERGES FROM PEERS</p>
            )}
            {s.chain_divergent === false && (
              <p className="mt-1 text-[#57503f]">chain matches peers</p>
            )}
          </div>
        ))}
      </div>

      {/* anomalies */}
      <div>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#8a8271]">Anomalies</h2>
        {anomalies.length === 0 ? (
          <p className="text-sm text-[#7da97b]">No process anomalies detected.</p>
        ) : (
          anomalies.map((a) => (
            <div key={a.ruleId + a.eventRef} className="mt-2 rounded border border-[#b3564c]/40 bg-[#b3564c]/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e0a49b]">{a.ruleId} · {a.severity}</p>
              <p className="mt-1 text-sm">{a.eventRef} — {a.explanation}</p>
            </div>
          ))
        )}
      </div>

      {/* timeline */}
      <div>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#8a8271]">Lifecycle timeline</h2>
        <ol className="grid gap-2">
          {events.map((e) => (
            <li key={e.ref}>
              <button
                onClick={() => setOpenRef(openRef === e.ref ? null : e.ref)}
                className="flex w-full items-center justify-between rounded border border-[#2a251c] bg-[#12100c] px-4 py-3 text-left hover:border-[#c9a45c]/40"
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#c9a45c]">{e.ref}</span>
                  <span className="text-sm">{e.title}</span>
                </span>
                <span className="font-mono text-xs text-[#8a8271]">{e.occurred_at}</span>
              </button>
              {openRef === e.ref && <EventDetail ref_={e.ref} evidence={e.evidence ?? []} />}
            </li>
          ))}
        </ol>
      </div>

      {/* integrity */}
      <div className={card}>
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#8a8271]">Chain integrity</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={node}
            onChange={(e) => setNode(Number(e.target.value))}
            className="rounded border border-[#2a251c] bg-[#0e0c09] px-3 py-2 font-mono text-xs"
          >
            {Array.from({ length: nodeCount }, (_, i) => <option key={i} value={i}>node {i + 1}</option>)}
          </select>
          <button
            onClick={() => runIntegrity(node)}
            className="rounded border border-[#c9a45c] bg-[#c9a45c]/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#c9a45c] hover:bg-[#c9a45c]/20"
          >
            Verify this node
          </button>
        </div>
        {integrity && (
          <div className="mt-4">
            {integrity.error ? (
              <p className="font-mono text-xs text-[#e0a49b]">error: {integrity.error}</p>
            ) : (
              <>
                <p className={`font-mono text-sm ${integrity.ok ? "text-[#7da97b]" : "text-[#e0a49b]"}`}>
                  {integrity.node_id}: {integrity.ok ? "chain intact" : "TAMPERING DETECTED"} · head {integrity.head_height}
                </p>
                <ul className="mt-2 grid gap-1 font-mono text-xs">
                  {integrity.blocks?.filter((b) => !b.ok).map((b) => (
                    <li key={b.height} className="text-[#e0a49b]">block {b.height}: {b.reason}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventDetail({ ref_, evidence }: { ref_: string; evidence: { filename: string; sha256: string }[] }) {
  const [result, setResult] = useState<{ match: boolean; actualSha256: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function verifyStored() {
    setBusy(true);
    setResult(null);
    const r = await fetch("/api/verify-stored", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ref: ref_ }),
    });
    setResult(await r.json());
    setBusy(false);
  }

  async function verifyUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setResult(null);
    const form = new FormData();
    form.set("ref", ref_);
    form.set("file", f);
    const r = await fetch("/api/verify-evidence", { method: "POST", body: form });
    setResult(await r.json());
    setBusy(false);
  }

  return (
    <div className="ml-6 mt-2 rounded border border-[#2a251c] bg-[#0e0c09] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8271]">Evidence on the ledger</p>
      <ul className="mt-2 grid gap-1 font-mono text-xs">
        {evidence.length === 0 && <li className="text-[#57503f]">no evidence attached</li>}
        {evidence.map((f) => (
          <li key={f.filename} className="break-all text-[#8a8271]">{f.filename} · {f.sha256}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={verifyStored}
          disabled={busy || evidence.length === 0}
          className="rounded border border-[#c9a45c] bg-[#c9a45c]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c9a45c] hover:bg-[#c9a45c]/20 disabled:opacity-50"
        >
          Re-hash stored originals
        </button>
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8271]">
          or upload a file to check:
          <input type="file" onChange={verifyUpload} className="ml-2 text-xs" />
        </label>
      </div>
      {result && (
        <p className={`mt-3 rounded border p-3 font-mono text-xs ${result.match ? "border-[#7da97b]/40 bg-[#7da97b]/5 text-[#7da97b]" : "border-[#b3564c]/40 bg-[#b3564c]/5 text-[#e0a49b]"}`}>
          {result.match ? "VERIFIED — hash matches the ledger commitment" : "MISMATCH — this file does not match the ledger commitment"}
          <span className="mt-1 block break-all text-[#8a8271]">sha256: {result.actualSha256}</span>
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add the `/api/verify-stored` route used above**

`console/src/app/api/verify-stored/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { listFiles } from "@/lib/evidence";
import { getEvent } from "@/lib/nodes";

export async function POST(req: NextRequest) {
  const { ref } = await req.json();
  if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });
  const ev = await getEvent(ref);
  if (!ev) return NextResponse.json({ error: `event not found: ${ref}` }, { status: 404 });
  const expected = ev.event.evidence ?? [];
  const files = listFiles(ref);
  if (files.length === 0) return NextResponse.json({ error: "no stored evidence for this ref" }, { status: 404 });
  // verify every stored file; report the weakest result
  let match = true;
  let actualSha256 = "";
  for (const f of files) {
    const bytes = fs.readFileSync(f.path); // re-hash from disk — never trust metadata
    actualSha256 = createHash("sha256").update(bytes).digest("hex");
    if (!expected.some((e) => e.sha256 === actualSha256)) match = false;
  }
  return NextResponse.json({ ref, actualSha256, match, expected });
}
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm test`
Expected: clean build, tests pass.

- [ ] **Step 4: Commit**

```bash
git add console/src
git commit -m "feat(console): auditor page — timeline, verification, integrity, anomalies"
```

---

### Task 8: Docker deployment + demo script

**Files:**
- Create: `node/Dockerfile`
- Create: `console/Dockerfile`
- Create: `deploy/docker-compose.yml`
- Create: `deploy/init.sh`
- Create: `deploy/.gitignore` (`config/`, `data/`)
- Create: `DEMO.md`

**Interfaces:**
- Consumes: everything built so far.
- Produces: `docker compose up` → running demo with seeded ledger at http://localhost:3000.

- [ ] **Step 1: Node image**

`node/Dockerfile`:

```dockerfile
FROM rust:1.83-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY node ./node
RUN cargo build --release -p auditchain-node

FROM debian:bookworm-slim
COPY --from=build /build/node/target/release/auditchain-node /usr/local/bin/
COPY --from=build /build/node/target/release/tamper-demo /usr/local/bin/
ENTRYPOINT ["auditchain-node"]
```

- [ ] **Step 2: Console image**

`console/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY console/package*.json ./
RUN npm ci
COPY console ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm", "start"]
```

- [ ] **Step 3: init.sh**

`deploy/init.sh` (idempotent — safe on every `compose up`):

```sh
#!/bin/sh
# One-time key material for the demo cluster. Idempotent.
set -e
cd /config

gen() {
  if [ ! -f "$1" ]; then
    auditchain-node keygen --out "$1"
    echo "generated $1"
  fi
}

gen validator-node1.pem
gen validator-node2.pem
gen validator-node3.pem
gen institution.pem

# validators.json: hex pubkeys for all validators + the institution
if [ ! -f validators.json ]; then
  N1=$(auditchain-node pubkey --key validator-node1.pem)
  N2=$(auditchain-node pubkey --key validator-node2.pem)
  N3=$(auditchain-node pubkey --key validator-node3.pem)
  INST=$(auditchain-node pubkey --key institution.pem)
  printf '{"node1":"%s","node2":"%s","node3":"%s","institution":"%s"}\n' "$N1" "$N2" "$N3" "$INST" > validators.json
  echo "wrote validators.json"
fi
```

- [ ] **Step 4: docker-compose.yml**

`deploy/docker-compose.yml`:

```yaml
services:
  init:
    image: auditchain-node:local
    build:
      context: ..
      dockerfile: node/Dockerfile
    entrypoint: ["/bin/sh", "/init/init.sh"]
    volumes:
      - ./init.sh:/init/init.sh:ro
      - config:/config

  node1:
    image: auditchain-node:local
    build:
      context: ..
      dockerfile: node/Dockerfile
    command: serve
    environment:
      AUDITCHAIN_NODE_ID: node1
      AUDITCHAIN_LISTEN_ADDR: 0.0.0.0:7000
      AUDITCHAIN_PEERS: http://node2:7000,http://node3:7000
      AUDITCHAIN_VALIDATOR_KEY_PATH: /config/validator-node1.pem
      AUDITCHAIN_DB_PATH: /data/n1.db
      AUDITCHAIN_VALIDATORS_PATH: /config/validators.json
    volumes:
      - config:/config
      - node1data:/data
    ports:
      - "7001:7000"
    depends_on:
      - init

  node2:
    image: auditchain-node:local
    build:
      context: ..
      dockerfile: node/Dockerfile
    command: serve
    environment:
      AUDITCHAIN_NODE_ID: node2
      AUDITCHAIN_LISTEN_ADDR: 0.0.0.0:7000
      AUDITCHAIN_PEERS: http://node1:7000,http://node3:7000
      AUDITCHAIN_VALIDATOR_KEY_PATH: /config/validator-node2.pem
      AUDITCHAIN_DB_PATH: /data/n2.db
      AUDITCHAIN_VALIDATORS_PATH: /config/validators.json
    volumes:
      - config:/config
      - node2data:/data
    ports:
      - "7002:7000"
    depends_on:
      - init

  node3:
    image: auditchain-node:local
    build:
      context: ..
      dockerfile: node/Dockerfile
    command: serve
    environment:
      AUDITCHAIN_NODE_ID: node3
      AUDITCHAIN_LISTEN_ADDR: 0.0.0.0:7000
      AUDITCHAIN_PEERS: http://node1:7000,http://node2:7000
      AUDITCHAIN_VALIDATOR_KEY_PATH: /config/validator-node3.pem
      AUDITCHAIN_DB_PATH: /data/n3.db
      AUDITCHAIN_VALIDATORS_PATH: /config/validators.json
    volumes:
      - config:/config
      - node3data:/data
    ports:
      - "7003:7000"
    depends_on:
      - init

  seed:
    image: auditchain-node:local
    build:
      context: ..
      dockerfile: node/Dockerfile
    command: seed --api http://node1:7000 --peers http://node2:7000,http://node3:7000 --institution-key /config/institution.pem --evidence-dir /data/evidence
    volumes:
      - config:/config
      - evidence:/data/evidence
    depends_on:
      - node1
      - node2
      - node3
    restart: "no"

  console:
    image: auditchain-console:local
    build:
      context: ..
      dockerfile: console/Dockerfile
    environment:
      AUDITCHAIN_NODES: http://node1:7000,http://node2:7000,http://node3:7000
      INSTITUTION_KEY_PATH: /config/institution.pem
      EVIDENCE_STORE_PATH: /data/evidence
      CONSOLE_DB_PATH: /data/console.db
    volumes:
      - config:/config:ro
      - evidence:/data/evidence
      - consoledata:/data
    ports:
      - "3000:3000"
    depends_on:
      - seed

volumes:
  config:
  node1data:
  node2data:
  node3data:
  evidence:
  consoledata:
```

- [ ] **Step 5: DEMO.md — the presenter script**

`DEMO.md`:

```markdown
# AuditChain demo script

## Start

    cd deploy
    docker compose up --build

Wait for the seed service to exit (it prints `seed complete`). Open
http://localhost:3000 — the Auditor page shows the seeded lifecycle with one
anomaly: payment PAY-2026-0123 (14 Mar) committed before contract
CON-2026-0455 (16 Mar). The chain itself is cryptographically intact — a
process violation, not tampering.

## Beat 1 — commit as you watch (Procurement view)

1. Open the Procurement tab. Note the ledger head (8: genesis + 7 seeded events).
2. Commit a new event — e.g. type `payment_made`, ref `PAY-2026-0124`, today's
   date, attach any file. The receipt shows the block height, hash, and the
   evidence SHA-256. The evidence file never left the console.

## Beat 2 — verify evidence (Auditor view)

1. Open the Auditor tab, expand the event you just committed.
2. "Re-hash stored originals" → VERIFIED.
3. Upload any *different* file → MISMATCH. The ledger refuses to vouch for it.

## Beat 3 — tamper with one node

From the repo root:

    docker compose -f deploy/docker-compose.yml exec node2 tamper-demo \
      --db /data/n2.db --ref PAY-2026-0123 --amount 999999999

Back in the Auditor view, run "Verify this node" for node 2 → integrity FAILS
on the tampered block, with the reason. Nodes 1 and 3 stay clean — their
replicated copies are the safety net. The auditor never has to trust the
node that was edited.

## Reset

    docker compose -f deploy/docker-compose.yml down -v

## Direct node access (no console)

    curl http://localhost:7001/chain | head -c 400
    curl http://localhost:7002/integrity
```

- [ ] **Step 6: Full-stack verification (manual)**

```bash
cd deploy && docker compose up --build -d
docker compose logs seed        # expect "seed complete", "all_integrity_ok=true"
curl -s http://localhost:7002/integrity   # expect "ok":true,"head_height":8
```

Open http://localhost:3000: Procurement table shows 7 seeded events; Auditor shows the R1 anomaly; integrity check passes on all 3 nodes. Then run Beat 3 and confirm node 2 fails while 1 and 3 pass. Finish with `docker compose down -v`.

Expected results at each step are stated in DEMO.md; any deviation is a bug to fix before committing.

- [ ] **Step 7: Commit**

```bash
git add node/Dockerfile console/Dockerfile deploy DEMO.md
git commit -m "feat: docker-compose deployment and demo script"
```

---

## Spec coverage note

Spec sections → tasks: node design (node plan Tasks 1–8), console Procurement view (Task 6), Auditor view + verification + cross-node comparison (Tasks 5, 7), anomaly rules (Task 3), seed data (node plan Task 7 + compose `seed` service here), tamper detection (node plan Tasks 6, 8 + Beat 3), error handling (node client `SubmitResult` + UI error surfaces, Tasks 4–6), testing (per-task TDD + full-stack verification here).
