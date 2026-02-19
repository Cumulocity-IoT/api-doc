import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AppIconComponent,
  C8yTranslateDirective,
  ListGroupComponent,
  ListItemBodyComponent,
  ListItemComponent,
  ListItemFooterComponent,
  ListItemIconComponent,
  TitleComponent
} from '@c8y/ngx-components';
import { ApiDocService } from '../api-doc.service';

@Component({
  selector: 'api-doc-home',
  templateUrl: './api-doc-home.component.html',
  standalone: true,
  imports: [
    TitleComponent,
    ListGroupComponent,
    ListItemComponent,
    ListItemIconComponent,
    ListItemBodyComponent,
    ListItemFooterComponent,
    AsyncPipe,
    RouterLink,
    C8yTranslateDirective,
    AppIconComponent
  ]
})
export class ApiDocHomeComponent {
  private apiDocService = inject(ApiDocService);
  documentedApps$ = this.apiDocService.getApiDocApps();
}
