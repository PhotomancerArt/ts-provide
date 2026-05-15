import type { TimeService } from '../time-service.js';

export class RemoteTimeService implements TimeService {
  constructor(private readonly baseUrl: string) {}

  async nowMs() {
    const response = await fetch(new URL('/now', this.baseUrl));

    if (!response.ok) {
      throw new Error(`Failed to fetch remote time: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as { epochMs?: unknown };

    if (typeof body.epochMs !== 'number') {
      throw new Error('Remote time response did not include numeric epochMs');
    }

    return body.epochMs;
  }
}

export function provideRemoteTimeService(baseUrl: string) {
  return () => ({ timeService: new RemoteTimeService(baseUrl) });
}
