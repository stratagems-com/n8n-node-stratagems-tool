import { IExecuteFunctions } from 'n8n-workflow';
import { checkSetExists, createSet } from '../utils/common';
import { StratagemsHttpClient, buildSetEndpoint, validateSetName, validateValue } from '../utils/httpClient';

export interface AddToSetParams {
    setName: string;
    mode: string;
    valueField: string;
    metadataFields: any;
    createSetIfMissing: boolean;
}

interface AddSetValueResult {
    id: string;
    setId: string;
    value: string;
    metadata: any;
    createdAt: string;
    updatedAt: string;
}


export async function executeAddToSet(
    this: IExecuteFunctions,
    itemIndex: number,
    autoCreate: boolean,
): Promise<any> {
    console.log('➕ [Stratagems] executeAddToSet called for itemIndex:', itemIndex);
    console.log('➕ [Stratagems] Starting addToSet operation...');

    const setName = this.getNodeParameter('setName', itemIndex) as string;
    const mode = "single"; //this.getNodeParameter('mode', itemIndex) as string;
    const valueField = this.getNodeParameter('valueField', itemIndex) as string;
    const metadataFieldsStr = this.getNodeParameter('metadataFields', itemIndex, '') as string;

    console.log('➕ [Stratagems] Parameters:', {
        setName,
        mode,
        valueField,
        metadataFieldsStr,
        autoCreate
    });

    // Validate inputs
    validateSetName(setName);

    const inputData: { [key: string]: any } = this.getInputData()[itemIndex].json;
    const value = inputData[valueField];

    console.log('➕ [Stratagems] Input data:', { inputData, value, valueField });

    if (!value) {
        throw new Error(`Value field "${valueField}" is required and cannot be empty`);
    }

    // Validate the value
    if (typeof value !== 'string') {
        throw new Error(`Value must be a string, got ${typeof value}`);
    }
    validateValue(value);

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, ''); // Remove trailing slash if present

    console.log('➕ [Stratagems] API Configuration:', {
        originalUrl: baseUrl,
        formattedUrl: formattedBaseUrl
    });

    const client = new StratagemsHttpClient(this, itemIndex);

    try {
        // Process metadata fields if provided
        let metadata: { [key: string]: any } | null = null;
        if (metadataFieldsStr && metadataFieldsStr.trim() !== '') {
            metadata = {} as { [key: string]: any };
            const fieldNames = metadataFieldsStr.split(',').map(f => f.trim()).filter(f => f !== '');

            for (const fieldName of fieldNames) {
                if (inputData[fieldName] !== undefined) {
                    metadata[fieldName] = inputData[fieldName];
                }
            }

            // Only keep metadata if it has any values
            if (Object.keys(metadata).length === 0) {
                metadata = null;
            }
        }

        console.log('➕ [Stratagems] Processed metadata:', metadata);

        // First, check if the set exists
        const setExists = await checkSetExists(client, formattedBaseUrl, setName);
        console.log('➕ [Stratagems] Set exists:', setExists);

        // If set doesn't exist and autoCreate is enabled, create it
        if (!setExists && autoCreate) {
            console.log('➕ [Stratagems] Auto-creating set...');
            await createSet(client, formattedBaseUrl, setName);
            console.log('➕ [Stratagems] Set created successfully');
        } else if (!setExists) {
            throw new Error(`Set "${setName}" not found. Enable "Auto Create Set/Lookup" to create it automatically.`);
        }

        // Add value to the set
        const result = await addValueToSet(client, formattedBaseUrl, setName, value, metadata);
        console.log('➕ [Stratagems] Value added to set:', result);

        // Return the enriched input data with operation result
        return result;

    } catch (error: any) {
        console.log('➕ [Stratagems] Error in executeAddToSet:', error.message);

        // Return the input data with error information
        return {

            success: false,
            error: error.message,

        };
    }
}


async function addValueToSet(
    client: StratagemsHttpClient,
    baseUrl: string,
    setName: string,
    value: string,
    metadata: any
): Promise<{ success: boolean; data: AddSetValueResult }> {
    const endpoint = buildSetEndpoint(setName, 'values');
    const url = `${baseUrl}${endpoint}`;

    console.log('➕ [Stratagems] Adding value to set:', url);

    const payload: any = { value };
    if (metadata) {
        payload.metadata = metadata;
    }

    console.log('➕ [Stratagems] Add value payload:', payload);

    const response = await client.post<AddSetValueResult>(url, payload);

    if (!response.success) {
        throw new Error(`Failed to add value to set: ${response.error || 'Unknown error'}`);
    }

    if (!response.data) {
        throw new Error('Add value response missing data field');
    }

    return { success: true, data: response.data };
}