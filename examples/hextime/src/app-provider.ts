import { Providers, type ProviderLike } from '@photomancerart/ts-provide';

import { provideElapsedTimeService } from './elapsed-time-service.js';
import { provideLocalTimeService } from './services/local-time-service.js';
import type { TimeServiceCtx } from './time-service.js';

export function buildAppProvider(timeProvider: ProviderLike<void, TimeServiceCtx> = provideLocalTimeService()) {
  return Providers(timeProvider, provideElapsedTimeService);
}
