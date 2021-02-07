import app from '../../src/app';

describe('\'progress\' service', () => {
  it('registered the service', () => {
    const service = app.service('progress');
    expect(service).toBeTruthy();
  });
});
