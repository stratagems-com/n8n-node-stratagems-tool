import { IExecuteFunctions } from 'n8n-workflow';
import { StratagemsHttpClient } from '../utils/httpClient';

export async function executeGetAppInfo(
    this: IExecuteFunctions,
    itemIndex: number,
): Promise<any> {
    console.log('ℹ️ [Stratagems] Starting getAppInfo operation...');

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, '');

    console.log('ℹ️ [Stratagems] API Configuration:', {
        formattedUrl: formattedBaseUrl
    });

    const client = new StratagemsHttpClient(this, itemIndex);
    const endpoint = '/api/v1/apps/me';
    const url = `${formattedBaseUrl}${endpoint}`;

    console.log('ℹ️ [Stratagems] Getting app info from:', url);

    try {
        const response = await client.get(url);

        if (!response.success) {
            throw new Error(`Failed to get app info: ${response.error || 'Unknown error'}`);
        }

        if (!response.data) {
            throw new Error('App info response missing data');
        }

        console.log('ℹ️ [Stratagems] App info retrieved successfully:', response.data);

        return response.data;
    } catch (error: any) {
        console.log('ℹ️ [Stratagems] Error getting app info:', error.message);
        throw error;
    }
}