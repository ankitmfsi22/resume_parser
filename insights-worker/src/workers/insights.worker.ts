import { getChannel, QUEUES, startConsumer, type InsightsJobData } from '@resume-parser/shared';
import { recalculateInsights } from '../aggregations';

let pending = false;
let running = false;

async function processInsightsJob(): Promise<void> {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  try {
    await recalculateInsights();
    while (pending) {
      pending = false;
      await recalculateInsights();
    }
  } finally {
    running = false;
  }
}
export async function startInsightsWorker(): Promise<void> {
  await startConsumer<InsightsJobData>({
    channel: getChannel(),
    queue: QUEUES.INSIGHTS,
    handler: processInsightsJob,
  });
}
