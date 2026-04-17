import { inject, Injectable } from '@angular/core';
import { ApplicationService } from '@c8y/client';
import { AppStateService, HumanizeAppNamePipe } from '@c8y/ngx-components';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take
} from 'rxjs';
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
      const appsOfCurrentUser$ = this.appStateService.currentUser.pipe(
        map(user => user?.id),
        distinctUntilChanged(),
        filter(userId => !!userId),
        switchMap(userId =>
          from(
            this.appService.listByUser(userId, {
              pageSize: 2000
            })
          )
        )
      );
      this.cache$ = combineLatest([
        appsOfCurrentUser$,
        this.appStateService.currentApplication,
        this.appStateService.currentTenant
      ]).pipe(
        map(([apps, currentApp, currentTenant]) => {
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
            coreApiDoc,
            currentTenant
          };
        }),
        switchMap(({ appsWithOpenApiSpec, coreApiDoc, currentTenant }) => {
          if (appsWithOpenApiSpec.length === 0) {
            return of([coreApiDoc] as ApiDocApp[]);
          }
          const appObservables: Observable<ApiDocApp>[] = [];
          for (const app of appsWithOpenApiSpec) {
            if (!app.name || !app.manifest) {
              continue;
            }

            const isSubscribedApp = currentTenant?.applications?.references?.some(
              ref => ref.application.id === app.id
            );
            if (!isSubscribedApp) {
              continue;
            }
            const openApiSpecSettings: string | { label: string; path: string }[] =
              app.manifest['openApiSpec'];

            const entriesForApp: { label: string; path: string }[] =
              typeof openApiSpecSettings === 'string'
                ? [{ label: app.name, path: openApiSpecSettings }]
                : openApiSpecSettings;

            appObservables.push(
              ...entriesForApp.map(entry =>
                this.humanize.transform(entry.label).pipe(
                  map(
                    humanizedName =>
                      ({
                        ...app,
                        id: `${app.id}-${entry.path}`,
                        appLabel: humanizedName,
                        downloadPath: `/service/${app.contextPath}/${entry.path}`
                      }) as ApiDocApp
                  )
                )
              )
            );
          }

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
