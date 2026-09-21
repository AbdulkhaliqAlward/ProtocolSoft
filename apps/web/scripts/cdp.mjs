/**
 * Minimal CDP driver for the local verification suites (Phase 5 visual rebuild
 * §17B/§17C/§17D). Uses the system Chrome/Edge via --remote-debugging-port and
 * Node's built-in WebSocket — no new dependencies. LOCAL DEVELOPMENT ONLY.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

export const findBrowser = () => CANDIDATES.find((p) => existsSync(p));

export class Cdp {
  constructor(proc, port) {
    this.proc = proc;
    this.port = port;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  static async launch(port = 9223) {
    const exe = findBrowser();
    if (!exe) throw new Error('No Chrome/Edge installation found for CDP verification');
    const dir = mkdtempSync(join(tmpdir(), 'ps-cdp-'));
    const proc = spawn(exe, [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${dir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--window-size=1440,900',
      'about:blank',
    ], { stdio: 'ignore' });
    // Wait for the devtools endpoint
    for (let i = 0; i < 60; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (res.ok) return new Cdp(proc, port);
      } catch { /* not ready yet */ }
      await new Promise((r) => setTimeout(r, 250));
    }
    proc.kill();
    throw new Error('Chrome devtools endpoint never became ready');
  }

  async connect(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = () => reject(new Error('CDP websocket failed'));
    });
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(String(e.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  async newTababoutBlank() {
    const res = await fetch(`http://127.0.0.1:${this.port}/json/new?about:blank`, { method: 'PUT' });
    const tab = await res.json();
    await this.connect(tab.webSocketDebuggerUrl);
    this.targetId = tab.id;
    return tab;
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  /** Evaluate an expression (async supported) and return the JSON value. */
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed');
    return r.result.value;
  }

  async goto(url) {
    await this.send('Page.navigate', { url });
    await this.waitLoad();
  }

  async waitLoad() {
    await this.eval(`new Promise((res) => { if (document.readyState !== 'loading') res(); else addEventListener('DOMContentLoaded', () => res(), { once: true }); })`);
  }

  async close() {
    try { if (this.targetId) await fetch(`http://127.0.0.1:${this.port}/json/close/${this.targetId}`); } catch { /* noop */ }
    try { this.proc.kill(); } catch { /* noop */ }
    if (this.userDataDir) {
      try { rmSync(this.userDataDir, { recursive: true, force: true }); } catch { /* noop */ }
    }
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
