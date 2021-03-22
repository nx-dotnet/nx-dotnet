export function isDryRun() {
  return process.argv.includes('--dry-run');
}
