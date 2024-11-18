import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

import { MatToolbarModule } from '@angular/material/toolbar';
import { ChatService } from './services/chat.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    MatToolbarModule,
    ChatService
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
