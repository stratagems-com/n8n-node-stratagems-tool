import { IExecuteFunctions } from 'n8n-workflow';
import { EightKitHttpClient } from '../utils/httpClient';

export interface CreateLastUpdatedParams {
    key: string;
    description?: string;
    date?: string;
}

export async function executeCreateLastUpdated(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const key = this.getNodeParameter('key', itemIndex) as string;
    const description = this.getNodeParameter('description', itemIndex, '') as string;
    const date = this.getNodeParameter('date', itemIndex, null) as string | null;

    const credentials = await this.getCredentials('eightKitApi');
    const baseUrl = (credentials.hostUrl as string).trim().replace(/\/$/, '');

    const client = new EightKitHttpClient(this, itemIndex);

    const payload: any = {
        key,
    };

    if (description && description.trim()) {
        payload.description = description.trim();
    }

    if (date && date.trim()) {
        payload.date = date.trim();
    }

    const response = await client.post<{
        success: boolean;
        data: {
            id: string;
            key: string;
            description: string | null;
            date: string;
            createdAt: string;
            updatedAt: string;
        };
    }>(`${baseUrl}/api/v1/last-updated`, payload);

    if (!response.success) {
        throw new Error(`Failed to create last updated record: ${response.error || 'Unknown error'}`);
    }

    return response.data;
} 