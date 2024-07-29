import { ExecutorContext } from '@nx/devkit';
import { findDefaultBuildDirectory } from './executor';

const buildContext = (
  options: Partial<ExecutorContext> = {},
): ExecutorContext => ({
  root: '/root',
  cwd: '/root',
  isVerbose: false,
  ...options,
});

describe('findDefaultBuildDirectory', () => {
  it('should throw an error if target project is not found', () => {
    const context = buildContext();
    expect(() => findDefaultBuildDirectory(context)).toThrowError(
      'No target project found. Specify `directory` option manually.',
    );
  });

  it('should throw an error if project configuration is not found', () => {
    const context = buildContext({
      projectName: 'my-project',
      projectGraph: { nodes: {}, dependencies: {} },
    });
    expect(() => findDefaultBuildDirectory(context)).toThrowError(
      'Project configuration not found. Specify `directory` option manually.',
    );
  });

  it('should throw an error if build configuration is not found', () => {
    const context = buildContext({
      projectName: 'my-project',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: { root: 'apps/my-project', targets: {} },
          },
        },
      },
    });
    expect(() => findDefaultBuildDirectory(context)).toThrowError(
      'No build configuration found. Specify `directory` option manually.',
    );
  });

  it('should return the output path from default configuration if available', () => {
    const context = buildContext({
      projectName: 'my-project',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {
                    production: {
                      outputPath: 'dist/my-project',
                    },
                  },
                  options: {
                    outputPath: 'dist/default',
                  },
                },
              },
            },
          },
        },
      },
    });
    const result = findDefaultBuildDirectory(context);
    expect(result).toBe('dist/my-project');
  });

  it('should return the configuration-specific output path if available', () => {
    const context = buildContext({
      projectName: 'my-project',
      configurationName: 'someConfiguration',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {
                    production: {
                      outputPath: 'dist/prod',
                    },
                    someConfiguration: {
                      outputPath: 'dist/someConfiguration',
                    },
                  },
                  options: {
                    outputPath: 'dist/default',
                  },
                },
              },
            },
          },
        },
      },
    });
    const result = findDefaultBuildDirectory(context);
    expect(result).toBe('dist/someConfiguration');
  });

  it('should return the default configurations output path if configuration-specific output path is not available', () => {
    const context = buildContext({
      projectName: 'my-project',
      configurationName: 'staging',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {
                    production: {
                      outputPath: 'dist/my-project',
                    },
                  },
                  options: {
                    outputPath: 'dist/default',
                  },
                },
              },
            },
          },
        },
      },
    });
    const result = findDefaultBuildDirectory(context);
    expect(result).toBe('dist/my-project');
  });

  it('should return the base level output path if no configuration-specific or default output path is available', () => {
    const context = buildContext({
      projectName: 'my-project',
      configurationName: 'staging',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {},
                  options: {
                    outputPath: 'dist/default',
                  },
                },
              },
            },
          },
        },
      },
    });
    const result = findDefaultBuildDirectory(context);
    expect(result).toBe('dist/default');
  });

  it('should throw an error if multiple outputs are found', () => {
    const context = buildContext({
      projectName: 'my-project',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {},
                  outputs: ['dist/output1', 'dist/output2'],
                },
              },
            },
          },
        },
      },
    });
    expect(() => findDefaultBuildDirectory(context)).toThrowError(
      'Multiple outputs found. Specify `directory` option manually.',
    );
  });

  it('should throw an error if no output directory can be determined', () => {
    const context = buildContext({
      projectName: 'my-project',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {},
                  outputs: [],
                },
              },
            },
          },
        },
      },
    });
    expect(() => findDefaultBuildDirectory(context)).toThrowError(
      'Unable to determine output directory. Specify `directory` option manually.',
    );
  });

  it('should select only output if there is a single output', () => {
    const context = buildContext({
      projectName: 'my-project',
      projectGraph: {
        dependencies: {},
        nodes: {
          'my-project': {
            name: 'my-project',
            type: 'app',
            data: {
              root: 'apps/my-project',
              targets: {
                build: {
                  defaultConfiguration: 'production',
                  configurations: {},
                  outputs: ['dist/output1'],
                },
              },
            },
          },
        },
      },
    });
    const result = findDefaultBuildDirectory(context);
    expect(result).toBe('dist/output1');
  });
});
