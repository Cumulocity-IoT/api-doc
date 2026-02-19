import { inject, Injectable } from '@angular/core';
import { ExtensionFactory, NavigatorNode } from '@c8y/ngx-components';
import { map, Observable } from 'rxjs';
import { ApiDocApp } from './api-doc-app.model';
import { ApiDocService } from './api-doc.service';
import { gettext } from '@c8y/ngx-components/gettext';
import { createAppIconComponent } from './app-icon/app-icon-navigator.component';

@Injectable({
  providedIn: 'root'
})
export class ApiDocNavigatorFactory implements ExtensionFactory<NavigatorNode> {
  private apiDocService = inject(ApiDocService);

  get(): Observable<NavigatorNode> {
    return this.apiDocService.getApiDocApps().pipe(
      map(apps => {
        return new NavigatorNode({
          path: 'api-docs',
          icon: 'api',
          label: gettext('API Documentation'),
          priority: 1000,
          children: apps.map(
            (app: ApiDocApp, index: number) =>
              new NavigatorNode({
                label: app.appLabel,
                iconComponent: createAppIconComponent(app),
                path: `/api-docs/${app.id}`,
                priority: index * -1
              })
          )
        });
      })
    );
  }
}
