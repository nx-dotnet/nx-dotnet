import { execSync } from 'child_process';

export function getAffectedProjects(
  all = process.env.ALL === 'true',
  specific = process.env.SPECIFIC_PROJECT,
) {
  let projects = [];
  if (specific && specific !== 'null') {
    projects = [specific];
  } else {
    const cmd = `npx nx print-affected ${
      all ? '--all' : '--base="HEAD~1"'
    } --target="build" --select=tasks.target.project --with-deps`;

    console.log(cmd);

    const projectsStr = execSync(cmd).toString().trim();
    projects = projectsStr != '' ? projectsStr.split(', ') : [];
  }
  return projects;
}
