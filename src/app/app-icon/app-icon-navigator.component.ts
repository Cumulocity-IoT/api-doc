import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppIconComponent } from '@c8y/ngx-components';

export function createAppIconComponent(app: any) {
  @Component({
    selector: 'api-app-icon-navigator',
    templateUrl: './app-icon-navigator.component.html',
    styleUrls: ['./app-icon-navigator.component.scss'],
    standalone: true,
    imports: [AppIconComponent],
    changeDetection: ChangeDetectionStrategy.Eager,
  })
  class AppIconNavigatorComponent {
    app = app;
  }

  return AppIconNavigatorComponent;
}
