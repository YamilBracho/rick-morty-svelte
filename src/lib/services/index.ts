
import { HttpClient } from '../infrastructure/HttpClient';
import { CharacterService } from './CharacterService';

const httpClient = new HttpClient(
  'https://rickandmortyapi.com/api'
);

export const characterService =
  new CharacterService(httpClient);
