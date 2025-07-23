import { IExecuteFunctions } from 'n8n-workflow';
import { checkLookupExists, createLookup } from '../utils/common';
import { StratagemsHttpClient, buildLookupEndpoint, validateLookupName } from '../utils/httpClient';

export interface AddToLookupParams {
    lookupName: string;
    mode: string;
    leftField: string;
    rightField: string;
    metadataFields: any;
    createLookupIfMissing: boolean;
}

interface AddLookupValueResult {
    id: string;
    lookupId: string;
    left: string;
    right: string;
    leftMetadata: any;
    rightMetadata: any;
    createdAt: string;
    updatedAt: string;
}

interface CreateLookupResult {
    id: string;
    name: string;
    description?: string;
    leftSystem?: string;
    rightSystem?: string;
    allowLeftDups: boolean;
    allowRightDups: boolean;
    allowLeftRightDups: boolean;
    strictChecking: boolean;
    createdAt: string;
    updatedAt: string;
}

export async function executeAddToLookup(
    this: IExecuteFunctions,
    itemIndex: number,
    autoCreate: boolean,
): Promise<any> {
    console.log('🔗 [Stratagems] executeAddToLookup called for itemIndex:', itemIndex);
    console.log('🔗 [Stratagems] Starting addToLookup operation...');

    const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
    const mode = "single" // this.getNodeParameter('mode', itemIndex) as string;
    const leftField = this.getNodeParameter('leftField', itemIndex) as string;
    const rightField = this.getNodeParameter('rightField', itemIndex) as string;
    const leftMetadataFieldsStr = this.getNodeParameter('leftMetadataFields', itemIndex, '') as string;
    const rightMetadataFieldsStr = this.getNodeParameter('rightMetadataFields', itemIndex, '') as string;

    console.log('🔗 [Stratagems] Parameters:', {
        lookupName,
        mode,
        leftField,
        rightField,
        leftMetadataFieldsStr,
        rightMetadataFieldsStr,
        autoCreate
    });

    // Validate inputs
    validateLookupName(lookupName);

    const inputData: { [key: string]: any } = this.getInputData()[itemIndex].json;
    const leftValue = inputData[leftField];
    const rightValue = inputData[rightField];

    console.log('🔗 [Stratagems] Input data:', { inputData, leftValue, rightValue, leftField, rightField });

    if (!leftValue) {
        throw new Error(`Left field "${leftField}" is required and cannot be empty`);
    }

    if (!rightValue) {
        throw new Error(`Right field "${rightField}" is required and cannot be empty`);
    }

    // Validate the values
    if (typeof leftValue !== 'string') {
        throw new Error(`Left value must be a string, got ${typeof leftValue}`);
    }
    if (typeof rightValue !== 'string') {
        throw new Error(`Right value must be a string, got ${typeof rightValue}`);
    }

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, ''); // Remove trailing slash if present

    console.log('🔗 [Stratagems] API Configuration:', {
        originalUrl: baseUrl,
        formattedUrl: formattedBaseUrl
    });

    const client = new StratagemsHttpClient(this, itemIndex);

    try {
        // Process left metadata fields if provided
        let leftMetadata: { [key: string]: any } | null = null;
        if (leftMetadataFieldsStr && leftMetadataFieldsStr.trim() !== '') {
            leftMetadata = {} as { [key: string]: any };
            const fieldNames = leftMetadataFieldsStr.split(',').map(f => f.trim()).filter(f => f !== '');

            for (const fieldName of fieldNames) {
                if (inputData[fieldName] !== undefined) {
                    leftMetadata[fieldName] = inputData[fieldName];
                }
            }

            // Only keep metadata if it has any values
            if (Object.keys(leftMetadata).length === 0) {
                leftMetadata = null;
            }
        }

        // Process right metadata fields if provided
        let rightMetadata: { [key: string]: any } | null = null;
        if (rightMetadataFieldsStr && rightMetadataFieldsStr.trim() !== '') {
            rightMetadata = {} as { [key: string]: any };
            const fieldNames = rightMetadataFieldsStr.split(',').map(f => f.trim()).filter(f => f !== '');

            for (const fieldName of fieldNames) {
                if (inputData[fieldName] !== undefined) {
                    rightMetadata[fieldName] = inputData[fieldName];
                }
            }

            // Only keep metadata if it has any values
            if (Object.keys(rightMetadata).length === 0) {
                rightMetadata = null;
            }
        }

        console.log('🔗 [Stratagems] Processed metadata:', { leftMetadata, rightMetadata });

        // First, check if the lookup exists
        const lookupExists = await checkLookupExists(client, formattedBaseUrl, lookupName);
        console.log('🔗 [Stratagems] Lookup exists:', lookupExists);

        // If lookup doesn't exist and autoCreate is enabled, create it
        if (!lookupExists && autoCreate) {
            console.log('🔗 [Stratagems] Auto-creating lookup...');
            await createLookup(client, formattedBaseUrl, lookupName);
            console.log('🔗 [Stratagems] Lookup created successfully');
        } else if (!lookupExists) {
            throw new Error(`Lookup "${lookupName}" not found. Enable "Auto Create Set/Lookup" to create it automatically.`);
        }

        // Add value pair to the lookup
        const result = await addValueToLookup(client, formattedBaseUrl, lookupName, leftValue, rightValue, leftMetadata, rightMetadata);
        console.log('🔗 [Stratagems] Value pair added to lookup:', result);

        // Return the enriched input data with operation result
        return result;

    } catch (error: any) {
        console.log('🔗 [Stratagems] Error in executeAddToLookup:', error.message);

        // Return the input data with error information
        return {
            success: false,
            error: error.message,


        };
    }
}


async function addValueToLookup(
    client: StratagemsHttpClient,
    baseUrl: string,
    lookupName: string,
    left: string,
    right: string,
    leftMetadata: any,
    rightMetadata: any
): Promise<{ success: boolean; data: AddLookupValueResult }> {
    const endpoint = buildLookupEndpoint(lookupName, 'values');
    const url = `${baseUrl}${endpoint}`;

    console.log('🔗 [Stratagems] Adding value pair to lookup:', url);

    const payload: any = { left, right };
    if (leftMetadata) {
        payload.leftMetadata = leftMetadata;
    }
    if (rightMetadata) {
        payload.rightMetadata = rightMetadata;
    }

    console.log('🔗 [Stratagems] Add value pair payload:', payload);

    const response = await client.post<AddLookupValueResult>(url, payload);

    if (!response.success) {
        throw new Error(`Failed to add value pair to lookup: ${response.error || 'Unknown error'}`);
    }

    if (!response.data) {
        throw new Error('Add value pair response missing data field');
    }

    return { success: true, data: response.data };
}