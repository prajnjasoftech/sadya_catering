import {test} from 'node:test';
import assert from 'node:assert/strict';
import {IDLE_TIMEOUT, recordActivity, isSessionIdle, watchSession} from './session.js';

test('inactivity timeout follows interaction, survives refresh, and handles sleeping tabs', () => {
  const originals = {window: globalThis.window, document: globalThis.document, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, fetch: globalThis.fetch, setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, now: Date.now};
  const storage = () => {
    const values = new Map();
    return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key)};
  };
  let now = 100000, nextTimer = 0, logoutCount = 0, revoked = [];
  const timers = new Map();
  let stop = () => {};
  try {
    globalThis.window = new EventTarget();
    globalThis.document = new EventTarget();
    document.visibilityState = 'visible';
    globalThis.localStorage = storage();
    globalThis.sessionStorage = storage();
    globalThis.fetch = async (url, options) => { revoked.push(options.headers.Authorization); };
    globalThis.setTimeout = (fn, delay) => {timers.set(++nextTimer, {fn, at: now + delay}); return nextTimer;};
    globalThis.clearTimeout = id => timers.delete(id);
    Date.now = () => now;
    const advance = milliseconds => {
      now += milliseconds;
      for (const [id, timer] of [...timers]) if (timer.at <= now) {timers.delete(id); timer.fn();}
    };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', '{}');
    recordActivity();
    stop = watchSession(() => logoutCount++);
    advance(29 * 60 * 1000);
    assert.equal(logoutCount, 0);
    window.dispatchEvent(new Event('keydown'));
    advance(29 * 60 * 1000);
    assert.equal(isSessionIdle(), false);
    stop(); // Remounting or refreshing must retain the previous activity time.
    stop = watchSession(() => logoutCount++);
    advance(60 * 1000);
    assert.equal(localStorage.getItem('token'), null);
    assert.equal(localStorage.getItem('user'), null);
    assert.equal(logoutCount, 1);
    assert.deepEqual(revoked, ['Bearer test-token']);
    assert.match(sessionStorage.getItem('sadya.logoutReason'), /30 minutes/);
    stop();
    localStorage.setItem('token', 'sleep-token');
    recordActivity();
    stop = watchSession(() => logoutCount++);
    now += IDLE_TIMEOUT; // Browser sleep: timers have not fired.
    window.dispatchEvent(new Event('pointerdown'));
    assert.equal(localStorage.getItem('token'), null);
    assert.equal(logoutCount, 2);
    stop();
    localStorage.setItem('token', 'tab-token');
    recordActivity();
    stop = watchSession(() => logoutCount++);
    advance(20 * 60 * 1000);
    recordActivity(); // Activity in another tab.
    window.dispatchEvent(new Event('storage'));
    advance(20 * 60 * 1000);
    assert.equal(localStorage.getItem('token'), 'tab-token');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    assert.equal(logoutCount, 3);
    stop();
    assert.equal(timers.size, 0);
  } finally {
    stop();
    Date.now = originals.now;
    for (const key of Object.keys(originals).filter(key => key !== 'now')) {
      if (originals[key] === undefined) delete globalThis[key];
      else globalThis[key] = originals[key];
    }
  }
});
