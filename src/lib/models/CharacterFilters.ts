/**
 * represent filtering fields
 * 
 * Yamil Bracho
 * 2026-Nov-21
 */
export interface CharacterFilters {
  name?: string;
  status?: 'alive' | 'dead' | 'unknown';
  species?: string;
  type?: string;
  gender?: 'female' | 'male' | 'genderless' | 'unknown';
}
