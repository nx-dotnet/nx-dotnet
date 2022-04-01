import { execSync } from 'child_process';

try {
  const version = execSync('dotnet --version').toString('utf-8').trim();
  console.info(
    `[nx-dotnet] .NET SDK ${version} will be used for .NET CLI commands`,
  );
} catch {
  console.warn(`[nx-dotnet] [WARN] .NET SDK NOT FOUND`);
}
