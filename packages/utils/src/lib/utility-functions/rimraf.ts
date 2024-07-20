import { unlink } from 'node:fs/promises'; // Import the unlink function from node:fs/promises

/**
 * An asynchronous function that deletes a file or directory at the given path.
 * @param path - The path to the file or directory to be deleted.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function rimraf(path: string): Promise<void> {
  try {
    await unlink(path); // Use the unlink function to delete the file
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting file: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    throw error; // Re-throw the error after logging it
  }
}
