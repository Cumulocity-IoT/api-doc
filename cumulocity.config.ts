import type { ConfigurationOptions } from '@c8y/devkit';
import { author, description, version, name, license } from './package.json';
import { gettext } from '@c8y/ngx-components/gettext';

const appName = name.replace('@c8y/', '');

export default {
  runTime: {
    author,
    description,
    version,
    name: appName,
    dynamicOptionsUrl: true,
    isPackage: true,
    license,
    package: 'blueprint',
    icon: {
      class: 'rest-api'
    },
    remotes: {
      [appName]: ['apiDocProviders']
    },
    blueprintDeploymentOptions: {
      name: gettext('API Documentation'),
      contextPath: 'api_doc',
      key: 'api_doc-application-key'
    },
    label: 'OFFICIAL',
    availability: 'SHARED',
    exports: [
      {
        name: gettext('API Documentation'),
        module: 'apiDocProviders',
        path: './src/app/api-doc.providers',
        description: gettext('A tool to view API documentation of installed applications.')
      }
    ]
  },
  buildTime: {
    skipMonacoLanguageSupport: true,
    federation: [
      '@angular/animations',
      '@angular/cdk',
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',
      '@c8y/client',
      '@c8y/ngx-components',
      'ngx-bootstrap',
      '@ngx-translate/core',
      '@ngx-formly/core'
    ]
  }
} as const satisfies ConfigurationOptions;
