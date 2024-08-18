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
    return {
      CallExpression(node) {
        const { callee, arguments: args } = node;

        if (
          callee.type === 'Identifier' &&
          [
            'exec',
            'execSync',
            'execFile',
            'execFileSync',
            'spawn',
            'spawnSync',
          ].includes(callee.name)
        ) {
          let optionsArg;

          switch (callee.name) {
            case 'exec': // exec(command[, options][, callback])
            case 'execSync': // execSync(command[, options])
              optionsArg = args[1];
              break;

            case 'execFile': // execFile(file[, args][, options][, callback])
            case 'execFileSync': // execFileSync(file[, args][, options])
            case 'spawn': // spawn(command[, args][, options])
            case 'spawnSync': // spawnSync(command[, args][, options])
              optionsArg = args[2];
              break;
          }

          if (optionsArg && optionsArg.type === 'ObjectExpression') {
            const hideWindowsProperty = optionsArg.properties.find(
              (prop) =>
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'windowsHide' &&
                prop.value.type === 'Literal' &&
                prop.value.value === true,
            );
            if (!hideWindowsProperty) {
              context.report({ node, messageId: 'missingWindowsHide' });
            }
          } else {
            context.report({ node, messageId: 'missingWindowsHide' });
          }
        }
      },
    };
  },
});
