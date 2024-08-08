import { UserConfig } from 'vitest/config';

const config: UserConfig = {
  test: {
    include: ['**/*.spec.ts'],
    globals: true,
  },
};

export default config;
