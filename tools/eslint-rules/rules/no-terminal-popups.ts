import { ESLintUtils } from '@typescript-eslint/utils';

export const RULE_NAME = 'no-terminal-popups';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Enforce setting the windowsHide option to true for all child processes to hide the subprocess console window on Windows systems.`,
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      missingWindowsHide:
        '`windowsHide: true` should be specified to avoid Terminal popups on Windows',
    },
  },
  defaultOptions: [],
  create(context) {
    const childProcessMethods = new Set([
      'exec',
      'execSync',
      'execFile',
      'execFileSync',
      'spawn',
      'spawnSync',
    ]);

    const checkWindowsHide = (fnName: string, args: any[]) => {
      let optionsArg;

      switch (fnName) {
        case 'exec':
        case 'execSync':
          optionsArg = args[1]; // for exec command
          break;
        case 'execFile':
        case 'execFileSync':
        case 'spawn':
        case 'spawnSync':
          optionsArg = args[2]; // for execFile / spawn command
          break;
      }

      if (optionsArg && optionsArg.type === 'ObjectExpression') {
        const hideWindowsProperty = optionsArg.properties.find(
          (prop: any) =>
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'windowsHide' &&
            prop.value.type === 'Literal' &&
            prop.value.value === true,
        );
        return !!hideWindowsProperty;
      }
      return false;
    };

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'Identifier' &&
          childProcessMethods.has(callee.name)
        ) {
          const includeWindowsHide = checkWindowsHide(
            (node.callee as any).name,
            node.arguments,
          );
          if (!includeWindowsHide) {
            context.report({ node, messageId: 'missingWindowsHide' });
          }
        } else if (
          callee.type === 'CallExpression' &&
          callee.callee.type === 'Identifier' &&
          callee.callee.name === 'promisify' &&
          callee.parent.type === 'CallExpression' &&
          callee.arguments?.length > 0 &&
          callee.arguments[0].type === 'Identifier' &&
          childProcessMethods.has(callee.arguments[0].name)
        ) {
          const includeWindowsHide = checkWindowsHide(
            callee.arguments[0].name,
            callee.parent.arguments,
          );
          if (!includeWindowsHide) {
            context.report({ node, messageId: 'missingWindowsHide' });
          }
        }
      },
    };
  },
});
