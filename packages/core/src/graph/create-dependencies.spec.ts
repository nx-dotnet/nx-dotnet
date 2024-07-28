import { workspaceRoot } from '@nx/devkit';
import { resolveReferenceToProject } from './create-dependencies';

describe('createDependencies', () => {
  describe('resolveReferenceToProject', () => {
    it('should find project in rootMap', () => {
      expect(
        resolveReferenceToProject(
          '../../libs/my-lib/MyLib.csproj',
          'apps/my-app/MyApp.csproj',
          {
            'libs/my-lib': 'my-lib',
            'apps/my-app': 'my-app',
          },
          {
            workspaceRoot,
          },
        ),
      ).toEqual('my-lib');
    });
  });
});
