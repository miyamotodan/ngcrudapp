import { ConfigLoaderService } from './appconfig.service';

export function PreloadFactory(configService: ConfigLoaderService) {
  return () => configService.initialize();
}