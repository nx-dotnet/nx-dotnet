import { execSync } from 'child_process';
import { safeExecSync } from '@nx-dotnet/utils';

try {
  const version = safeExecSync('dotnet --version', { windowsHide: true })
    .toString('utf-8')
    .trim();
  console.info(
    `[nx-dotnet] .NET SDK ${version} will be used for .NET CLI commands`,
  );
} catch {
  console.warn(`[nx-dotnet] [WARN] .NET SDK NOT FOUND`);
}
