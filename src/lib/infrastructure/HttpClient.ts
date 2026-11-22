/**
 * Generic Call HTTP API
 * the signal parameter is sent by tanStack as a Cancellation
 * return Promise<T> or Error
 * add another methods as it will be needed.
 * Author Yamil Bracho
 * 2026-Nov-11
 */
export class HttpClient {

    constructor(private readonly baseUrl : string) {

    }

    async get<T>(endpoint: string): Promise<T> {

        const response = await fetch(
            `${this.baseUrl}${endpoint}`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status} - ${response.statusText}`
            );
        }

         const data: T = await response.json();
        return data;
    }
};