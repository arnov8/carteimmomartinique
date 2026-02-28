export function log(source: string, message: string) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] [${source}] ${message}`);
}

export function logError(source: string, message: string, error?: unknown) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.error(`[${timestamp}] [${source}] ❌ ${message}`);
  if (error instanceof Error) {
    console.error(`  → ${error.message}`);
  }
}

export function logProgress(source: string, current: number, total: number) {
  const pct = Math.round((current / total) * 100);
  const timestamp = new Date().toISOString().slice(11, 19);
  process.stdout.write(
    `\r[${timestamp}] [${source}] ${current}/${total} (${pct}%)`
  );
  if (current === total) process.stdout.write("\n");
}
