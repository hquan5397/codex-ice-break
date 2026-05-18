import { dataSourceOptions } from '../../src/data-source';

describe('dataSourceOptions', () => {
  it('keeps TypeORM schema synchronization disabled for migrations', () => {
    expect(dataSourceOptions.synchronize).toBe(false);
  });

  it('loads migration files for the TypeORM CLI', () => {
    expect(dataSourceOptions.migrations).toEqual(
      expect.arrayContaining([expect.stringContaining('migrations')]),
    );
  });
});
