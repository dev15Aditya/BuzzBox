import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpLink } from 'apollo-angular/http';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      
      return {
        link: httpLink.create({
          uri: 'http://localhost:3000/graphql'
        }),
        cache: new InMemoryCache()
      }
    })
  ]
};