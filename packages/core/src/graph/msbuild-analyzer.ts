import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, relative, resolve, dirname } from 'path';
import { workspaceRoot } from '@nx/devkit';

export interface ProjectAnalysis {
  path: string;
  evaluatedProperties: Record<string, string>;
  packageReferences: Array<{
    Include: string;
    Version?: string;
  }>;
  projectReferences: string[];
}

interface AnalyzerCache {
  hash: string;
  results: Map<string, ProjectAnalysis>;
}

let cache: AnalyzerCache | null = null;

/**
 * Get the path to the msbuild-analyzer executable
 */
function getAnalyzerPath(): string {
  // The analyzer is built to dist/msbuild-analyzer/net7.0/
  const analyzerPath = join(
    workspaceRoot,
    'dist',
    'msbuild-analyzer',
    'net7.0',
    'msbuild-analyzer',
  );

  if (!existsSync(analyzerPath)) {
    throw new Error(
      `msbuild-analyzer not found at ${analyzerPath}. Please build it first with: cd msbuild-analyzer && dotnet build`,
    );
  }

  return analyzerPath;
}

/**
 * Calculate a hash of all project files to determine if we need to re-analyze
 */
function calculateProjectFilesHash(projectFiles: string[]): string {
  const hash = createHash('sha256');
  
  // Sort files to ensure consistent ordering
  const sortedFiles = [...projectFiles].sort();
  
  for (const file of sortedFiles) {
    const fullPath = join(workspaceRoot, file);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf-8');
      hash.update(file);
      hash.update(content);
    }
  }
  
  return hash.digest('hex');
}

/**
 * Run the msbuild-analyzer and return the results
 */
function runAnalyzer(projectFiles: string[]): ProjectAnalysis[] {
  if (projectFiles.length === 0) {
    return [];
  }

  const analyzerPath = getAnalyzerPath();
  
  // Convert relative paths to absolute paths for the analyzer
  const absolutePaths = projectFiles.map((f) => join(workspaceRoot, f));
  
  // Set environment variables for the analyzer process
  const env = { ...process.env };
  
  // On macOS/Linux, set library path to help find libhostfxr.dylib
  if (process.platform === 'darwin' || process.platform === 'linux') {
    const dotnetRoot = process.env.DOTNET_ROOT || '/usr/local/share/dotnet';
    const hostFxrPath = join(dotnetRoot, 'host', 'fxr');
    
    if (existsSync(hostFxrPath)) {
      const versions = readdirSync(hostFxrPath);
      if (versions.length > 0) {
        // Use the latest version
        const latestVersion = versions.sort().reverse()[0];
        const fxrDir = join(hostFxrPath, latestVersion);
        
        const envVar = process.platform === 'darwin' ? 'DYLD_FALLBACK_LIBRARY_PATH' : 'LD_LIBRARY_PATH';
        const currentValue = env[envVar];
        env[envVar] = currentValue ? `${fxrDir}:${currentValue}` : fxrDir;
      }
    }
  }

  try {
    const output = execFileSync(analyzerPath, absolutePaths, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env,
    });
    
    return JSON.parse(output) as ProjectAnalysis[];
  } catch (error) {
    const err = error as { stderr?: string; message: string };
    if (err.stderr) {
      console.error('msbuild-analyzer error:', err.stderr);
    }
    throw new Error(
      `Failed to run msbuild-analyzer: ${err.message}\n${err.stderr || ''}`,
    );
  }
}

/**
 * Get project analysis results for the given project files.
 * Results are cached based on the content hash of all project files.
 */
export function analyzeProjects(projectFiles: string[]): Map<string, ProjectAnalysis> {
  const hash = calculateProjectFilesHash(projectFiles);
  
  // Return cached results if the hash matches
  if (cache && cache.hash === hash) {
    return cache.results;
  }
  
  // Run the analyzer
  const results = runAnalyzer(projectFiles);
  
  // Build a map keyed by relative path for easy lookup
  const resultsMap = new Map<string, ProjectAnalysis>();
  for (const result of results) {
    const relativePath = relative(workspaceRoot, result.path);
    resultsMap.set(relativePath, result);
  }
  
  // Update cache
  cache = {
    hash,
    results: resultsMap,
  };
  
  return resultsMap;
}

/**
 * Get analysis for a single project file.
 * This will use the cached results if available.
 */
export function getProjectAnalysis(
  projectFile: string,
  allProjectFiles?: string[],
): ProjectAnalysis | undefined {
  // If we have cached results, try to find it there first
  if (cache) {
    const analysis = cache.results.get(projectFile);
    if (analysis) {
      return analysis;
    }
  }
  
  // If we have all project files, analyze them all at once
  if (allProjectFiles && allProjectFiles.length > 0) {
    const results = analyzeProjects(allProjectFiles);
    return results.get(projectFile);
  }
  
  // Otherwise, analyze just this one file
  const results = analyzeProjects([projectFile]);
  return results.get(projectFile);
}

/**
 * Resolve a project reference path to an absolute path
 */
export function resolveProjectReference(
  reference: string,
  sourceFile: string,
): string {
  const sourceDir = dirname(join(workspaceRoot, sourceFile));
  const absolutePath = resolve(sourceDir, reference);
  return relative(workspaceRoot, absolutePath);
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  cache = null;
}
