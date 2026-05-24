import type { BenchmarkMetrics } from '@planara/types';

/** @public */
export type MetricsListener = (metrics: BenchmarkMetrics | null) => void;
