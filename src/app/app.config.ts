// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    ReactiveFormsModule, provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(),  // Add this instead of provideReactiveForms
  ],
};
