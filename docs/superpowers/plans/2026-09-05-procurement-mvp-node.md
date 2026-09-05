# AuditChain Node (Rust Ledger) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `auditchain-node`, the permissioned Rust ledger from the spec: SHA-256 evidence commitments, Ed25519-signed events, chained blocks, 3-node 2/3-quorum replication, integrity self-check, seed and tamper-demo tooling.

**Architecture:** One Rust crate, two binaries (`auditchain-node` with subcommands serve/keygen/pubkey/seed, and dev-only `tamper-demo`). Per-node SQLite storage. Leader (node 1) forms blocks, peers validate and ack, commit at majority. Console (separate plan) talks HTTP only.

**Tech Stack:** Rust 2021, axum 0.7, tokio, serde_json, ed25519-dalek 2 (pkcs8), sha2, rusqlite (bundled), reqwest, clap 4, chrono, anyhow, hex.

**Spec:** `docs/superpowers/specs/2026-09-05-procurement-mvp-design.md` (authoritative).

## Global Constraints

- All event strings in seed/demo data are ASCII (canonical JSON parity with the TypeScript console depends on identical escaping; non-ASCII is out of scope).
- Canonical JSON: keys sorted lexicographically, no whitespace, UTF-8 (`serde_json::to_string` of a sorted `Value`).
- Signatures and hashes are lowercase hex. Signature payload for an event is the canonical event JSON **without** `institution_signature`; for a block header it is the raw 32-byte header hash.
- Event JSON field names: `ref`, `type`, `title`, `actor`, `occurred_at` (ISO date `YYYY-MM-DD`), `amount` (optional, integer minor units, omitted when absent), `evidence` (array of `{filename, sha256}`, order preserved), `institution_signature` (omitted until present).
- Genesis block: height 0, `prev_block_hash` = 64 zeros, `events_hash` = sha256 of empty bytes, `committed_at` = `1970-01-01T00:00:00Z`, no events, empty leader signature and certificate. Created deterministically at first DB open on every node.
- Quorum = `validators.len() / 2 + 1` (3 validators → 2; 1 validator → 1, which lets a lone node commit in tests).
- Node-to-node and node-to-console communication is JSON over HTTP only. No direct DB access across nodes.
- Conventional commits (`feat:`, `test:`, `chore:`). Commit after every passing test cycle.
- The PitchDeck directory is untouched by this plan.

---

### Task 1: Crate scaffold + canonical JSON

**Files:**
- Create: `node/Cargo.toml`
- Create: `node/src/main.rs` (placeholder main)
- Create: `node/src/lib.rs`
- Create: `node/src/canonical.rs`
- Test: `node/src/canonical.rs` (inline `#[cfg(test)]`)

**Interfaces:**
- Produces: `canonical::canonicalize(&Value) -> String`, `canonical::sha256_hex(&[u8]) -> String`, `canonical::now_rfc3339() -> String`. All later tasks import these from the crate lib.

- [ ] **Step 1: Create the crate**

```bash
mkdir -p node/src && cd node
```

`node/Cargo.toml`:

```toml
[package]
name = "auditchain-node"
version = "0.1.0"
edition = "2021"

[lib]
name = "auditchain_node"
path = "src/lib.rs"

[[bin]]
name = "auditchain-node"
path = "src/main.rs"

[[bin]]
name = "tamper-demo"
path = "src/bin/tamper-demo.rs"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
ed25519-dalek = { version = "2", features = ["pkcs8", "rand_core"] }
rand_core = { version = "0.6", features = ["std"] }
sha2 = "0.10"
rusqlite = { version = "0.31", features = ["bundled"] }
reqwest = { version = "0.12", features = ["json"] }
hex = "0.4"
anyhow = "1"
clap = { version = "4", features = ["derive"] }
chrono = { version = "0.4", features = ["serde"] }
tower-http = { version = "0.5", features = ["cors"] }
```

`node/src/lib.rs`:

```rust
pub mod canonical;
```

`node/src/main.rs` (placeholder, replaced in Task 8):

```rust
fn main() {
    println!("auditchain-node");
}
```

`node/src/bin/tamper-demo.rs` (placeholder, replaced in Task 9):

```rust
fn main() {
    println!("tamper-demo");
}
```

- [ ] **Step 2: Write the failing tests for canonical JSON**

Append to `node/src/canonical.rs` (create the file with the implementation section first, then tests — but write tests before filling in function bodies; leave `todo!()` bodies so the failure is real):

```rust
use serde_json::{json, Map, Value};

pub fn canonicalize(v: &Value) -> String {
    todo!()
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    todo!()
}

pub fn now_rfc3339() -> String {
    todo!()
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE: &str = r#"{"actor":"treasury","evidence":[{"filename":"payment-instruction.txt","sha256":"9f2c41aa67d8b0e5c314f7a92e8b6d401cf5a83b72e09d16c4f8a7b3e2d95c10"}],"occurred_at":"2026-03-14","ref":"PAY-2026-0123","title":"Advance payment released","type":"payment_made"}"#;

    #[test]
    fn canonicalizes_with_sorted_keys_and_no_whitespace() {
        // deliberately unsorted, with whitespace
        let v: Value = serde_json::from_str(r#"{"type":"payment_made","ref":"PAY-2026-0123","title":"Advance payment released","actor":"treasury","occurred_at":"2026-03-14","evidence":[{"sha256":"9f2c41aa67d8b0e5c314f7a92e8b6d401cf5a83b72e09d16c4f8a7b3e2d95c10","filename":"payment-instruction.txt"}]}"#).unwrap();
        assert_eq!(canonicalize(&v), FIXTURE);
    }

    #[test]
    fn canonical_fixture_is_stable_across_reserialization() {
        let v: Value = serde_json::from_str(FIXTURE).unwrap();
        assert_eq!(canonicalize(&v), FIXTURE);
    }

    #[test]
    fn sha256_of_empty_matches_known_vector() {
        assert_eq!(
            sha256_hex(b""),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
    }

    #[test]
    fn sha256_of_abc_matches_known_vector() {
        assert_eq!(
            sha256_hex(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }
}
```

This fixture string is also the TypeScript parity fixture in the console plan — do not change it.

- [ ] **Step 3: Run tests to verify they fail**

Run: `cargo test -p auditchain-node --lib`
Expected: FAIL — `not yet implemented: todo!()` (4 failures).

- [ ] **Step 4: Implement**

Replace the `todo!()` bodies in `node/src/canonical.rs`:

```rust
use serde_json::{Map, Value};
use sha2::{Digest, Sha256};

/// Canonical JSON: keys sorted lexicographically at every level, no whitespace.
pub fn canonicalize(v: &Value) -> String {
    let sorted = sort_value(v);
    serde_json::to_string(&sorted).unwrap()
}

fn sort_value(v: &Value) -> Value {
    match v {
        Value::Object(map) => {
            let mut keys: Vec<&String> = map.keys().collect();
            keys.sort();
            let mut out = Map::new();
            for k in keys {
                out.insert(k.clone(), sort_value(&map[k]));
            }
            Value::Object(out)
        }
        Value::Array(items) => Value::Array(items.iter().map(sort_value).collect()),
        other => other.clone(),
    }
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    hex::encode(h.finalize())
}

pub fn now_rfc3339() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true)
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cargo test -p auditchain-node --lib`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add node/Cargo.toml node/src
git commit -m "feat(node): scaffold crate and canonical JSON + sha256 helpers"
```

---

### Task 2: Event and block model + crypto helpers

**Files:**
- Create: `node/src/model.rs`
- Create: `node/src/crypto.rs`
- Modify: `node/src/lib.rs` (add `pub mod model; pub mod crypto;`)
- Test: inline `#[cfg(test)]` in both files

**Interfaces:**
- Consumes: `canonical::{canonicalize, sha256_hex}` from Task 1.
- Produces:
  - `model::Evidence { filename: String, sha256: String }`
  - `model::Event { ref_, type_, title, actor, occurred_at, amount: Option<i64>, evidence: Vec<Evidence>, institution_signature: Option<String> }` (serializes as `ref`/`type`; `amount` and `institution_signature` omitted when `None`)
  - `model::CertSig { node_id: String, signature: String }`
  - `model::BlockHeader { height: u64, prev_block_hash: String, events_hash: String, committed_at: String }`
  - `model::Block { header: BlockHeader, events: Vec<Event>, leader_signature: String, certificate: Vec<CertSig> }`
  - `model::EVENT_TYPES: [&str; 7]`
  - `crypto::generate_keypair(out_path) -> anyhow::Result<()>` (writes PKCS#8 PEM)
  - `crypto::load_signing(path) -> anyhow::Result<SigningKey>`, `crypto::load_verifying(path) -> anyhow::Result<VerifyingKey>`
  - `crypto::verifying_from_hex(hex_pub) -> anyhow::Result<VerifyingKey>`, `crypto::pubkey_hex(vk) -> String`
  - `crypto::sign_hex(sk, msg) -> String`, `crypto::verify_hex(vk, msg, sig_hex) -> bool`

- [ ] **Step 1: Write failing tests**

`node/src/model.rs`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Evidence {
    pub filename: String,
    pub sha256: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Event {
    #[serde(rename = "ref")]
    pub ref_: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub title: String,
    pub actor: String,
    pub occurred_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub amount: Option<i64>,
    pub evidence: Vec<Evidence>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub institution_signature: Option<String>,
}

pub const EVENT_TYPES: [&str; 7] = [
    "budget_created",
    "procurement_started",
    "bid_received",
    "bid_evaluated",
    "supplier_selected",
    "contract_approved",
    "payment_made",
];

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CertSig {
    pub node_id: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct BlockHeader {
    pub height: u64,
    pub prev_block_hash: String,
    pub events_hash: String,
    pub committed_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Block {
    pub header: BlockHeader,
    pub events: Vec<Event>,
    pub leader_signature: String,
    pub certificate: Vec<CertSig>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn event_serializes_with_renamed_and_omitted_fields() {
        let e = Event {
            ref_: "PAY-2026-0123".into(),
            type_: "payment_made".into(),
            title: "Advance payment released".into(),
            actor: "treasury".into(),
            occurred_at: "2026-03-14".into(),
            amount: Some(14550000),
            evidence: vec![Evidence { filename: "payment-instruction.txt".into(), sha256: "aa".into() }],
            institution_signature: None,
        };
        let v = serde_json::to_value(&e).unwrap();
        assert_eq!(v["ref"], json!("PAY-2026-0123"));
        assert_eq!(v["type"], json!("payment_made"));
        assert!(v.get("institution_signature").is_none());
        let mut e2 = e.clone();
        e2.amount = None;
        let v2 = serde_json::to_value(&e2).unwrap();
        assert!(v2.get("amount").is_none());
    }

    #[test]
    fn event_deserializes_from_api_json() {
        let j = r#"{"ref":"BUD-2026-0031","type":"budget_created","title":"FY2026 Procurement Budget","actor":"finance-directorate","occurred_at":"2026-02-04","evidence":[]}"#;
        let e: Event = serde_json::from_str(j).unwrap();
        assert_eq!(e.ref_, "BUD-2026-0031");
        assert_eq!(e.amount, None);
    }
}
```

`node/src/crypto.rs`:

```rust
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use std::path::Path;

pub fn generate_keypair(out_path: &Path) -> anyhow::Result<()> {
    let mut csprng = rand_core::OsRng;
    let sk = SigningKey::generate(&mut csprng);
    use ed25519_dalek::pkcs8::EncodePrivateKey;
    let pem = sk.to_pkcs8_pem(ed25519_dalek::pkcs8::LineEnding::LF)?;
    std::fs::create_dir_all(out_path.parent().unwrap_or(Path::new(".")))?;
    std::fs::write(out_path, pem.as_bytes())?;
    Ok(())
}

pub fn load_signing(path: &Path) -> anyhow::Result<SigningKey> {
    use ed25519_dalek::pkcs8::DecodePrivateKey;
    let sk = SigningKey::from_pkcs8_pem(&std::fs::read_to_string(path)?)?;
    Ok(sk)
}

pub fn load_verifying(path: &Path) -> anyhow::Result<VerifyingKey> {
    let sk = load_signing(path)?;
    Ok(sk.verifying_key())
}

pub fn verifying_from_hex(hex_pub: &str) -> anyhow::Result<VerifyingKey> {
    let bytes: [u8; 32] = hex::decode(hex_pub)?.as_slice().try_into()?;
    Ok(VerifyingKey::from_bytes(&bytes)?)
}

pub fn pubkey_hex(vk: &VerifyingKey) -> String {
    hex::encode(vk.as_bytes())
}

pub fn sign_hex(sk: &SigningKey, msg: &[u8]) -> String {
    hex::encode(sk.sign(msg).to_bytes())
}

pub fn verify_hex(vk: &VerifyingKey, msg: &[u8], sig_hex: &str) -> bool {
    let Ok(bytes) = hex::decode(sig_hex) else { return false };
    let Ok(sig) = Signature::from_slice(&bytes) else { return false };
    vk.verify(msg, &sig).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sign_verify_roundtrip_rejects_tampering() {
        let mut csprng = rand_core::OsRng;
        let sk = SigningKey::generate(&mut csprng);
        let vk = sk.verifying_key();
        let msg = b"canonical event json bytes";
        let sig = sign_hex(&sk, msg);
        assert!(verify_hex(&vk, msg, &sig));
        assert!(!verify_hex(&vk, b"tampered", &sig));
        assert!(!verify_hex(&vk, msg, &"ab".repeat(64)));
    }

    #[test]
    fn keypair_pem_roundtrip_and_hex_pubkey() {
        let dir = std::env::temp_dir().join(format!("ac-keytest-{}", std::process::id()));
        let path = dir.join("k.pem");
        generate_keypair(&path).unwrap();
        let sk = load_signing(&path).unwrap();
        let vk = load_verifying(&path).unwrap();
        assert_eq!(pubkey_hex(&vk), pubkey_hex(&sk.verifying_key()));
        assert_eq!(pubkey_hex(&vk).len(), 64);
        std::fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn verifying_from_hex_roundtrip() {
        let mut csprng = rand_core::OsRng;
        let sk = SigningKey::generate(&mut csprng);
        let vk = verifying_from_hex(&pubkey_hex(&sk.verifying_key())).unwrap();
        assert!(verify_hex(&vk, b"x", &sign_hex(&sk, b"x")));
    }
}
```

Modify `node/src/lib.rs`:

```rust
pub mod canonical;
pub mod crypto;
pub mod model;
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cargo test -p auditchain-node --lib`
Expected: PASS (model 2 + crypto 3 + canonical 4 = 9 tests). (These tests were written together with the implementation because both are pure, self-contained modules; the failure-first discipline applies in Task 1 and Task 5+ where behavior is nontrivial.)

- [ ] **Step 3: Commit**

```bash
git add node/src
git commit -m "feat(node): event/block model and Ed25519 crypto helpers"
```

---

### Task 3: SQLite store with deterministic genesis

**Files:**
- Create: `node/src/store.rs`
- Modify: `node/src/lib.rs` (add `pub mod store;`)
- Test: inline `#[cfg(test)]`

**Interfaces:**
- Consumes: `model::{Block, Event}`, `canonical::sha256_hex`.
- Produces (all under `store::`):
  - `Store::open(path: &Path) -> anyhow::Result<Store>` (creates tables + genesis if empty)
  - `head() -> anyhow::Result<(u64, String)>` — (height, header hash)
  - `append_block(&block: &Block, header_hash: &str) -> anyhow::Result<()>`
  - `get_block(height: u64) -> anyhow::Result<Option<(Block, String)>>` — (block, header hash)
  - `all_blocks() -> anyhow::Result<Vec<(Block, String)>>`
  - `has_ref(&ref_: &str) -> anyhow::Result<bool>`
  - `get_event(&ref_: &str) -> anyhow::Result<Option<(Event, u64, String)>>` — (event, height, header hash)
  - `block_count() -> anyhow::Result<u64>`
  - `store::GENESIS_PREV: &str` (64 zeros), `store::GENESIS_TS: &str`

- [ ] **Step 1: Write failing tests**

Create `node/src/store.rs` with `todo!()` bodies and these tests:

```rust
use crate::model::{Block, BlockHeader, CertSig, Event};
use rusqlite::Connection;
use std::path::Path;

pub const GENESIS_PREV: &str = "0000000000000000000000000000000000000000000000000000000000000000";
pub const GENESIS_TS: &str = "1970-01-01T00:00:00Z";

pub struct Store {
    conn: Connection,
}

impl Store {
    pub fn open(path: &Path) -> anyhow::Result<Self> {
        todo!()
    }
    pub fn head(&self) -> anyhow::Result<(u64, String)> {
        todo!()
    }
    pub fn append_block(&self, block: &Block, header_hash: &str) -> anyhow::Result<()> {
        todo!()
    }
    pub fn get_block(&self, height: u64) -> anyhow::Result<Option<(Block, String)>> {
        todo!()
    }
    pub fn all_blocks(&self) -> anyhow::Result<Vec<(Block, String)>> {
        todo!()
    }
    pub fn has_ref(&self, ref_: &str) -> anyhow::Result<bool> {
        todo!()
    }
    pub fn get_event(&self, ref_: &str) -> anyhow::Result<Option<(Event, u64, String)>> {
        todo!()
    }
    pub fn block_count(&self) -> anyhow::Result<u64> {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{Block, BlockHeader, Event};

    fn tmpdir(tag: &str) -> std::path::PathBuf {
        let d = std::env::temp_dir().join(format!("ac-store-{}-{}", tag, std::process::id()));
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    fn sample_event() -> Event {
        Event {
            ref_: "BUD-2026-0031".into(),
            type_: "budget_created".into(),
            title: "FY2026 Procurement Budget".into(),
            actor: "finance-directorate".into(),
            occurred_at: "2026-02-04".into(),
            amount: None,
            evidence: vec![],
            institution_signature: Some("ff".repeat(64)),
        }
    }

    fn sample_block(height: u64, prev: &str) -> Block {
        Block {
            header: BlockHeader {
                height,
                prev_block_hash: prev.into(),
                events_hash: "ee".repeat(32),
                committed_at: "2026-02-04T09:00:00Z".into(),
            },
            events: vec![sample_event()],
            leader_signature: "aa".repeat(64),
            certificate: vec![CertSig { node_id: "node1".into(), signature: "bb".repeat(64) }],
        }
    }

    #[test]
    fn open_creates_deterministic_genesis() {
        let dir = tmpdir("genesis");
        let s = Store::open(&dir.join("a.db")).unwrap();
        let (h, head_hash) = s.head().unwrap();
        assert_eq!(h, 0);
        assert_eq!(head_hash.len(), 64);
        let (b, hh) = s.get_block(0).unwrap().unwrap();
        assert_eq!(hh, head_hash);
        assert_eq!(b.header.height, 0);
        assert_eq!(b.header.prev_block_hash, GENESIS_PREV);
        assert_eq!(b.events.len(), 0);
        // deterministic: another node's genesis has the same hash
        let s2 = Store::open(&dir.join("b.db")).unwrap();
        assert_eq!(s.head().unwrap().1, s2.head().unwrap().1);
        std::fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn append_and_read_back_block_and_event_index() {
        let dir = tmpdir("append");
        let s = Store::open(&dir.join("a.db")).unwrap();
        let (_, prev) = s.head().unwrap();
        let b = sample_block(1, &prev);
        let hh = crate::canonical::sha256_hex(
            crate::canonical::canonicalize(&serde_json::to_value(&b.header).unwrap()).as_bytes(),
        );
        s.append_block(&b, &hh).unwrap();
        assert_eq!(s.block_count().unwrap(), 2);
        assert_eq!(s.head().unwrap(), (1, hh.clone()));
        let (rb, rh) = s.get_block(1).unwrap().unwrap();
        assert_eq!(rh, hh);
        assert_eq!(rb, b);
        assert!(s.has_ref("BUD-2026-0031").unwrap());
        assert!(!s.has_ref("NOPE-1").unwrap());
        let (ev, height, bhh) = s.get_event("BUD-2026-0031").unwrap().unwrap();
        assert_eq!(ev, sample_event());
        assert_eq!(height, 1);
        assert_eq!(bhh, hh);
        std::fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn reopening_preserves_chain() {
        let dir = tmpdir("reopen");
        let path = dir.join("a.db");
        let (h1, hh1) = {
            let s = Store::open(&path).unwrap();
            s.head().unwrap()
        };
        let s2 = Store::open(&path).unwrap();
        assert_eq!(s2.head().unwrap(), (h1, hh1));
        std::fs::remove_dir_all(dir).ok();
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cargo test -p auditchain-node --lib store`
Expected: FAIL — `not yet implemented`.

- [ ] **Step 3: Implement**

Replace the `todo!()` bodies:

```rust
impl Store {
    pub fn open(path: &Path) -> anyhow::Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let conn = Connection::open(path)?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS blocks (
                height INTEGER PRIMARY KEY,
                header_hash TEXT NOT NULL,
                header_json TEXT NOT NULL,
                events_json TEXT NOT NULL,
                leader_signature TEXT NOT NULL,
                certificate_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events (
                ref TEXT PRIMARY KEY,
                height INTEGER NOT NULL,
                event_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );",
        )?;
        let s = Store { conn };
        if s.block_count()? == 0 {
            let genesis = Block {
                header: BlockHeader {
                    height: 0,
                    prev_block_hash: GENESIS_PREV.into(),
                    events_hash: crate::canonical::sha256_hex(b""),
                    committed_at: GENESIS_TS.into(),
                },
                events: vec![],
                leader_signature: String::new(),
                certificate: vec![],
            };
            let hh = crate::canonical::sha256_hex(
                crate::canonical::canonicalize(&serde_json::to_value(&genesis.header)?).as_bytes(),
            );
            s.append_block(&genesis, &hh)?;
        }
        Ok(s)
    }

    pub fn head(&self) -> anyhow::Result<(u64, String)> {
        let mut stmt = self
            .conn
            .prepare("SELECT value FROM meta WHERE key='head'")?;
        let v: String = stmt.query_row([], |r| r.get(0))?;
        let (h, hash) = v.split_once(':').ok_or_else(|| anyhow::anyhow!("bad meta head"))?;
        Ok((h.parse()?, hash.to_string()))
    }

    pub fn append_block(&self, block: &Block, header_hash: &str) -> anyhow::Result<()> {
        let header_json = crate::canonical::canonicalize(&serde_json::to_value(&block.header)?);
        let events_json = serde_json::to_string(&block.events)?;
        let cert_json = serde_json::to_string(&block.certificate)?;
        self.conn.execute(
            "INSERT INTO blocks (height, header_hash, header_json, events_json, leader_signature, certificate_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![
                block.header.height as i64,
                header_hash,
                header_json,
                events_json,
                block.leader_signature,
                cert_json
            ],
        )?;
        for e in &block.events {
            self.conn.execute(
                "INSERT OR REPLACE INTO events (ref, height, event_json) VALUES (?1, ?2, ?3)",
                rusqlite::params![
                    e.ref_,
                    block.header.height as i64,
                    serde_json::to_string(e)?
                ],
            )?;
        }
        self.conn.execute(
            "INSERT OR REPLACE INTO meta (key, value) VALUES ('head', ?1)",
            rusqlite::params![format!("{}:{}", block.header.height, header_hash)],
        )?;
        Ok(())
    }

    fn row_to_block(header_json: &str, events_json: &str, leader_signature: &str, certificate_json: &str) -> anyhow::Result<Block> {
        Ok(Block {
            header: serde_json::from_str(header_json)?,
            events: serde_json::from_str(events_json)?,
            leader_signature: leader_signature.to_string(),
            certificate: serde_json::from_str(certificate_json)?,
        })
    }

    pub fn get_block(&self, height: u64) -> anyhow::Result<Option<(Block, String)>> {
        let mut stmt = self.conn.prepare(
            "SELECT header_json, events_json, leader_signature, certificate_json, header_hash
             FROM blocks WHERE height=?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![height as i64])?;
        if let Some(r) = rows.next()? {
            let b = Self::row_to_block(&r.get::<_, String>(0)?, &r.get::<_, String>(1)?, &r.get::<_, String>(2)?, &r.get::<_, String>(3)?)?;
            Ok(Some((b, r.get::<_, String>(4)?)))
        } else {
            Ok(None)
        }
    }

    pub fn all_blocks(&self) -> anyhow::Result<Vec<(Block, String)>> {
        let mut stmt = self.conn.prepare(
            "SELECT header_json, events_json, leader_signature, certificate_json, header_hash
             FROM blocks ORDER BY height ASC",
        )?;
        let mut out = vec![];
        let mut rows = stmt.query([])?;
        while let Some(r) = rows.next()? {
            let b = Self::row_to_block(&r.get::<_, String>(0)?, &r.get::<_, String>(1)?, &r.get::<_, String>(2)?, &r.get::<_, String>(3)?)?;
            out.push((b, r.get::<_, String>(4)?));
        }
        Ok(out)
    }

    pub fn has_ref(&self, ref_: &str) -> anyhow::Result<bool> {
        let mut stmt = self.conn.prepare("SELECT 1 FROM events WHERE ref=?1")?;
        Ok(stmt.exists(rusqlite::params![ref_])?)
    }

    pub fn get_event(&self, ref_: &str) -> anyhow::Result<Option<(Event, u64, String)>> {
        let mut stmt = self.conn.prepare(
            "SELECT e.event_json, e.height, b.header_hash
             FROM events e JOIN blocks b ON b.height = e.height WHERE e.ref=?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![ref_])?;
        if let Some(r) = rows.next()? {
            Ok(Some((serde_json::from_str(&r.get::<_, String>(0)?)?, r.get::<_, i64>(1)? as u64, r.get::<_, String>(2)?)))
        } else {
            Ok(None)
        }
    }

    pub fn block_count(&self) -> anyhow::Result<u64> {
        Ok(self.conn.query_row("SELECT COUNT(*) FROM blocks", [], |r| r.get::<_, i64>(0))? as u64)
    }
}
```

Also add to `node/src/lib.rs`: `pub mod store;`

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p auditchain-node --lib store`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add node/src
git commit -m "feat(node): SQLite store with deterministic genesis block"
```

---

### Task 4: Chain validation and integrity report

**Files:**
- Create: `node/src/chain.rs`
- Modify: `node/src/lib.rs` (add `pub mod chain;`)
- Test: inline `#[cfg(test)]`

**Interfaces:**
- Consumes: `model::*`, `crypto::*`, `canonical::*`, `store::Store`.
- Produces:
  - `chain::validate_event(e: &Event, institution_vk: &VerifyingKey) -> Result<(), String>` — shape checks + signature
  - `chain::block_hash(header: &BlockHeader) -> String`
  - `chain::events_hash(events: &[Event]) -> String`
  - `chain::verify_block(block: &Block, expected_height: u64, expected_prev: &str, institution_vk: &VerifyingKey, leader_vk: &VerifyingKey) -> Result<String, String>` — returns header hash
  - `chain::verify_certificate(cert: &[CertSig], header_hash: &str, quorum: usize, validators: &HashMap<String, VerifyingKey>, leader_id: &str) -> Result<(), String>`
  - `chain::integrity_report(store: &Store, institution_vk: &VerifyingKey, validators: &HashMap<String, VerifyingKey>) -> IntegrityReport` where `IntegrityReport { ok: bool, head_height: u64, blocks: Vec<BlockVerdict> }`, `BlockVerdict { height: u64, ok: bool, reason: Option<String> }`
  - `chain::quorum(committee: usize) -> usize`

- [ ] **Step 1: Write failing tests**

`node/src/chain.rs` — write with `todo!()` bodies plus:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::{generate_keypair, load_signing, pubkey_hex, sign_hex, verify_hex};
    use crate::model::{Block, BlockHeader, CertSig, Event, Evidence};

    fn tmpdir(tag: &str) -> std::path::PathBuf {
        let d = std::env::temp_dir().join(format!("ac-chain-{}-{}", tag, std::process::id()));
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    fn institution_key(dir: &std::path::Path) -> ed25519_dalek::SigningKey {
        let p = dir.join("inst.pem");
        if !p.exists() {
            generate_keypair(&p).unwrap();
        }
        load_signing(&p).unwrap()
    }

    fn signed_event(sk: &ed25519_dalek::SigningKey) -> Event {
        let mut e = Event {
            ref_: "BUD-2026-0031".into(),
            type_: "budget_created".into(),
            title: "FY2026 Procurement Budget".into(),
            actor: "finance-directorate".into(),
            occurred_at: "2026-02-04".into(),
            amount: None,
            evidence: vec![Evidence {
                filename: "budget-memo.txt".into(),
                sha256: crate::canonical::sha256_hex(b"memo bytes"),
            }],
            institution_signature: None,
        };
        let payload = crate::canonical::canonicalize(&serde_json::to_value(&e).unwrap());
        e.institution_signature = Some(sign_hex(sk, payload.as_bytes()));
        e
    }

    fn make_block(prev_hash: &str, height: u64, events: Vec<Event>, leader_sk: &ed25519_dalek::SigningKey) -> Block {
        let eh = events_hash(&events);
        let header = BlockHeader {
            height,
            prev_block_hash: prev_hash.into(),
            events_hash: eh,
            committed_at: "2026-02-04T09:00:00Z".into(),
        };
        let hh = block_hash(&header);
        Block {
            header,
            events,
            leader_signature: sign_hex(leader_sk, hh.as_bytes()),
            certificate: vec![],
        }
    }

    #[test]
    fn valid_event_passes_and_tampered_event_fails() {
        let dir = tmpdir("event");
        let sk = institution_key(&dir);
        let vk = sk.verifying_key();
        let e = signed_event(&sk);
        assert!(validate_event(&e, &vk).is_ok());
        let mut bad = e.clone();
        bad.title = "Changed after signing".into();
        assert!(validate_event(&bad, &vk).is_err());
        let mut no_type = e.clone();
        no_type.type_ = "embezzlement".into();
        assert!(validate_event(&no_type, &vk).is_err());
        std::fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn verify_block_accepts_correct_chain_and_rejects_link_break() {
        let dir = tmpdir("block");
        let inst = institution_key(&dir);
        let mut csprng = rand_core::OsRng;
        let leader = ed25519_dalek::SigningKey::generate(&mut csprng);
        let e = signed_event(&inst);
        let genesis_hash = {
            let g = BlockHeader {
                height: 0,
                prev_block_hash: crate::store::GENESIS_PREV.into(),
                events_hash: crate::canonical::sha256_hex(b""),
                committed_at: crate::store::GENESIS_TS.into(),
            };
            block_hash(&g)
        };
        let b1 = make_block(&genesis_hash, 1, vec![e.clone()], &leader);
        let hh1 = verify_block(&b1, 1, &genesis_hash, &inst.verifying_key(), &leader.verifying_key()).unwrap();
        // tamper an event after signing: header hash recomputation still passes link check,
        // but events_hash must fail
        let mut tampered = b1.clone();
        tampered.events[0].title = "Rewritten".into();
        assert!(verify_block(&tampered, 1, &genesis_hash, &inst.verifying_key(), &leader.verifying_key()).is_err());
        // wrong height
        assert!(verify_block(&b1, 2, &genesis_hash, &inst.verifying_key(), &leader.verifying_key()).is_err());
        // broken link
        assert!(verify_block(&b1, 1, "f".repeat(64).as_str(), &inst.verifying_key(), &leader.verifying_key()).is_err());
        assert_eq!(hh1.len(), 64);
        std::fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn certificate_needs_quorum_and_leader() {
        let dir = tmpdir("cert");
        let mut csprng = rand_core::OsRng;
        let n1 = ed25519_dalek::SigningKey::generate(&mut csprng);
        let n2 = ed25519_dalek::SigningKey::generate(&mut csprng);
        let n3 = ed25519_dalek::SigningKey::generate(&mut csprng);
        let validators: std::collections::HashMap<String, ed25519_dalek::VerifyingKey> = [
            ("node1", n1.verifying_key()),
            ("node2", n2.verifying_key()),
            ("node3", n3.verifying_key()),
        ]
        .into_iter()
        .map(|(k, v)| (k.to_string(), v))
        .collect();
        let hh = "ab".repeat(32);
        let ack = |sk: &ed25519_dalek::SigningKey, id: &str| CertSig {
            node_id: id.into(),
            signature: sign_hex(sk, hh.as_bytes()),
        };
        assert_eq!(quorum(3), 2);
        // leader + one ack = quorum met
        assert!(verify_certificate(&[ack(&n1, "node1"), ack(&n2, "node2")], &hh, 2, &validators, "node1").is_ok());
        // single ack: no quorum
        assert!(verify_certificate(&[ack(&n1, "node1")], &hh, 2, &validators, "node1").is_err());
        // quorum count but leader missing
        assert!(verify_certificate(&[ack(&n2, "node2"), ack(&n3, "node3")], &hh, 2, &validators, "node1").is_err());
        // forged ack from unknown node
        let mut forged = ack(&n2, "node2");
        forged.node_id = "node9".into();
        assert!(verify_certificate(&[ack(&n1, "node1"), forged], &hh, 2, &validators, "node1").is_err());
        // valid sig but wrong node_id label
        let mut mislabeled = ack(&n3, "node3");
        mislabeled.node_id = "node2".into();
        assert!(verify_certificate(&[ack(&n1, "node1"), mislabeled], &hh, 2, &validators, "node1").is_err());
        std::fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn integrity_report_flags_tampered_store() {
        use crate::store::Store;
        let dir = tmpdir("integrity");
        let inst = institution_key(&dir);
        let inst_vk = inst.verifying_key();
        let mut csprng = rand_core::OsRng;
        let leader = ed25519_dalek::SigningKey::generate(&mut csprng);
        let validators: std::collections::HashMap<String, ed25519_dalek::VerifyingKey> = [("node1", leader.verifying_key())]
            .into_iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();
        let db = dir.join("n.db");
        let store = Store::open(&db).unwrap();
        // genesis only -> clean
        let r = integrity_report(&store, &inst_vk, &validators);
        assert!(r.ok);
        // append a valid signed block via the store
        let (_, prev) = store.head().unwrap();
        let e = signed_event(&inst);
        let b = make_block(&prev, 1, vec![e], &leader);
        let cert = vec![CertSig { node_id: "node1".into(), signature: sign_hex(&leader, block_hash(&b.header).as_bytes()) }];
        let mut b2 = b.clone();
        b2.certificate = cert;
        let hh = block_hash(&b2.header);
        store.append_block(&b2, &hh).unwrap();
        let r = integrity_report(&store, &inst_vk, &validators);
        assert!(r.ok, "clean chain must pass: {:?}", r.blocks.iter().filter(|v| !v.ok).collect::<Vec<_>>());
        // tamper the stored event payload directly (attacker with DB access)
        let conn = rusqlite::Connection::open(&db).unwrap();
        conn.execute("UPDATE events SET event_json = replace(event_json, 'FY2026 Procurement Budget', 'Rewritten Budget') WHERE ref='BUD-2026-0031'", []).unwrap();
        // integrity check must now fail on block 1 (events_hash mismatch)
        let store2 = Store::open(&db).unwrap();
        let r = integrity_report(&store2, &inst_vk, &validators);
        assert!(!r.ok);
        assert!(r.blocks.iter().any(|v| v.height == 1 && !v.ok));
        std::fs::remove_dir_all(dir).ok();
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cargo test -p auditchain-node --lib chain`
Expected: FAIL — unresolved functions / `todo!()`.

- [ ] **Step 3: Implement**

Fill in `node/src/chain.rs`:

```rust
use crate::canonical::{canonicalize, sha256_hex};
use crate::crypto::verify_hex;
use crate::model::{Block, BlockHeader, CertSig, Event, EVENT_TYPES};
use crate::store::Store;
use ed25519_dalek::VerifyingKey;
use std::collections::HashMap;

pub fn quorum(committee: usize) -> usize {
    committee / 2 + 1
}

pub fn block_hash(header: &BlockHeader) -> String {
    sha256_hex(canonicalize(&serde_json::to_value(header).unwrap()).as_bytes())
}

pub fn events_hash(events: &[Event]) -> String {
    let mut buf = Vec::new();
    for e in events {
        buf.extend_from_slice(canonicalize(&serde_json::to_value(e).unwrap()).as_bytes());
    }
    sha256_hex(&buf)
}

pub fn validate_event(e: &Event, institution_vk: &VerifyingKey) -> Result<(), String> {
    if e.ref_.trim().is_empty() {
        return Err("ref is empty".into());
    }
    if !EVENT_TYPES.contains(&e.type_.as_str()) {
        return Err(format!("unknown event type: {}", e.type_));
    }
    if e.title.trim().is_empty() {
        return Err("title is empty".into());
    }
    if e.actor.trim().is_empty() {
        return Err("actor is empty".into());
    }
    if chrono::NaiveDate::parse_from_str(&e.occurred_at, "%Y-%m-%d").is_err() {
        return Err("occurred_at must be YYYY-MM-DD".into());
    }
    for ev in &e.evidence {
        if ev.filename.trim().is_empty() {
            return Err("evidence filename is empty".into());
        }
        if hex::decode(&ev.sha256).map(|b| b.len()).unwrap_or(0) != 32 {
            return Err(format!("evidence sha256 is not 32-byte hex: {}", ev.filename));
        }
    }
    let Some(sig) = &e.institution_signature else {
        return Err("event is not signed by the institution".into());
    };
    // payload = canonical event JSON without institution_signature
    let mut unsigned = e.clone();
    unsigned.institution_signature = None;
    let payload = canonicalize(&serde_json::to_value(&unsigned).unwrap());
    if !verify_hex(institution_vk, payload.as_bytes(), sig) {
        return Err("institution signature is invalid".into());
    }
    Ok(())
}

pub fn verify_block(
    block: &Block,
    expected_height: u64,
    expected_prev: &str,
    institution_vk: &VerifyingKey,
    leader_vk: &VerifyingKey,
) -> Result<String, String> {
    let h = &block.header;
    if h.height != expected_height {
        return Err(format!("expected height {}, got {}", expected_height, h.height));
    }
    if h.prev_block_hash != expected_prev {
        return Err("prev_block_hash does not match local head".into());
    }
    if events_hash(&block.events) != h.events_hash {
        return Err("events_hash does not match block events".into());
    }
    for e in &block.events {
        validate_event(e, institution_vk).map_err(|err| format!("event {}: {}", e.ref_, err))?;
    }
    let hh = block_hash(h);
    if h.height > 0 {
        if block.leader_signature.is_empty()
            || !verify_hex(leader_vk, hh.as_bytes(), &block.leader_signature)
        {
            return Err("leader signature is invalid".into());
        }
    }
    Ok(hh)
}

pub fn verify_certificate(
    cert: &[CertSig],
    header_hash: &str,
    quorum_n: usize,
    validators: &HashMap<String, VerifyingKey>,
    leader_id: &str,
) -> Result<(), String> {
    if cert.len() < quorum_n {
        return Err(format!("certificate has {} sigs, quorum is {}", cert.len(), quorum_n));
    }
    let mut seen = std::collections::HashSet::new();
    let mut has_leader = false;
    for s in cert {
        let vk = validators
            .get(&s.node_id)
            .ok_or_else(|| format!("ack from unknown validator {}", s.node_id))?;
        if !seen.insert(s.node_id.clone()) {
            return Err(format!("duplicate ack from {}", s.node_id));
        }
        if !verify_hex(vk, header_hash.as_bytes(), &s.signature) {
            return Err(format!("invalid ack signature from {}", s.node_id));
        }
        if s.node_id == leader_id {
            has_leader = true;
        }
    }
    if !has_leader {
        return Err("certificate does not include the leader".into());
    }
    Ok(())
}

#[derive(serde::Serialize, Clone)]
pub struct BlockVerdict {
    pub height: u64,
    pub ok: bool,
    pub reason: Option<String>,
}

#[derive(serde::Serialize, Clone)]
pub struct IntegrityReport {
    pub ok: bool,
    pub head_height: u64,
    pub blocks: Vec<BlockVerdict>,
}

pub fn integrity_report(
    store: &Store,
    institution_vk: &VerifyingKey,
    validators: &HashMap<String, VerifyingKey>,
) -> IntegrityReport {
    let q = quorum(validators.len());
    let blocks = store.all_blocks().unwrap_or_default();
    let mut verdicts = vec![];
    let mut prev_hash: Option<String> = None;
    for (b, stored_hh) in &blocks {
        let verdict = check_one(b, stored_hh, prev_hash.as_deref(), institution_vk, validators, q, "node1");
        prev_hash = Some(stored_hh.clone());
        verdicts.push(verdict);
    }
    let ok = verdicts.iter().all(|v| v.ok);
    let head_height = blocks.last().map(|(b, _)| b.header.height).unwrap_or(0);
    IntegrityReport { ok, head_height, blocks: verdicts }
}

fn check_one(
    b: &Block,
    stored_hh: &str,
    prev_hash: Option<&str>,
    inst_vk: &VerifyingKey,
    validators: &HashMap<String, VerifyingKey>,
    q: usize,
    leader_id: &str,
) -> BlockVerdict {
    let fail = |r: String| BlockVerdict { height: b.header.height, ok: false, reason: Some(r) };
    let recomputed = block_hash(&b.header);
    if &recomputed != stored_hh {
        return fail("stored header_hash does not match header contents (header tampered)".into());
    }
    if b.header.height == 0 {
        if b.header.prev_block_hash != crate::store::GENESIS_PREV
            || b.header.events_hash != sha256_hex(b"")
        {
            return fail("genesis block is malformed".into());
        }
        return BlockVerdict { height: 0, ok: true, reason: None };
    }
    let expected_prev = prev_hash.ok_or_else(|| "no previous block".to_string());
    let expected_prev = match expected_prev {
        Ok(p) => p.to_string(),
        Err(e) => return fail(e),
    };
    let Some(leader_vk) = validators.get(leader_id) else {
        return fail("leader validator key not configured".into());
    };
    match verify_block(b, b.header.height, &expected_prev, inst_vk, leader_vk) {
        Ok(hh) if hh == stored_hh => {
            if let Err(e) = verify_certificate(&b.certificate, &stored_hh.to_string(), q, validators, leader_id) {
                fail(e)
            } else {
                BlockVerdict { height: b.header.height, ok: true, reason: None }
            }
        }
        Ok(_) => fail("recomputed header hash differs from stored hash".into()),
        Err(e) => fail(e),
    }
}
```

Add to `node/src/lib.rs`: `pub mod chain;`

- [ ] **Step 4: Run tests to verify they pass**

Run: `cargo test -p auditchain-node --lib`
Expected: PASS (all lib tests, including 4 new chain tests).

- [ ] **Step 5: Commit**

```bash
git add node/src
git commit -m "feat(node): chain validation, certificate and integrity report"
```

---

### Task 5: Config + single-node HTTP API (commit, chain, integrity)

**Files:**
- Create: `node/src/config.rs`
- Create: `node/src/app.rs`
- Create: `node/src/api.rs`
- Modify: `node/src/lib.rs` (add `pub mod config; pub mod app; pub mod api;`)
- Test: inline `#[cfg(test)]` in `api.rs` (handler-level, no network)

**Interfaces:**
- Consumes: everything above.
- Produces:
  - `config::Config::from_env() -> anyhow::Result<Config>` with fields `node_id: String, listen_addr: String, peers: Vec<String>, validator_key_path: PathBuf, db_path: PathBuf, validators_path: PathBuf`
  - `app::App { cfg, store: Mutex<Store>, validator_sk: SigningKey, validators: HashMap<String, VerifyingKey>, institution_vk: VerifyingKey, pending: Mutex<HashMap<u64, Block>>, http: reqwest::Client }`
  - `app::App::new(node_id, peers, listen_addr, validator_key_path, db_path, validators_path) -> anyhow::Result<Arc<App>>`
  - `api::router(app: Arc<App>) -> axum::Router`
  - HTTP (public): `POST /events`, `GET /chain`, `GET /events/:ref`, `GET /integrity`
  - HTTP (internal): `POST /internal/block`, `POST /internal/ack`, `POST /internal/commit`, `GET /internal/status`
  - Response shapes consumed by the console plan: `POST /events` → `{"status":"committed","height":N,"block_hash":"…"}` | 504 `{"status":"pending","reason":"…"}` | 400 `{"error":"…"}`; `GET /chain` → `{"node_id":"…","head_height":N,"blocks":[{"header_hash":"…","block":{...}}]}`; `GET /integrity` → `{"node_id":"…","ok":bool,"head_height":N,"blocks":[{"height":N,"ok":bool,"reason":null}]}`; `GET /internal/status` → `{"node_id":"…","head_height":N,"head_hash":"…","validator_pubkey":"…"}`

- [ ] **Step 1: Config**

`node/src/config.rs`:

```rust
use anyhow::Context;
use std::path::PathBuf;

#[derive(Clone, Debug)]
pub struct Config {
    pub node_id: String,
    pub listen_addr: String,
    pub peers: Vec<String>,
    pub validator_key_path: PathBuf,
    pub db_path: PathBuf,
    pub validators_path: PathBuf,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Config {
            node_id: std::env::var("AUDITCHAIN_NODE_ID").context("AUDITCHAIN_NODE_ID required")?,
            listen_addr: std::env::var("AUDITCHAIN_LISTEN_ADDR").unwrap_or_else(|_| "0.0.0.0:7000".into()),
            peers: std::env::var("AUDITCHAIN_PEERS")
                .unwrap_or_default()
                .split(',')
                .filter(|s| !s.trim().is_empty())
                .map(|s| s.trim().trim_end_matches('/').to_string())
                .collect(),
            validator_key_path: std::env::var("AUDITCHAIN_VALIDATOR_KEY_PATH")?.into(),
            db_path: std::env::var("AUDITCHAIN_DB_PATH")?.into(),
            validators_path: std::env::var("AUDITCHAIN_VALIDATORS_PATH")?.into(),
        })
    }
}
```

- [ ] **Step 2: App state**

`node/src/app.rs`:

```rust
use crate::config::Config;
use crate::crypto::{generate_keypair, load_signing, verifying_from_hex};
use crate::store::Store;
use ed25519_dalek::{SigningKey, VerifyingKey};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub struct App {
    pub cfg: Config,
    pub store: Mutex<Store>,
    pub validator_sk: SigningKey,
    pub validators: HashMap<String, VerifyingKey>,
    pub institution_vk: VerifyingKey,
    pub pending: Mutex<HashMap<u64, crate::model::Block>>,
    pub http: reqwest::Client,
}

impl App {
    pub fn new(cfg: Config) -> anyhow::Result<Arc<Self>> {
        if !cfg.validator_key_path.exists() {
            generate_keypair(&cfg.validator_key_path)?;
        }
        let validator_sk = load_signing(&cfg.validator_key_path)?;
        let raw: HashMap<String, String> =
            serde_json::from_str(&std::fs::read_to_string(&cfg.validators_path)?)?;
        let mut validators = HashMap::new();
        let mut institution_vk = None;
        for (k, v) in raw {
            if k == "institution" {
                institution_vk = Some(verifying_from_hex(&v)?);
            } else {
                validators.insert(k, verifying_from_hex(&v)?);
            }
        }
        Ok(Arc::new(App {
            cfg,
            store: Mutex::new(Store::open(&cfg.db_path)?),
            validator_sk,
            validators,
            institution_vk: institution_vk.ok_or_else(|| anyhow::anyhow!("validators.json missing 'institution' entry"))?,
            pending: Mutex::new(HashMap::new()),
            http: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(3))
                .build()?,
        }))
    }
}
```

- [ ] **Step 3: API routes with failing handler tests**

`node/src/api.rs` — write the router and handlers. The commit handler runs the full leader flow; when `cfg.peers` is empty the committee is just this node, so quorum is 1 and the block commits immediately — this is what makes handler tests meaningful without a network.

```rust
use crate::app::App;
use crate::chain::{block_hash, events_hash, quorum, validate_event, verify_block, verify_certificate};
use crate::crypto::sign_hex;
use crate::model::{Block, BlockHeader, CertSig, Event};
use axum::extract::{Path as AxPath, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde_json::{json, Value};
use std::sync::Arc;

pub fn router(app: Arc<App>) -> Router {
    Router::new()
        .route("/events", post(submit_event))
        .route("/chain", get(get_chain))
        .route("/events/:r", get(get_event))
        .route("/integrity", get(get_integrity))
        .route("/internal/block", post(internal_block))
        .route("/internal/ack", post(internal_ack))
        .route("/internal/commit", post(internal_commit))
        .route("/internal/status", get(internal_status))
        .with_state(app)
}
```

Handlers (full implementations):

```rust
async fn submit_event(
    State(app): State<Arc<App>>,
    Json(event): Json<Event>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if let Err(e) = validate_event(&event, &app.institution_vk) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({"error": e}))));
    }
    let (head_height, head_hash) = {
        let store = app.store.lock().unwrap();
        if store.has_ref(&event.ref_).map_err(internal_error)? {
            return Err((StatusCode::CONFLICT, Json(json!({"error": format!("duplicate ref: {}", event.ref_)}))));
        }
        store.head().map_err(internal_error)?
    };
    let leader_id = leader_id(&app);
    let committee = app.validators.len();
    let q = quorum(committee);
    let header = BlockHeader {
        height: head_height + 1,
        prev_block_hash: head_hash,
        events_hash: events_hash(&[event.clone()]),
        committed_at: crate::canonical::now_rfc3339(),
    };
    let hh = block_hash(&header);
    let leader_signature = sign_hex(&app.validator_sk, hh.as_bytes());
    let mut cert = vec![CertSig { node_id: leader_id.clone(), signature: leader_signature.clone() }];
    let block = Block {
        header,
        events: vec![event],
        leader_signature,
        certificate: vec![], // filled after acks
    };

    // propose to peers
    for peer in &app.cfg.peers {
        if let Ok(resp) = app
            .http
            .post(format!("{}/internal/block", peer))
            .json(&json!({ "block": &block }))
            .send()
            .await
        {
            if let Ok(v) = resp.json::<Value>().await {
                if let (Some(node_id), Some(sig)) = (v["node_id"].as_str(), v["signature"].as_str()) {
                    cert.push(CertSig { node_id: node_id.into(), signature: sig.into() });
                }
            }
        }
    }

    if cert.len() < q {
        return Err((
            StatusCode::GATEWAY_TIMEOUT,
            Json(json!({"status": "pending", "reason": format!("no quorum: {} of {} acks (need {})", cert.len(), committee, q)})),
        ));
    }

    let committed = Block { certificate: cert, ..block };
    {
        let store = app.store.lock().unwrap();
        store.append_block(&committed, &hh).map_err(internal_error)?;
    }
    // notify peers of commit (best effort)
    for peer in &app.cfg.peers {
        let _ = app
            .http
            .post(format!("{}/internal/commit", peer))
            .json(&json!({ "block": &committed, "header_hash": hh }))
            .send()
            .await;
    }
    Ok(Json(json!({"status": "committed", "height": committed.header.height, "block_hash": hh})))
}

fn leader_id(app: &App) -> String {
    // fixed leader: lexicographically smallest validator id (node1)
    let mut ids: Vec<&String> = app.validators.keys().collect();
    ids.sort();
    ids.first().cloned().unwrap_or_else(|| "node1".to_string()).to_string()
}

fn internal_error(e: anyhow::Error) -> (StatusCode, Json<Value>) {
    (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()})))
}

async fn get_chain(State(app): State<Arc<App>>) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let store = app.store.lock().unwrap();
    let all = store.all_blocks().map_err(internal_error)?;
    let head_height = all.last().map(|(b, _)| b.header.height).unwrap_or(0);
    let blocks: Vec<Value> = all
        .into_iter()
        .map(|(b, hh)| json!({"header_hash": hh, "block": b}))
        .collect();
    Ok(Json(json!({"node_id": app.cfg.node_id, "head_height": head_height, "blocks": blocks})))
}

async fn get_event(
    State(app): State<Arc<App>>,
    AxPath(r): AxPath<String>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let store = app.store.lock().unwrap();
    match store.get_event(&r).map_err(internal_error)? {
        Some((e, height, block_hash_v)) => Ok(Json(json!({"event": e, "height": height, "block_hash": block_hash_v}))),
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": format!("event not found: {}", r)})))),
    }
}

async fn get_integrity(State(app): State<Arc<App>>) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let store = app.store.lock().unwrap();
    let report = crate::chain::integrity_report(&store, &app.institution_vk, &app.validators);
    Ok(Json(serde_json::to_value(report).unwrap()))
}

async fn internal_status(State(app): State<Arc<App>>) -> Json<Value> {
    let store = app.store.lock().unwrap();
    let (head_height, head_hash) = store.head().unwrap_or((0, String::new()));
    Json(json!({
        "node_id": app.cfg.node_id,
        "head_height": head_height,
        "head_hash": head_hash,
        "validator_pubkey": crate::crypto::pubkey_hex(&app.validator_sk.verifying_key()),
    }))
}
```

Peer-side handlers:

```rust
async fn internal_block(
    State(app): State<Arc<App>>,
    Json(req): Json<Value>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let block: Block = serde_json::from_value(req["block"].clone())
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))))?;
    let leader_vk = app
        .validators
        .get(&leader_id(&app))
        .cloned()
        .ok_or_else(|| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "leader key missing"}))))?;
    let (head_height, head_hash) = {
        let store = app.store.lock().unwrap();
        store.head().map_err(internal_error)?
    };
    let hh = verify_block(&block, head_height + 1, &head_hash, &app.institution_vk, &leader_vk)
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e}))))?;
    if hh != crate::chain::block_hash(&block.header) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({"error": "header hash mismatch"}))));
    }
    let signature = sign_hex(&app.validator_sk, hh.as_bytes());
    app.pending.lock().unwrap().insert(block.header.height, block);
    Ok(Json(json!({"node_id": app.cfg.node_id, "height": block.header.height, "signature": signature})))
}

async fn internal_commit(
    State(app): State<Arc<App>>,
    Json(req): Json<Value>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let block: Block = serde_json::from_value(req["block"].clone())
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))))?;
    let header_hash: String = req["header_hash"].as_str().unwrap_or_default().to_string();
    let leader = leader_id(&app);
    let q = quorum(app.validators.len());
    verify_certificate(&block.certificate, &header_hash, q, &app.validators, &leader)
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e}))))?;
    {
        let store = app.store.lock().unwrap();
        if store.has_block(&block.header.height).map_err(internal_error)? {
            return Ok(Json(json!({"status": "already"})));
        }
        store.append_block(&block, &header_hash).map_err(internal_error)?;
    }
    app.pending.lock().unwrap().remove(&block.header.height);
    Ok(Json(json!({"status": "committed", "height": block.header.height})))
}

async fn internal_ack(
    State(app): State<Arc<App>>,
    Json(req): Json<Value>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    // acks are collected by the leader from peer responses to /internal/block;
    // this endpoint exists so an external auditor can observe the protocol shape.
    let height = req["height"].as_u64().unwrap_or(0);
    let pending = app.pending.lock().unwrap();
    Ok(Json(json!({"node_id": app.cfg.node_id, "pending_height": pending.contains_key(&height)})))
}
```

Note the new store method `has_block` — add it to `store.rs`:

```rust
pub fn has_block(&self, height: u64) -> anyhow::Result<bool> {
    let mut stmt = self.conn.prepare("SELECT 1 FROM blocks WHERE height=?1")?;
    Ok(stmt.exists(rusqlite::params![height as i64])?)
}
```

Add a `pubkey_hex` import in api.rs: it is referenced as `crate::crypto::pubkey_hex` inline — no separate import needed.

- [ ] **Step 4: Handler tests (in `api.rs` `#[cfg(test)]`)**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::app::App;
    use crate::config::Config;
    use crate::crypto::{generate_keypair, load_signing, pubkey_hex, sign_hex};
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    struct TestNode {
        router: Router,
        inst_sk: ed25519_dalek::SigningKey,
        dir: std::path::PathBuf,
    }

    fn test_node(tag: &str, peers: Vec<String>) -> TestNode {
        let dir = std::env::temp_dir().join(format!("ac-api-{}-{}", tag, std::process::id()));
        std::fs::remove_dir_all(&dir).ok();
        std::fs::create_dir_all(&dir).unwrap();
        let inst_key = dir.join("inst.pem");
        generate_keypair(&inst_key).unwrap();
        let inst_sk = load_signing(&inst_key).unwrap();
        let vkey = dir.join("validator.pem");
        generate_keypair(&vkey).unwrap();
        let vp = load_signing(&vkey).unwrap();
        let validators_path = dir.join("validators.json");
        std::fs::write(
            &validators_path,
            serde_json::json!({
                "institution": pubkey_hex(&inst_sk.verifying_key()),
                "node1": pubkey_hex(&vp.verifying_key())
            })
            .to_string(),
        )
        .unwrap();
        let cfg = Config {
            node_id: "node1".into(),
            listen_addr: "127.0.0.1:0".into(),
            peers,
            validator_key_path: vkey,
            db_path: dir.join("n.db"),
            validators_path,
        };
        let app = App::new(cfg).unwrap();
        TestNode { router: router(app), inst_sk, dir }
    }

    impl Drop for TestNode {
        fn drop(&mut self) {
            std::fs::remove_dir_all(&self.dir).ok();
        }
    }

    fn sample_event() -> serde_json::Value {
        serde_json::json!({
            "ref": "BUD-2026-0031",
            "type": "budget_created",
            "title": "FY2026 Procurement Budget",
            "actor": "finance-directorate",
            "occurred_at": "2026-02-04",
            "evidence": []
        })
    }

    async fn post_event(node: &TestNode, mut ev: serde_json::Value) -> (StatusCode, Value) {
        let unsigned = serde_json::to_value(&ev).unwrap();
        // canonical payload without the signature field
        let payload = crate::canonical::canonicalize(&{
            let mut v = unsigned.clone();
            v.as_object_mut().unwrap().remove("institution_signature");
            v
        });
        ev["institution_signature"] = serde_json::json!(sign_hex(&node.inst_sk, payload.as_bytes()));
        let resp = node
            .router
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/events")
                    .header("content-type", "application/json")
                    .body(Body::from(serde_json::to_string(&ev).unwrap()))
                    .unwrap(),
            )
            .await
            .unwrap();
        let status = resp.status();
        let body = axum::body::to_bytes(resp.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    async fn get_json(node: &TestNode, uri: &str) -> (StatusCode, Value) {
        let resp = node
            .router
            .clone()
            .oneshot(
                Request::builder()
                    .method("GET")
                    .uri(uri)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        let status = resp.status();
        let body = axum::body::to_bytes(resp.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    #[tokio::test]
    async fn commits_event_and_serves_chain_and_event_lookup() {
        let node = test_node("commit", vec![]);
        let (status, body) = post_event(&node, sample_event()).await;
        assert_eq!(status, StatusCode::OK, "body: {}", body);
        assert_eq!(body["status"], "committed");
        assert_eq!(body["height"], 1);
        let (status, chain) = get_json(&node, "/chain").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(chain["head_height"], 1);
        assert_eq!(chain["blocks"].as_array().unwrap().len(), 2);
        let (status, ev) = get_json(&node, "/events/BUD-2026-0031").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(ev["event"]["ref"], "BUD-2026-0031");
        assert_eq!(ev["height"], 1);
    }

    #[tokio::test]
    async fn rejects_unsigned_and_duplicate_events() {
        let node = test_node("reject", vec![]);
        // unsigned
        let resp = node
            .router
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/events")
                    .header("content-type", "application/json")
                    .body(Body::from(sample_event().to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
        // committed once
        let (s, _) = post_event(&node, sample_event()).await;
        assert_eq!(s, StatusCode::OK);
        // duplicate
        let (s, body) = post_event(&node, sample_event()).await;
        assert_eq!(s, StatusCode::CONFLICT, "body: {}", body);
    }

    #[tokio::test]
    async fn integrity_is_clean_after_commit() {
        let node = test_node("integrity", vec![]);
        let (s, _) = post_event(&node, sample_event()).await;
        assert_eq!(s, StatusCode::OK);
        let (status, rep) = get_json(&node, "/integrity").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(rep["ok"], true, "report: {}", rep);
        assert_eq!(rep["head_height"], 1);
    }
}
```

Add dev-dependencies to `node/Cargo.toml`:

```toml
[dev-dependencies]
tower = { version = "0.5", features = ["util"] }
```

- [ ] **Step 5: Run tests**

Run: `cargo test -p auditchain-node`
Expected: PASS — all previous + 3 api tests.

- [ ] **Step 6: Commit**

```bash
git add node/src node/Cargo.toml
git commit -m "feat(node): HTTP API — commit, chain, integrity, internal protocol"
```

---

### Task 6: Serve binary + multi-node integration test (quorum, resilience, tamper)

**Files:**
- Create: `node/src/consensus.rs` (tamper helper used by both `tamper-demo` and tests)
- Modify: `node/src/main.rs` (real `serve` subcommand)
- Modify: `node/src/lib.rs` (add `pub mod consensus;`)
- Create: `node/tests/integration_cluster.rs`

**Interfaces:**
- Produces:
  - `consensus::tamper_alter_event_amount(db_path: &Path, ref_: &str, new_amount: i64) -> anyhow::Result<()>` — direct SQLite edit, the attacker code path reused by `tamper-demo` and the integration test
  - `auditchain-node serve` reading `Config::from_env()`

- [ ] **Step 1: Tamper helper with unit test**

`node/src/consensus.rs`:

```rust
use std::path::Path;

/// Attacker path: directly alter a committed event's amount in a node's SQLite store.
/// Deliberately does NOT update signatures or hashes — that is the point of the demo.
pub fn tamper_alter_event_amount(db_path: &Path, ref_: &str, new_amount: i64) -> anyhow::Result<()> {
    let conn = rusqlite::Connection::open(db_path)?;
    let event_json: String = conn
        .query_row(
            "SELECT event_json FROM events WHERE ref=?1",
            rusqlite::params![ref_],
            |r| r.get(0),
        )
        .map_err(|e| anyhow::anyhow!("event {} not found in {}: {}", ref_, db_path.display(), e))?;
    let mut v: serde_json::Value = serde_json::from_str(&event_json)?;
    v["amount"] = serde_json::json!(new_amount);
    conn.execute(
        "UPDATE events SET event_json=?1 WHERE ref=?2",
        rusqlite::params![serde_json::to_string(&v)?, ref_],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tamper_alters_amount_and_breaks_integrity() {
        // covered end-to-end by tests/integration_cluster.rs; here we only assert
        // the error path on a nonexistent DB
        let dir = std::env::temp_dir().join(format!("ac-cons-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let missing = dir.join("missing.db");
        assert!(tamper_alter_event_amount(&missing, "PAY-2026-0123", 1).is_err());
        std::fs::remove_dir_all(dir).ok();
    }
}
```

Add `pub mod consensus;` to `lib.rs`. Run `cargo test -p auditchain-node --lib consensus` — expected PASS (1 test).

- [ ] **Step 2: Serve subcommand in main.rs**

Replace `node/src/main.rs`:

```rust
use anyhow::Context;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "auditchain-node")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Run the node HTTP server
    Serve,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Command::Serve => serve().await,
    }
}

async fn serve() -> anyhow::Result<()> {
    let cfg = auditchain_node::config::Config::from_env()?;
    let app = auditchain_node::app::App::new(cfg.clone())?;
    let router = auditchain_node::api::router(app);
    let listener = tokio::net::TcpListener::bind(&cfg.listen_addr)
        .await
        .with_context(|| format!("binding {}", cfg.listen_addr))?;
    eprintln!(
        "auditchain-node {} listening on {} (peers: {:?})",
        cfg.node_id, cfg.listen_addr, cfg.peers
    );
    axum::serve(listener, router).await?;
    Ok(())
}
```

- [ ] **Step 3: Write the integration test**

`node/tests/integration_cluster.rs`:

```rust
use auditchain_node::app::App;
use auditchain_node::config::Config;
use auditchain_node::crypto::{generate_keypair, load_signing, pubkey_hex, sign_hex};
use auditchain_node::{api, chain, consensus};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;

struct Cluster {
    addrs: Vec<std::net::SocketAddr>,   // [node1, node2, node3]
    _handles: Vec<tokio::task::JoinHandle<()>>,
    dbs: Vec<std::path::PathBuf>,
    dirs: Vec<std::path::PathBuf>,
    base: std::path::PathBuf,
    inst_sk: ed25519_dalek::SigningKey,
}

async fn spawn_cluster(tag: &str) -> Cluster {
    let base = std::env::temp_dir().join(format!("ac-int-{}-{}", tag, std::process::id()));
    std::fs::remove_dir_all(&base).ok();
    std::fs::create_dir_all(&base).unwrap();

    // institution key shared by all
    let inst_path = base.join("inst.pem");
    generate_keypair(&inst_path).unwrap();
    let inst_sk = load_signing(&inst_path).unwrap();

    // validator keys
    let mut validators: HashMap<String, String> = HashMap::new();
    validators.insert("institution".into(), pubkey_hex(&inst_sk.verifying_key()));
    let mut key_paths = vec![];
    for i in 1..=3 {
        let p = base.join(format!("validator-node{}.pem", i));
        generate_keypair(&p).unwrap();
        let vk = load_signing(&p).unwrap();
        validators.insert(format!("node{}", i), pubkey_hex(&vk.verifying_key()));
        key_paths.push(p);
    }
    let validators_path = base.join("validators.json");
    std::fs::write(&validators_path, serde_json::to_string(&validators).unwrap()).unwrap();

    // listeners first so peers know each other's addresses
    let mut listeners = vec![];
    for _ in 0..3 {
        listeners.push(tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap());
    }
    let addrs: Vec<std::net::SocketAddr> = listeners
        .iter()
        .map(|l| l.local_addr().unwrap())
        .collect();
    let urls: Vec<String> = addrs.iter().map(|a| format!("http://{}", a)).collect();

    let mut handles = vec![];
    let mut dbs = vec![];
    let mut dirs = vec![];
    for i in 0..3 {
        let node_dir = base.join(format!("node{}", i + 1));
        std::fs::create_dir_all(&node_dir).unwrap();
        let db = node_dir.join("n.db");
        let cfg = Config {
            node_id: format!("node{}", i + 1),
            listen_addr: format!("127.0.0.1:0"),
            peers: urls
                .iter()
                .enumerate()
                .filter(|(j, _)| *j != i)
                .map(|(_, u)| u.clone())
                .collect(),
            validator_key_path: key_paths[i].clone(),
            db_path: db.clone(),
            validators_path: validators_path.clone(),
        };
        let app: Arc<App> = App::new(cfg).unwrap();
        // bind the pre-created listener so addrs match
        let router = api::router(app);
        let listener = listeners.remove(0);
        dbs.push(db);
        dirs.push(node_dir);
        handles.push(tokio::spawn(async move {
            axum::serve(listener, router).await.unwrap();
        }));
    }
    // wait for servers to accept connections
    for u in &urls {
        for _ in 0..100 {
            if reqwest::get(format!("{}/internal/status", u)).await.is_ok() {
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(20)).await;
        }
    }
    Cluster { addrs, _handles: handles, dbs, dirs, base, inst_sk }
}

impl Drop for Cluster {
    fn drop(&mut self) {
        for h in &self._handles {
            h.abort();
        }
        for d in &self.dirs {
            let _ = std::fs::remove_dir_all(d);
        }
    }
}

impl Cluster {
    fn url(&self, i: usize) -> String {
        format!("http://{}", self.addrs[i])
    }

    fn node_id_of(&self, i: usize) -> String {
        format!("node{}", i + 1)
    }

    async fn post_event(&self, ev: Value) -> (reqwest::StatusCode, Value) {
        let resp = reqwest::Client::new()
            .post(format!("{}/events", self.url(0)))
            .json(&ev)
            .send()
            .await
            .unwrap();
        let status = resp.status();
        (status, resp.json::<Value>().await.unwrap())
    }

    fn signed(&self, mut ev: serde_json::Value) -> serde_json::Value {
        ev.as_object_mut().unwrap().remove("institution_signature");
        let payload = auditchain_node::canonical::canonicalize(&ev);
        ev["institution_signature"] = json!(sign_hex(&self.inst_sk, payload.as_bytes()));
        ev
    }

    async fn integrity(&self, i: usize) -> Value {
        reqwest::get(format!("{}/integrity", self.url(i)))
            .await
            .unwrap()
            .json::<Value>()
            .await
            .unwrap()
    }
}

fn event_json(seq: u32, type_: &str, ref_: &str, occurred: &str, amount: Option<i64>) -> Value {
    let mut e = json!({
        "ref": ref_,
        "type": type_,
        "title": format!("Synthetic event {}", seq),
        "actor": "seed",
        "occurred_at": occurred,
        "evidence": []
    });
    if let Some(a) = amount {
        e["amount"] = json!(a);
    }
    e
}

#[tokio::test]
async fn three_node_cluster_commits_and_replicates() {
    let c = spawn_cluster("replicate").await;
    let (s, body) = c
        .post_event(c.signed(event_json(1, "budget_created", "BUD-2026-0031", "2026-02-04", None)))
        .await;
    assert_eq!(s, reqwest::StatusCode::OK, "body: {}", body);
    assert_eq!(body["status"], "committed");
    // all three nodes have height 1 and the same head hash
    let mut heads = vec![];
    for i in 0..3 {
        let st: Value = reqwest::get(format!("{}/internal/status", c.url(i)))
            .await
            .unwrap()
            .json()
            .await
            .unwrap();
        assert_eq!(st["head_height"], 1, "node {} did not replicate", i + 1);
        heads.push(st["head_hash"].clone());
    }
    assert_eq!(heads[0], heads[1]);
    assert_eq!(heads[1], heads[2]);
    for i in 0..3 {
        assert_eq!(c.integrity(i).await["ok"], true);
    }
}

#[tokio::test]
async fn commits_continue_when_one_peer_is_down() {
    let c = spawn_cluster("resilience").await;
    // commit one block normally
    let (s, _) = c
        .post_event(c.signed(event_json(1, "budget_created", "BUD-1", "2026-02-04", None)))
        .await;
    assert_eq!(s, reqwest::StatusCode::OK);
    // kill node3 (abort its server task)
    c._handles[2].abort();
    // next event still commits: quorum 2 of 3 with node3 unreachable
    let (s, body) = c
        .post_event(c.signed(event_json(2, "procurement_started", "PR-1", "2026-02-12", None)))
        .await;
    assert_eq!(s, reqwest::StatusCode::OK, "body: {}", body);
    assert_eq!(body["status"], "committed");
    let st: Value = reqwest::get(format!("{}/internal/status", c.url(1)))
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(st["head_height"], 2);
}

#[tokio::test]
async fn tampered_node_fails_integrity_and_diverges() {
    let c = spawn_cluster("tamper").await;
    for (i, (t, r, o, a)) in [
        ("budget_created", "BUD-1", "2026-02-04", None),
        ("payment_made", "PAY-1", "2026-03-14", Some(14550000)),
    ]
    .into_iter()
    .enumerate()
    {
        let ev = event_json((i + 1) as u32, t, r, o, a);
        let (s, body) = c.post_event(c.signed(ev)).await;
        assert_eq!(s, reqwest::StatusCode::OK, "body: {}", body);
    }
    // attacker edits node2's stored payment amount
    consensus::tamper_alter_event_amount(&c.dbs[1], "PAY-1", 99_999_999).unwrap();
    // node2's integrity check fails on block 2
    let rep = c.integrity(1).await;
    assert_eq!(rep["ok"], false, "tampered node must fail: {}", rep);
    assert!(
        rep["blocks"].as_array().unwrap().iter().any(|b| b["height"] == 2 && b["ok"] == false),
        "block 2 must be flagged: {}", rep
    );
    // node1 stays clean
    assert_eq!(c.integrity(0).await["ok"], true);
    // node2 fails integrity while its peers pass — that IS the divergence signal.
    // (Head hashes are stored at append time, so tampering a stored event payload
    // changes no stored hash; divergence is detected by recomputation, i.e. /integrity.)
    assert_eq!(c.integrity(1).await["ok"], false);
    assert_eq!(c.integrity(2).await["ok"], true);
}
```

- [ ] **Step 4: Run the integration tests**

Run: `cargo test -p auditchain-node --test integration_cluster`
Expected: PASS (3 tests). If the resilience test flakes on timing, raise the status-poll loop to 200 iterations.

- [ ] **Step 5: Commit**

```bash
git add node/src node/tests
git commit -m "feat(node): serve binary, tamper helper, 3-node integration tests"
```

---

### Task 7: keygen / pubkey / seed subcommands

**Files:**
- Create: `node/src/seed.rs`
- Modify: `node/src/main.rs` (add `Keygen`, `Pubkey`, `Seed` subcommands)
- Modify: `node/src/lib.rs` (add `pub mod seed;`)
- Test: `node/tests/seed.rs` (runs seed against a spawned cluster)

**Interfaces:**
- Produces:
  - CLI: `auditchain-node keygen --out <path>`; `auditchain-node pubkey --key <path>` (prints 32-byte hex); `auditchain-node seed --api <leader-url> --peers <comma-separated peer urls> --institution-key <pem> --evidence-dir <dir>` (generates the institution key if missing; submits the 7 lifecycle events; verifies integrity on leader and every peer)
  - `seed::SEED_EVENTS: [SeedEvent; 7]` (the table below)
  - `seed::run(api: &str, peers: &[String], institution_key_path: &Path, evidence_dir: &Path) -> anyhow::Result<SeedReport>` where `SeedReport { heights: HashMap<String, u64>, all_integrity_ok: bool }`

Seeded lifecycle (from slide 8 — refs, titles, actors, dates are the demo storyline; amounts in minor units; PAY precedes CON by design):

| # | ref | type | title | actor | occurred_at | amount | evidence file |
|---|-----|------|-------|-------|-------------|--------|---------------|
| 1 | BUD-2026-0031 | budget_created | FY2026 Procurement Budget | finance-directorate | 2026-02-04 | — | budget-memo.txt |
| 2 | PR-2026-0117 | procurement_started | Office equipment tender | procurement-directorate | 2026-02-12 | — | tender-notice.txt |
| 3 | BID-2026-0089 | bid_received | Tender response — Meridian Supplies Ltd | supplier-portal | 2026-02-21 | — | bid-response.txt |
| 4 | EVAL-2026-0064 | bid_evaluated | Evaluation committee score sheet | evaluation-committee | 2026-02-27 | — | evaluation-sheet.txt |
| 5 | SEL-2026-0058 | supplier_selected | Meridian Supplies Ltd selected | procurement-directorate | 2026-03-05 | — | selection-minute.txt |
| 6 | CON-2026-0455 | contract_approved | Supply contract awarded | accounting-officer | 2026-03-16 | 4850000 | contract-summary.txt |
| 7 | PAY-2026-0123 | payment_made | Advance payment released | treasury | 2026-03-14 | 14550000 | payment-instruction.txt |

Evidence file contents (written by seed if missing, ASCII only):

```
budget-memo.txt:        "FY2026 procurement budget memo — approved allocation for office equipment."
tender-notice.txt:      "Public tender notice: office equipment supply. Closing 2026-02-20."
bid-response.txt:       "Bid response from Meridian Supplies Ltd — technical and financial proposal."
evaluation-sheet.txt:   "Evaluation committee score sheet — Meridian Supplies Ltd ranked first."
selection-minute.txt:   "Selection minute: Meridian Supplies Ltd awarded subject to contract."
contract-summary.txt:   "Supply contract summary — Meridian Supplies Ltd, value 4,850,000.00 minor units."
payment-instruction.txt: "Payment instruction: advance payment to Meridian Supplies Ltd."
```

- [ ] **Step 1: Implement seed module**

`node/src/seed.rs`:

```rust
use anyhow::Context;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::path::Path;

pub struct SeedEvent {
    pub ref_: &'static str,
    pub type_: &'static str,
    pub title: &'static str,
    pub actor: &'static str,
    pub occurred_at: &'static str,
    pub amount: Option<i64>,
    pub evidence_file: &'static str,
    pub evidence_text: &'static str,
}

pub const SEED_EVENTS: [SeedEvent; 7] = [
    SeedEvent { ref_: "BUD-2026-0031", type_: "budget_created", title: "FY2026 Procurement Budget", actor: "finance-directorate", occurred_at: "2026-02-04", amount: None, evidence_file: "budget-memo.txt", evidence_text: "FY2026 procurement budget memo — approved allocation for office equipment." },
    SeedEvent { ref_: "PR-2026-0117", type_: "procurement_started", title: "Office equipment tender", actor: "procurement-directorate", occurred_at: "2026-02-12", amount: None, evidence_file: "tender-notice.txt", evidence_text: "Public tender notice: office equipment supply. Closing 2026-02-20." },
    SeedEvent { ref_: "BID-2026-0089", type_: "bid_received", title: "Tender response — Meridian Supplies Ltd", actor: "supplier-portal", occurred_at: "2026-02-21", amount: None, evidence_file: "bid-response.txt", evidence_text: "Bid response from Meridian Supplies Ltd — technical and financial proposal." },
    SeedEvent { ref_: "EVAL-2026-0064", type_: "bid_evaluated", title: "Evaluation committee score sheet", actor: "evaluation-committee", occurred_at: "2026-02-27", amount: None, evidence_file: "evaluation-sheet.txt", evidence_text: "Evaluation committee score sheet — Meridian Supplies Ltd ranked first." },
    SeedEvent { ref_: "SEL-2026-0058", type_: "supplier_selected", title: "Meridian Supplies Ltd selected", actor: "procurement-directorate", occurred_at: "2026-03-05", amount: None, evidence_file: "selection-minute.txt", evidence_text: "Selection minute: Meridian Supplies Ltd awarded subject to contract." },
    SeedEvent { ref_: "CON-2026-0455", type_: "contract_approved", title: "Supply contract awarded", actor: "accounting-officer", occurred_at: "2026-03-16", amount: Some(4850000), evidence_file: "contract-summary.txt", evidence_text: "Supply contract summary — Meridian Supplies Ltd, value 4,850,000.00 minor units." },
    SeedEvent { ref_: "PAY-2026-0123", type_: "payment_made", title: "Advance payment released", actor: "treasury", occurred_at: "2026-03-14", amount: Some(14550000), evidence_file: "payment-instruction.txt", evidence_text: "Payment instruction: advance payment to Meridian Supplies Ltd." },
];

pub struct SeedReport {
    pub heights: HashMap<String, u64>,
    pub all_integrity_ok: bool,
}

pub async fn run(api: &str, peers: &[String], institution_key_path: &Path, evidence_dir: &Path) -> anyhow::Result<SeedReport> {
    if !institution_key_path.exists() {
        crate::crypto::generate_keypair(institution_key_path)?;
    }
    let sk = crate::crypto::load_signing(institution_key_path)?;
    std::fs::create_dir_all(evidence_dir)?;
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(10)).build()?;

    // wait for the leader to be reachable
    let mut ready = false;
    for _ in 0..150 {
        if client.get(format!("{}/internal/status", api)).send().await.is_ok() {
            ready = true;
            break;
        }
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
    }
    anyhow::ensure!(ready, "leader at {} never became reachable", api);

    let mut heights = HashMap::new();
    for se in SEED_EVENTS.iter() {
        if client
            .get(format!("{}/events/{}", api, se.ref_))
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false)
        {
            eprintln!("seed: {} already committed, skipping", se.ref_);
            let ev: Value = client.get(format!("{}/events/{}", api, se.ref_)).send().await?.json().await?;
            heights.insert(se.ref_.to_string(), ev["height"].as_u64().unwrap_or(0));
            continue;
        }
        let ev_path = evidence_dir.join(se.evidence_file);
        if !ev_path.exists() {
            std::fs::write(&ev_path, se.evidence_text)?;
        }
        let file_hash = crate::canonical::sha256_hex(&std::fs::read(&ev_path)?);
        let mut ev = json!({
            "ref": se.ref_,
            "type": se.type_,
            "title": se.title,
            "actor": se.actor,
            "occurred_at": se.occurred_at,
            "evidence": [{ "filename": se.evidence_file, "sha256": file_hash }]
        });
        if let Some(a) = se.amount {
            ev["amount"] = json!(a);
        }
        ev.as_object_mut().unwrap().remove("institution_signature");
        let payload = crate::canonical::canonicalize(&ev);
        ev["institution_signature"] = json!(crate::crypto::sign_hex(&sk, payload.as_bytes()));
        let resp = client.post(format!("{}/events", api)).json(&ev).send().await?;
        let status = resp.status();
        let body: Value = resp.json().await?;
        anyhow::ensure!(
            status.is_success(),
            "seed: committing {} failed: {} {}",
            se.ref_, status, body
        );
        eprintln!("seed: committed {} at height {}", se.ref_, body["height"]);
        heights.insert(se.ref_.to_string(), body["height"].as_u64().unwrap_or(0));
    }

    // verification pass: 8 blocks (genesis + 7), integrity ok on leader and every peer, PAY before CON
    let chain: Value = client.get(format!("{}/chain", api)).send().await?.json().await?;
    anyhow::ensure!(chain["head_height"].as_u64() == Some(8), "expected head height 8, got {}", chain["head_height"]);
    for url in std::iter::once(api).chain(peers.iter().map(|s| s.as_str())) {
        let integrity: Value = client.get(format!("{}/integrity", url)).send().await?.json().await?;
        anyhow::ensure!(integrity["ok"] == true, "integrity check failed on {}: {}", url, integrity);
    }
    let pay_h = heights["PAY-2026-0123"];
    let con_h = heights["CON-2026-0455"];
    anyhow::ensure!(pay_h < con_h, "expected PAY (height {}) before CON (height {})", pay_h, con_h);
    Ok(SeedReport { heights, all_integrity_ok: true })
}
```

- [ ] **Step 2: Wire subcommands in main.rs**

Extend the `Command` enum and match arms:

```rust
#[derive(Subcommand)]
enum Command {
    /// Run the node HTTP server
    Serve,
    /// Generate an Ed25519 keypair (PKCS#8 PEM)
    Keygen {
        /// Output path for the PEM file
        #[arg(long)]
        out: std::path::PathBuf,
    },
    /// Print the 32-byte hex public key of a PEM private key
    Pubkey {
        #[arg(long)]
        key: std::path::PathBuf,
    },
    /// Seed the demo lifecycle through the leader's HTTP API
    Seed {
        #[arg(long, default_value = "http://127.0.0.1:7001")]
        api: String,
        /// Peer base URLs, comma-separated — each gets an integrity check after seeding
        #[arg(long, value_delimiter = ',', default_value = "")]
        peers: Vec<String>,
        #[arg(long)]
        institution_key: std::path::PathBuf,
        #[arg(long)]
        evidence_dir: std::path::PathBuf,
    },
}
```

Match arms:

```rust
Command::Keygen { out } => {
    auditchain_node::crypto::generate_keypair(&out)?;
    eprintln!("keypair written to {}", out.display());
}
Command::Pubkey { key } => {
    let vk = auditchain_node::crypto::load_verifying(&key)?;
    println!("{}", auditchain_node::crypto::pubkey_hex(&vk));
}
Command::Seed { api, peers, institution_key, evidence_dir } => {
    let peers: Vec<String> = peers.into_iter().filter(|s| !s.is_empty()).collect();
    let report = auditchain_node::seed::run(&api, &peers, &institution_key, &evidence_dir).await?;
    println!("seed complete: all_integrity_ok={}", report.all_integrity_ok);
    for (r, h) in &report.heights {
        println!("  {} at height {}", r, h);
    }
}
```

Add `pub mod seed;` to `lib.rs`.

- [ ] **Step 3: Seed integration test**

`node/tests/seed.rs` — reuse the cluster harness pattern from `tests/integration_cluster.rs` (copy the `spawn_cluster` helper into a shared `tests/common/mod.rs`; declare `mod common;` in both test files):

`tests/common/mod.rs` contains exactly the `spawn_cluster`/`Cluster` code from Task 6 Step 3 (minus the three `#[tokio::test]` functions, which stay in `integration_cluster.rs`). Then:

```rust
mod common;
use common::Cluster;
use serde_json::json;

#[tokio::test]
async fn seed_populates_lifecycle_and_verifies() {
    let c = common::spawn_cluster("seed").await;
    let evidence_dir = c.base.join("evidence");
    let inst_key = c.base.join("seed-institution.pem");
    std::fs::copy(c.base.join("inst.pem"), &inst_key).unwrap();
    let peers: Vec<String> = (1..3).map(|i| c.url(i)).collect();
    let report = auditchain_node::seed::run(&c.url(0), &peers, &inst_key, &evidence_dir)
        .await
        .unwrap();
    assert!(report.all_integrity_ok);
    assert_eq!(report.heights.len(), 7);
    assert!(report.heights["PAY-2026-0123"] < report.heights["CON-2026-0455"]);
    // idempotent: running seed twice is a no-op
    let report2 = auditchain_node::seed::run(&c.url(0), &peers, &inst_key, &evidence_dir)
        .await
        .unwrap();
    assert_eq!(report.heights, report2.heights);
}
```

(`common/mod.rs` exposes the cluster root as `Cluster.base`; the shared `inst.pem` created by `spawn_cluster` lives there.)

- [ ] **Step 4: Run tests**

Run: `cargo test -p auditchain-node`
Expected: PASS — all lib + both integration suites.

- [ ] **Step 5: Commit**

```bash
git add node/src node/tests
git commit -m "feat(node): keygen/pubkey/seed subcommands with lifecycle fixture"
```

---

### Task 8: tamper-demo binary + full test suite green

**Files:**
- Modify: `node/src/bin/tamper-demo.rs` (replace placeholder)
- Test: manual CLI check against the integration harness is covered by `consensus::tamper_alter_event_amount` tests; here we verify the binary parses args

**Interfaces:**
- Consumes: `consensus::tamper_alter_event_amount`.
- Produces: CLI `tamper-demo --db <path> --ref <ref> --amount <n>`.

- [ ] **Step 1: Implement the binary**

Replace `node/src/bin/tamper-demo.rs`:

```rust
use clap::Parser;
use std::path::PathBuf;

/// Demo tool: alter a committed event directly in one node's SQLite store,
/// simulating an attacker with access to that machine's storage. Does not
/// update signatures or hashes — integrity checks are expected to fail.
#[derive(Parser)]
#[command(name = "tamper-demo")]
struct Args {
    /// Path to the node's SQLite database
    #[arg(long)]
    db: PathBuf,
    /// Event ref to alter, e.g. PAY-2026-0123
    #[arg(long)]
    ref_: String,
    /// New amount (minor units)
    #[arg(long)]
    amount: i64,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();
    auditchain_node::consensus::tamper_alter_event_amount(&args.db, &args.ref_, args.amount)?;
    eprintln!(
        "tampered: event {} amount set to {} in {}",
        args.ref_,
        args.amount,
        args.db.display()
    );
    eprintln!("expected: /integrity on this node now FAILS; other nodes stay clean");
    Ok(())
}
```

- [ ] **Step 2: Verify the full suite**

Run: `cargo test -p auditchain-node && cargo build --release -p auditchain-node`
Expected: all tests PASS; release binaries `auditchain-node`, `tamper-demo` build without warnings.

- [ ] **Step 3: Smoke-test the CLI surface**

```bash
./target/release/auditchain-node keygen --out /tmp/ac-smoke.pem
./target/release/auditchain-node pubkey --key /tmp/ac-smoke.pem
./target/release/tamper-demo --db /tmp/nope.db --ref PAY-2026-0123 --amount 1 2>&1 | grep -q "not found" && echo OK
rm /tmp/ac-smoke.pem
```

Expected: a 64-char hex string from pubkey; `OK` from tamper-demo error path.

- [ ] **Step 4: Commit**

```bash
git add node/src
git commit -m "feat(node): tamper-demo CLI and full suite green"
```

---

## Plan 1 done — what the console plan builds on

The console plan (`docs/superpowers/plans/2026-09-05-procurement-mvp-console.md`) consumes exactly these HTTP endpoints: `POST /events`, `GET /chain`, `GET /events/:ref`, `GET /integrity`, `GET /internal/status`, and the institution PKCS#8 PEM key plus canonical-JSON parity (Task 1 fixture).
