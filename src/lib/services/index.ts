/**
 * Permite exponenr HttpClient y ImageDownloadQueue como dependencias
 * a ser injectadas
 */

import { HttpClient } from '../infrastructure/HttpClient';
import { ImageDownloadQueue } from '../infrastructure/ImageDownloadQueue';

import { CharacterService } from './CharacterService';
import { ImageCacheService } from './ImageCacheService';

const httpClient = new HttpClient('https://rickandmortyapi.com/api');
export const characterService = new CharacterService(httpClient);

const imageDownloadQueue = new ImageDownloadQueue(2, 500);
export const imageCacheService = new ImageCacheService(imageDownloadQueue);
