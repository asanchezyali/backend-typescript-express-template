// filepath: /Users/nemesis/Documents/JobAplications/growth-x/growthx-app/src/types/autocannon.types.ts
import type { Result as AutocannonResult, Instance } from 'autocannon';

export type SafeAutocannon = AutocannonResult & {
  '1xx': number;
  '2xx': number;
  '3xx': number;
  '4xx': number;
  '5xx': number;
  connections: number;
  duration: number;
  errors: number;
  finish: Date;
  latency: {
    average: number;
    max: number;
    mean: number;
    min: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
    p999: number;
    stddev: number;
  };
  non2xx: number;
  pipelining: number;
  requests: {
    average: number;
    max: number;
    mean: number;
    min: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
    p999: number;
    sent: number;
    stddev: number;
    total: number;
  };
  samples: unknown[];
  socketPath?: string;
  start: Date;
  startTime: number;
  statusCodeStats: Record<number, number>;
  throughput: {
    average: number;
    max: number;
    mean: number;
    min: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
    p999: number;
    stddev: number;
    total: number;
  };
  timeouts: number;
  title: string;
  url: string;
  wasUnavailable: boolean;
};

export type SafeInstance = Instance & {
  on: (event: string, callback: (result: SafeAutocannon) => void) => void;
  track: (instance: SafeInstance, opts?: { renderProgressBar?: boolean }) => void;
};
