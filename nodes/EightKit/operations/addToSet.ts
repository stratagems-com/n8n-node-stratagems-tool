import { IExecuteFunctions } from 'n8n-workflow';
import { checkSetExists } from '../utils/common';
import { EightKitHttpClient, buildSetEndpoint, validateSetName, validateValue } from '../utils/httpClient';

export interface AddToSetParams {
    name: string;
    value: string;
    createSetIfMissing: boolean;
}

interface AddSetValueResult {
    id: string;
    setId: string;
    value: string;
    createdAt: string;
    updatedAt: string;
}


export async function executeAddToSet(
    this: IExecuteFunctions,
    itemIndex: number,
): Promise<any> {
    console.log('➕ [8kit] executeAddToSet called for itemIndex:', itemIndex);
    console.log('➕ [8kit] Starting addToSet operation...');

    const name = this.getNodeParameter('name', itemIndex) as string;
    const value = this.getNodeParameter('value', itemIndex) as string;

    console.log('➕ [8kit] Parameters:', {
        name,
        value,
    });

    // Validate inputs
    validateSetName(name);

    const inputData: { [key: string]: any } = this.getInputData()[itemIndex].json;

    console.log('➕ [8kit] Input data:', { inputData, value });

    if (!value) {
        throw new Error(`Value is required and cannot be empty`);
    }

    // Validate the value
    if (typeof value !== 'string') {
        throw new Error(`Value must be a string, got ${typeof value}`);
    }
    validateValue(value);

    // Initialize HTTP client
    const credentials = await this.getCredentials('eightKitApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, ''); // Remove trailing slash if present

    console.log('➕ [8kit] API Configuration:', {
        originalUrl: baseUrl,
        formattedUrl: formattedBaseUrl
    });

    const client = new EightKitHttpClient(this, itemIndex);

    try {

        // First, check if the set exists
        const setExists = await checkSetExists(client, formattedBaseUrl, name);
        console.log('➕ [8kit] Set exists:', setExists);

        // If set doesn't exist, throw error
        if (!setExists) {
            throw new Error(`Set "${name}" not found.`);
        }

        // Add value to the set
        const result = await addValueToSet(client, formattedBaseUrl, name, value);
        console.log('➕ [8kit] Value added to set:', result);

        // Return the enriched input data with operation result
        return result;

    } catch (error: any) {
        console.log('➕ [8kit] Error in executeAddToSet:', error.message);

        // Return the input data with error information
        throw error.message;
    }
}


async function addValueToSet(
    client: EightKitHttpClient,
    baseUrl: string,
    name: string,
    value: string
): Promise<{ success: boolean; data: AddSetValueResult }> {
    const endpoint = buildSetEndpoint(name, 'values');
    const url = `${baseUrl}${endpoint}`;

    console.log('➕ [8kit] Adding value to set:', url);

    const payload = { value };

    console.log('➕ [8kit] Add value payload:', payload);

    const response = await client.post<AddSetValueResult>(url, payload);

    if (!response.success) {
        throw new Error(`Failed to add value to set: ${response.error || 'Unknown error'}`);
    }

    if (!response.data) {
        throw new Error('Add value response missing data field');
    }

    return { success: true, data: response.data };
}