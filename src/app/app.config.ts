import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CoreModule, hookRoute, RouterModule } from '@c8y/ngx-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideAnimations(),
    importProvidersFrom(RouterModule.forRoot()),
    importProvidersFrom(CoreModule.forRoot()),
    hookRoute([
      {
        path: '',
        redirectTo: 'api-docs',
        pathMatch: 'full',
      },
    ]),
  ],
};
