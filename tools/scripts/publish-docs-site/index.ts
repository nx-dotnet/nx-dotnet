import { joinPathFragments } from "@nrwl/devkit";
import { execSync } from "child_process";

if (require.main === module) {
    const path = joinPathFragments(__dirname, '../../../dist/apps/docs-site');
    execSync('git init && git checkout -b "gh-pages" && git add . && git commit -m "chore: deploy docs site" && git remote add origin https://github.com/nx-dotnet/nx-dotnet && git push -f --set-upstream origin gh-pages', {cwd: path, stdio: 'inherit'})
}