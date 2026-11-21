/**
 * Represents a custom types used in this application.
 * Basically they are DTOs.
 * 
 *
 * Author Yamil Bracho
 * 2026-Nov-11
*/

// Character response
export interface Character {
    id: number;
    name: string;
    status: 'Alive' | 'Dead' | 'unknown';
    species: string;
    type: string;
    gender: string;
    origin: {
        name: string;
        url: string;
    };
    location: {
        name: string;
        url: string;
    };
    image: string;
    episode: string[];
    url: string;
    created: string;
}

// Api Info response
export interface ApiInfo {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
}

// Combined response
export interface CharacterResponse {
    info: ApiInfo;
    results: Character[];
}