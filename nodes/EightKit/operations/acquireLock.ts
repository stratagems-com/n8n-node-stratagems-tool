import { IExecuteFunctions } from 'n8n-workflow';
import { EightKitHttpClient } from '../utils/httpClient';

export interface AcquireLockParams {
    key: string;
    callingFn: string;
    timeout?: number;
}

export async function executeAcquireLock(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const key = this.getNodeParameter('key', itemIndex) as string;
    const timeout = this.getNodeParameter('timeout', itemIndex, null) as number | null;

    const credentials = await this.getCredentials('eightKitApi');
    const baseUrl = (credentials.hostUrl as string).trim().replace(/\/$/, '');

    const client = new EightKitHttpClient(this, itemIndex);

    const payload: any = {
        key,
    };

    if (timeout !== null && timeout !== undefined) {
        payload.timeout = timeout;
    }

    const response = await client.post<{
        success: boolean;
        message: string;
        data: {
            key: string;
            callingFn: string;
            acquired: boolean;
            timestamp: string;
            timeout?: number;
        };
    }>(`${baseUrl}/api/v1/locks`, payload);

    if (!response.success) {
        throw new Error(`Failed to acquire lock: ${response.error || 'Unknown error'}`);
    }

    return response.data;
} 