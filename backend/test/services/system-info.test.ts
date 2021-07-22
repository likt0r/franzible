import app from '../../src/app';

describe('\'system-info\' service', () => {
  it('registered the service', () => {
    const service = app.service('system-info');
    expect(service).toBeTruthy();
  });
});
