import { IApplication } from '@c8y/client';

export interface ApiDocApp extends IApplication {
  appLabel: string;
  downloadPath: string;
  manifest: {
    openApiSpec?: string;
    [key: string]: any;
  };
}
