import { IExecuteFunctions } from 'n8n-workflow';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    details?: any;
}

export interface HttpClientOptions {
    timeout?: number;
    retryOnFailure?: number;
    retryDelay?: number;
}

export class StratagemsHttpClient {
    constructor(
        private executeFunctions: IExecuteFunctions,
        private itemIndex: number,
        private options: HttpClientOptions = {},
    ) { }

    async request<T = any>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data?: any,
    ): Promise<ApiResponse<T>> {
        const { timeout = 30000, retryOnFailure = 3, retryDelay = 1000 } = this.options;
        let lastError: any;

        for (let attempt = 0; attempt <= retryOnFailure; attempt++) {
            try {
                const response = await this.executeFunctions.helpers.httpRequest({
                    method,
                    url: endpoint,
                    body: data,
                    timeout,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                return response as ApiResponse<T>;
            } catch (error: any) {
                lastError = error;

                // Don't retry on client errors (4xx) except for rate limiting
                if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
                    throw this.formatError(error);
                }

                // Don't retry on last attempt
                if (attempt === retryOnFailure) {
                    throw this.formatError(error);
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        throw this.formatError(lastError);
    }

    private formatError(error: any): Error {
        if (error.response?.data) {
            const apiError = error.response.data;
            return new Error(
                `API Error (${error.response.status}): ${apiError.error || 'Unknown error'} - Code: ${apiError.code || 'UNKNOWN'}`,
            );
        }

        if (error.code === 'ECONNABORTED') {
            return new Error('Request timeout - the server took too long to respond');
        }

        if (error.code === 'ENOTFOUND') {
            return new Error('Host not found - check your Host URL configuration');
        }

        if (error.code === 'ECONNREFUSED') {
            return new Error('Connection refused - check if the server is running');
        }

        return new Error(`Network error: ${error.message || 'Unknown error'}`);
    }

    // Helper methods for common operations
    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>('GET', endpoint);
    }

    async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>('POST', endpoint, data);
    }

    async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', endpoint, data);
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', endpoint);
    }
}

// Utility functions for building endpoints
export function buildSetEndpoint(setName: string, operation?: string): string {
    const base = `/api/v1/sets/${encodeURIComponent(setName)}`;
    return operation ? `${base}/${operation}` : base;
}

export function buildLookupEndpoint(lookupName: string, operation?: string): string {
    const base = `/api/v1/lookups/${encodeURIComponent(lookupName)}`;
    return operation ? `${base}/${operation}` : base;
}

export function buildAppEndpoint(operation?: string): string {
    const base = '/api/v1/apps';
    return operation ? `${base}/${operation}` : base;
}

// Utility functions for metadata handling
export function buildMetadata(
    item: any,
    includeTimestamp: boolean = true,
    additionalFields: string[] = [],
): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (includeTimestamp) {
        metadata.timestamp = new Date().toISOString();
    }

    for (const field of additionalFields) {
        if (item[field] !== undefined) {
            metadata[field] = item[field];
        }
    }

    return metadata;
}

// Utility functions for validation
export function validateSetName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new Error('Set name is required and must be a string');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        throw new Error('Set name can only contain letters, numbers, hyphens, and underscores');
    }

    if (name.length > 100) {
        throw new Error('Set name cannot exceed 100 characters');
    }
}

export function validateLookupName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new Error('Lookup name is required and must be a string');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        throw new Error('Lookup name can only contain letters, numbers, hyphens, and underscores');
    }

    if (name.length > 100) {
        throw new Error('Lookup name cannot exceed 100 characters');
    }
}

export function validateValue(value: string): void {
    if (!value || typeof value !== 'string') {
        throw new Error('Value is required and must be a string');
    }

    if (value.length > 255) {
        throw new Error('Value cannot exceed 255 characters');
    }
} 