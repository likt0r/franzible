// Initializes the `system-info` service on path `/system-info`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SystemInfo } from './system-info.class';
import hooks from './system-info.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'system-info': SystemInfo & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/system-info', new SystemInfo(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('system-info');

  service.hooks(hooks);
}
