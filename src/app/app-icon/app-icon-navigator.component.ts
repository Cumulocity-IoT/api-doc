import { Component } from '@angular/core';
import { AppIconComponent } from '@c8y/ngx-components';

export function createAppIconComponent(app: any) {
  @Component({
    selector: 'api-app-icon-navigator',
    templateUrl: './app-icon-navigator.component.html',
    styleUrls: ['./app-icon-navigator.component.less'],
    standalone: true,
    imports: [AppIconComponent]
  })
  class AppIconNavigatorComponent {
    app = app;
  }

  return AppIconNavigatorComponent;
}
