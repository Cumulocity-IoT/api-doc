import { inject, Injectable } from '@angular/core';
import { ApplicationService } from '@c8y/client';
import { AppStateService, HumanizeAppNamePipe } from '@c8y/ngx-components';
import { combineLatest, from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { ApiDocApp } from './api-doc-app.model';
import { sortBy } from 'lodash';
import { gettext } from '@c8y/ngx-components/gettext';

@Injectable({
  providedIn: 'root'
})
export class ApiDocService {
  private appService = inject(ApplicationService);
  private appStateService = inject(AppStateService);
  private humanize = inject(HumanizeAppNamePipe);
  private cache$: Observable<ApiDocApp[]> | null = null;

  private readonly CORE_API_DOCS_APP: ApiDocApp = {
    id: 'core-api',
    name: gettext('Core API'),
    description: gettext('Cumulocity IoT Core API Documentation'),
    contextPath: 'api-doc',
    downloadPath: './c8y-oas.yml',
    icon: {
      class: 'c8y-icon-cumulocity-iot'
    },
    manifest: {
      openApiSpec: 'c8y-oas.yml'
    },
    appLabel: gettext('Core API')
  };

  /**
   * Get all applications that have API documentation.
   * Results are cached and shared across subscribers.
   */
  getApiDocApps(): Observable<ApiDocApp[]> {
    if (!this.cache$) {
      this.cache$ = combineLatest([
        from(this.appService.list({ pageSize: 2000 })),
        this.appStateService.currentApplication
      ]).pipe(
        map(([apps, currentApp]) => {
          // Update coreApiDocApps with current app's contextPath
          const coreApiDoc: ApiDocApp = {
            ...this.CORE_API_DOCS_APP,
            contextPath: currentApp?.contextPath || 'api-doc'
          };

          // Filter apps with openApiSpec
          const appsWithOpenApiSpec = apps.data.filter(
            app => !!(app.manifest && app.manifest['openApiSpec'])
          );
          return {
            appsWithOpenApiSpec: sortBy(appsWithOpenApiSpec, app => app.name?.toLowerCase() || ''),
            coreApiDoc
          };
        }),
        switchMap(({ appsWithOpenApiSpec, coreApiDoc }) => {
          if (appsWithOpenApiSpec.length === 0) {
            return of([coreApiDoc] as ApiDocApp[]);
          }
          const appObservables = appsWithOpenApiSpec.map(app =>
            this.humanize.transform(app.name).pipe(
              map(
                humanizedName =>
                  ({
                    ...app,
                    appLabel: humanizedName,
                    downloadPath: `/service/${app.contextPath}/${app.manifest['openApiSpec']}`
                  }) as ApiDocApp
              )
            )
          );
          return combineLatest(appObservables).pipe(map(apiDocApps => [coreApiDoc, ...apiDocApps]));
        }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /**
   * Get a specific API doc app by ID.
   * Uses cached data if available, otherwise fetches all apps.
   */
  getApiDocById(id: string | number): Observable<ApiDocApp | undefined> {
    return this.getApiDocApps().pipe(
      take(1),
      map(apps => apps.find(app => app.id === id?.toString()))
    );
  }

  /**
   * Clear the cache and force a refresh on next call
   */
  clearCache(): void {
    this.cache$ = null;
  }
}
