import type { TimeService } from '../time-service.js';

export class DebugTimeService implements TimeService {
  constructor(private currentMs = 0) {}

  set(epochMs: number) {
    this.currentMs = epochMs;
  }

  tick(durationMs: number) {
    this.currentMs += durationMs;
  }

  async nowMs() {
    return this.currentMs;
  }
}

export function provideDebugTimeService(debugTimeService = new DebugTimeService()) {
  return () => ({
    debugTimeService,
    timeService: debugTimeService,
  });
}
