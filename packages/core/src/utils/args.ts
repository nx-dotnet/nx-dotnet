export function isDryRun(): boolean {
    console.log(process.argv);
    return process.argv.some(x => x === '--dry-run');
}