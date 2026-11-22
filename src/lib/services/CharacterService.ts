import type { CharacterFilters } from "#lib/models/CharacterFilters.ts";
import type { HttpClient } from "../infrastructure/HttpClient";
import type { CharacterResponse } from "../models/Character";

export class CharacterService {
  private readonly cache = new Map<string, CharacterResponse>();

  constructor(private readonly httpClient: HttpClient) {}

  private createCacheKey(page: number, filters?: CharacterFilters): string {
    const params = new URLSearchParams();

    params.append("page", String(page));

    if (filters?.name) params.append("name", filters.name);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.species) params.append("species", filters.species);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.gender) params.append("gender", filters.gender);

    return params.toString();
  }

  async getCharacters(
    page: number = 1,
    filters?: CharacterFilters,
  ): Promise<CharacterResponse> {
    //const endPoint :string =  `/character?page=${page}`;

    const cacheKey = this.createCacheKey(page, filters);
    
    // Consultar caché
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
       return cachedResponse;
    }

    // Si no existe, consultar API
    try {
      const endpoint = `/character?${cacheKey}`;
      const response = await this.httpClient.get<CharacterResponse>(endpoint);

      // Almacenar respuesta exitosa
      this.cache.set(cacheKey, response);
      return response;
    } catch(error) {
      // Un 404 significa que no existen coincidencias
      if (error instanceof Error && error.message.includes('404')) {
        const emptyResponse: CharacterResponse = {
          info: {
            count: 0,
            pages: 0,
            next: null,
            prev: null,
          },
          results: [],
        };

        // También almacenamos el resultado vacío en caché
        this.cache.set(cacheKey, emptyResponse);

        return emptyResponse;      
      }
    }
  }
}
