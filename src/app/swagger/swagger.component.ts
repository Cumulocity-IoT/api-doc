import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FetchClient } from '@c8y/client';
import {
  ActionBarItemComponent,
  C8yTranslatePipe,
  IconDirective,
  TitleComponent,
  UserPreferencesService
} from '@c8y/ngx-components';
import { firstValueFrom, map, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';
import SwaggerUI from 'swagger-ui-dist/swagger-ui-es-bundle';
import { ApiDocService } from '../api-doc.service';

@Component({
  selector: 'api-swagger',
  templateUrl: './swagger.component.html',
  styleUrls: ['./swagger.component.less'],
  encapsulation: ViewEncapsulation.None,
  imports: [IconDirective, ActionBarItemComponent, C8yTranslatePipe, TitleComponent, AsyncPipe]
})
export class SwaggerComponent implements OnDestroy, AfterViewInit {
  @ViewChild('apiDocElement', { static: true }) apiDocElement: ElementRef | undefined;
  private fetchClient = inject(FetchClient);
  private activatedRoute = inject(ActivatedRoute);
  private apiDocService = inject(ApiDocService);
  private destroy$ = new Subject<void>();
  private userPreferences = inject(UserPreferencesService);

  shouldHideAlert$ = this.userPreferences.observe<boolean>('apiDocHideAuthAlert');
  spec$ = this.activatedRoute.paramMap.pipe(
    map(params => params.get('id')),
    switchMap(id => this.apiDocService.getApiDocById(id)),
    switchMap(app => {
      const specPath = app.downloadPath;
      const isYaml = specPath.endsWith('.yaml') || specPath.endsWith('.yml');
      return this.fetchClient
        .fetch(app.downloadPath)
        .then(response => (isYaml ? response.text() : response.json()))
        .then(data => ({ app, data, isYaml }));
    }),
    shareReplay(1)
  );

  hideAlert() {
    this.userPreferences.set('apiDocHideAuthAlert', true);
  }

  async downloadSpecFile() {
    const { app, data, isYaml } = await firstValueFrom(this.spec$);
    const content = isYaml ? data : JSON.stringify(data, null, 2);
    const mimeType = isYaml ? 'application/x-yaml' : 'application/json';
    const extension = isYaml ? 'yaml' : 'json';
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.name}-openapi-spec.${extension}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async ngAfterViewInit() {
    this.spec$.pipe(takeUntil(this.destroy$)).subscribe(({ app, data, isYaml }) => {
      SwaggerUI({
        ...(isYaml ? { url: app.downloadPath } : { spec: data }),
        domNode: this.apiDocElement?.nativeElement,
        requestInterceptor: (req: RequestInit) => {
          if (!req.headers) {
            req.headers = {};
          }

          const fetchOptions = this.fetchClient.getFetchOptions();
          Object.assign(req.headers, fetchOptions?.headers || {});
          return req;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
