import { IExecuteFunctions } from 'n8n-workflow';
import { StratagemsHttpClient } from '../utils/httpClient';

export async function executeHealthCheck(
    this: IExecuteFunctions,
    itemIndex: number,
): Promise<any> {
    console.log('🩺 [Stratagems] Starting healthCheck operation...');

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, '');

    console.log('🩺 [Stratagems] API Configuration:', {
        formattedUrl: formattedBaseUrl
    });

    const client = new StratagemsHttpClient(this, itemIndex);
    const endpoint = '/api/v1/apps/health';
    const url = `${formattedBaseUrl}${endpoint}`;

    console.log('🩺 [Stratagems] Checking API health at:', url);

    try {
        const response = await client.get(url);

        if (!response.success) {
            throw new Error(`Health check failed: ${response.error || 'Unknown error'}`);
        }

        if (!response.data) {
            throw new Error('Health check response missing data field');
        }

        console.log('🩺 [Stratagems] Health check successful:', response.data);

        return response.data;
    } catch (error: any) {
        console.log('🩺 [Stratagems] Health check error:', error.message);

        return {
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}