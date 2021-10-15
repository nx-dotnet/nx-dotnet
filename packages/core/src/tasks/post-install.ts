import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

try {
  const client = new DotNetClient(dotnetFactory());
  const sdkVersion = client.printSdkVersion();
  console.info(
    `[nx-dotnet] .NET SDK ${sdkVersion} will be used for .NET CLI commands`,
  );
} catch {
  console.warn(`[nx-dotnet] [WARN] .NET SDK NOT FOUND`);
}
