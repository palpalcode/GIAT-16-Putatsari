import type { IncomingMessage, ServerResponse } from "http";
import app from "../artifacts/api-server/src/app";
import { ensureMembersSeeded, ensureSeeded } from "../artifacts/api-server/src/lib/auth";
import { logger } from "../artifacts/api-server/src/lib/logger";

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
  return app(req, res);
}
