const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

export function verboseLog(log: any) {
    if(verbose) {
        console.log(log)
    }
}

export function isVerbose(): boolean {
  return verbose;
}
