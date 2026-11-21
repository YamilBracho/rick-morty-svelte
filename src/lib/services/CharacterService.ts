import type { HttpClient } from '../infrastructure/HttpClient';
import type { CharacterResponse } from '../models/Character';

export class CharacterService {

  constructor(private readonly httpClient: HttpClient) {}

  async getCharacters( page: number = 1 ): Promise<CharacterResponse> {
    const endPoint :string =  `/character?page=${page}`;
    return this.httpClient.get<CharacterResponse>(endPoint);
  }
}

