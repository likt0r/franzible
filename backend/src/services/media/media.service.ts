// Initializes the `media` service on path `/media-update`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Media } from './media.class';
import hooks from './media.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'media-update': Media & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/media-update', new Media(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('media-update');

  service.hooks(hooks);
}
