import { TSESLint } from '@typescript-eslint/utils';
import { rule, RULE_NAME } from './no-terminal-popups';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `exec('dotnet --version', { windowsHide: true })`,
    `execSync('dotnet --version', { windowsHide: true })`,
    `spawn('dotnet --version', [], { windowsHide: true })`,
    `spawnSync('dotnet --version', params, { windowsHide: true });`,
    `execFile(file, args, { windowsHide: true });`,
    `execFileSync(file, args, { windowsHide: true });`,
    `promisify(exec)('dotnet --version', { windowsHide: true })`,
    `promisify(execFile)(file, args, { windowsHide: true })`,
  ],
  invalid: [
    {
      code: `exec('dotnet --version', { windowsHide: false });`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `execSync('dotnet --version');`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `spawn('dotnet --version', [], { stdio: 'inherit' });`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `spawnSync('dotnet --version', params, { windowsHide: false });`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `execFile(file, args);`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `execFileSync(file, args);`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `promisify(exec)('dotnet --version', { windowsHide: false })`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
    {
      code: `promisify(execFile)(file, args)`,
      errors: [
        {
          messageId: 'missingWindowsHide',
        },
      ],
    },
  ],
});
