import type { TimeService } from '../time-service.js';

export class LocalTimeService implements TimeService {
  async nowMs() {
    return Date.now();
  }
}

export function provideLocalTimeService() {
  return () => ({ timeService: new LocalTimeService() });
}
