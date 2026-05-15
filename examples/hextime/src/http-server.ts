import { createServer } from 'node:http';

import { providerCtx, runWithProvider } from '@photomancerart/ts-provide';

import { buildAppProvider } from './app-provider.js';
import type { ElapsedTimeServiceCtx } from './elapsed-time-service.js';

const port = Number(process.env.PORT ?? 3017);
const provider = buildAppProvider();

const server = createServer(async (req, res) => {
  try {
    await runWithProvider(
      provider,
      async () => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `localhost:${port}`}`);

        if (req.method === 'GET' && url.pathname === '/now') {
          sendJson(res, 200, { epochMs: Date.now() });
          return;
        }

        if (req.method === 'POST' && url.pathname === '/timestamps') {
          const token = await providerCtx<ElapsedTimeServiceCtx>().elapsedTimeService.issueTimestampToken();
          sendJson(res, 201, { token });
          return;
        }

        if (req.method === 'GET' && url.pathname === '/elapsed') {
          const token = url.searchParams.get('token');
          if (!token) {
            sendJson(res, 400, { error: 'Missing token query parameter' });
            return;
          }

          const elapsedSeconds =
            await providerCtx<ElapsedTimeServiceCtx>().elapsedTimeService.elapsedSecondsSince(token);
          sendJson(res, 200, { elapsedSeconds });
          return;
        }

        sendJson(res, 404, { error: 'Not found' });
      },
      undefined,
    );
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(port, () => {
  console.log(`hextime listening on http://localhost:${port}`);
});

function sendJson(res: { writeHead(status: number, headers: Record<string, string>): void; end(body: string): void }, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}
