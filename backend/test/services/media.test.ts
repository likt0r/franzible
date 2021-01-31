import app from '../../src/app';

describe('\'media\' service', () => {
  it('registered the service', () => {
    const service = app.service('media-update');
    expect(service).toBeTruthy();
  });
});
