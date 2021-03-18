import * as _glob from 'glob';


/**
 * Wraps the glob package in a promise api.
 * @returns array of file paths
 */
export function glob(path): Promise<string[]> {
    return new Promise((resolve, reject) => _glob(path, (err, matches) => err ? reject() : resolve(matches)))
}