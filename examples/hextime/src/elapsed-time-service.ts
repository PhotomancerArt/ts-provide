import { providerCtx } from '@photomancerart/ts-provide';

import { decodeTimestampToken, encodeTimestampToken } from './timestamp-token.js';
import type { TimeServiceCtx } from './time-service.js';

export type ElapsedTimeService = {
  issueTimestampToken(): Promise<string>;
  elapsedSecondsSince(token: string): Promise<number>;
};

export type ElapsedTimeServiceCtx = {
  elapsedTimeService: ElapsedTimeService;
};

export function provideElapsedTimeService() {
  return {
    elapsedTimeService: {
      async issueTimestampToken() {
        const nowMs = await providerCtx<TimeServiceCtx>().timeService.nowMs();
        return encodeTimestampToken(nowMs);
      },
      async elapsedSecondsSince(token: string) {
        const startMs = decodeTimestampToken(token);
        const nowMs = await providerCtx<TimeServiceCtx>().timeService.nowMs();
        return Math.max(0, Math.floor((nowMs - startMs) / 1000));
      },
    },
  };
}
