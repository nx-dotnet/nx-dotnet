export function isDryRun(): boolean {
    return process.argv.some(x => x === '--dry-run');
}