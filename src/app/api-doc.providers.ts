import { hookNavigator, hookRoute } from '@c8y/ngx-components';
import { ApiDocNavigatorFactory } from './api-doc-navigator.factory';

export const apiDocProviders = [
  hookRoute([
    {
      path: 'api-docs',
      loadComponent: () =>
        import('./api-doc-home/api-doc-home.component').then(m => m.ApiDocHomeComponent)
    },
    {
      path: 'api-docs/:id',

      loadComponent: () => import('./swagger/swagger.component').then(m => m.SwaggerComponent)
    }
  ]),
  hookNavigator(ApiDocNavigatorFactory)
];
