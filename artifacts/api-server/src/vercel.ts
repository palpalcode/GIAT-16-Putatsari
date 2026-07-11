import type { IncomingMessage, ServerResponse } from "http";
import app from "./app";
import { ensureMembersSeeded, ensureSeeded } from "./lib/auth";
import { logger } from "./lib/logger";

let bootstrapPromise: Promise<void> | null = null;

function bootstrap() {
  bootstrapPromise ??= ensureSeeded()
    .then(() => ensureMembersSeeded())
    .catch((err) => {
      bootstrapPromise = null;
      logger.error({ err }, "Vercel bootstrap failed");
      throw err;
    });

  return bootstrapPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await bootstrap();
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(
    req,
    res,
  );
}
