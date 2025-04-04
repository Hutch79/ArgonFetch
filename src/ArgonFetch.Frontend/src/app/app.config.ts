import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Configuration } from './api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    {
      provide: Configuration,
      useFactory: () => new Configuration({ basePath: environment.apiBaseUrl }),
    },
    provideRouter(routes)
  ]
};
