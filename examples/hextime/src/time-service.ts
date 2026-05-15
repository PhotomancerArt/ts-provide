export type TimeService = {
  nowMs(): Promise<number>;
};

export type TimeServiceCtx = {
  timeService: TimeService;
};

export function provideTimeService(timeService: TimeService) {
  return () => ({ timeService });
}
