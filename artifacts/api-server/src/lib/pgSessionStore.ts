import session, { type SessionData } from "express-session";
import { pool } from "@workspace/db";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let tableReady: Promise<void> | null = null;

function ensureSessionTable(): Promise<void> {
  const ready = tableReady ??= pool
    .query(`
      CREATE TABLE IF NOT EXISTS app_sessions (
        sid text PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamptz NOT NULL
      )
    `)
    .then(() => undefined);

  return ready;
}

function getExpiry(sess: SessionData) {
  const maxAge = sess.cookie?.maxAge;
  if (typeof maxAge === "number" && maxAge > 0) {
    return new Date(Date.now() + maxAge);
  }
  return new Date(Date.now() + DEFAULT_TTL_MS);
}

export class PgSessionStore extends session.Store {
  override get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void,
  ): void {
    ensureSessionTable()
      .then(() =>
        pool.query<{ sess: SessionData }>(
          "SELECT sess FROM app_sessions WHERE sid = $1 AND expire > now()",
          [sid],
        ),
      )
      .then((result) => callback(null, result.rows[0]?.sess ?? null))
      .catch((err) => callback(err));
  }

  override set(
    sid: string,
    sess: SessionData,
    callback?: (err?: unknown) => void,
  ): void {
    ensureSessionTable()
      .then(() =>
        pool.query(
          `
            INSERT INTO app_sessions (sid, sess, expire)
            VALUES ($1, $2, $3)
            ON CONFLICT (sid)
            DO UPDATE SET sess = excluded.sess, expire = excluded.expire
          `,
          [sid, sess, getExpiry(sess)],
        ),
      )
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  override destroy(sid: string, callback?: (err?: unknown) => void): void {
    ensureSessionTable()
      .then(() => pool.query("DELETE FROM app_sessions WHERE sid = $1", [sid]))
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  override touch(
    sid: string,
    sess: SessionData,
    callback?: (err?: unknown) => void,
  ): void {
    ensureSessionTable()
      .then(() =>
        pool.query("UPDATE app_sessions SET expire = $2 WHERE sid = $1", [
          sid,
          getExpiry(sess),
        ]),
      )
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }
}
