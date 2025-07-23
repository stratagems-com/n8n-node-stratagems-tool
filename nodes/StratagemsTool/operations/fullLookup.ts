import { IExecuteFunctions } from 'n8n-workflow';
import { checkLookupExists, checkSetExists, createLookup, createSet } from '../utils/common';
import { StratagemsHttpClient, buildLookupEndpoint, buildSetEndpoint, validateLookupName, validateSetName, validateValue } from '../utils/httpClient';

export interface FullLookupParams {
    lookupName: string;
    setName: string;
    leftField: string;
    rightField: string;
    setValueField: string;
    customSetValueField: string;
    leftMetadataFields: string;
    rightMetadataFields: string;
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

interface AddSetValueResult {
    id: string;
    setId: string;
    value: string;
    metadata: any;
    createdAt: string;
    updatedAt: string;
}

export async function executeFullLookup(
    this: IExecuteFunctions,
    itemIndex: number,
    autoCreate: boolean,
): Promise<any> {
    console.log('🔄 [Stratagems] Starting fullLookup operation...');

    // Get parameters
    const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
    const setName = this.getNodeParameter('setName', itemIndex) as string;
    const mode = "single"; // this.getNodeParameter('mode', itemIndex) as string;
    const leftField = this.getNodeParameter('leftField', itemIndex) as string;
    const rightField = this.getNodeParameter('rightField', itemIndex) as string;
    const setValueField = this.getNodeParameter('setValueField', itemIndex) as string;
    const customSetValueField = setValueField === 'custom' ?
        this.getNodeParameter('customSetValueField', itemIndex) as string : '';
    const leftMetadataFieldsStr = this.getNodeParameter('leftMetadataFields', itemIndex, '') as string;
    const rightMetadataFieldsStr = this.getNodeParameter('rightMetadataFields', itemIndex, '') as string;

    console.log('🔄 [Stratagems] Parameters:', {
        lookupName,
        setName,
        mode,
        leftField,
        rightField,
        setValueField,
        customSetValueField,
        leftMetadataFieldsStr,
        rightMetadataFieldsStr,
        autoCreate
    });

    // Validate inputs
    validateLookupName(lookupName);
    validateSetName(setName);

    const inputData: { [key: string]: any } = this.getInputData()[itemIndex].json;
    const leftValue = inputData[leftField];
    const rightValue = inputData[rightField];

    console.log('🔄 [Stratagems] Input data:', { inputData, leftValue, rightValue });

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

    // Determine the set value based on setValueField parameter
    let setValue: string;
    switch (setValueField) {
        case 'left':
            setValue = leftValue;
            break;
        case 'right':
            setValue = rightValue;
            break;
        case 'custom':
            setValue = inputData[customSetValueField];
            if (!setValue) {
                throw new Error(`Custom set value field "${customSetValueField}" is required and cannot be empty`);
            }
            if (typeof setValue !== 'string') {
                throw new Error(`Custom set value must be a string, got ${typeof setValue}`);
            }
            break;
        default:
            throw new Error(`Invalid setValueField: ${setValueField}`);
    }

    validateValue(setValue);

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, '');

    console.log('🔄 [Stratagems] API Configuration:', {
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

        console.log('🔄 [Stratagems] Processed metadata:', { leftMetadata, rightMetadata });

        // STEP 1: Check if lookup exists and create if needed
        const lookupExists = await checkLookupExists(client, formattedBaseUrl, lookupName);
        console.log('🔄 [Stratagems] Lookup exists:', lookupExists);

        if (!lookupExists && autoCreate) {
            console.log('🔄 [Stratagems] Auto-creating lookup...');
            await createLookup(client, formattedBaseUrl, lookupName);
            console.log('🔄 [Stratagems] Lookup created successfully');
        } else if (!lookupExists) {
            throw new Error(`Lookup "${lookupName}" not found. Enable "Auto Create Set/Lookup" to create it automatically.`);
        }

        // STEP 2: Check if set exists and create if needed
        const setExists = await checkSetExists(client, formattedBaseUrl, setName);
        console.log('🔄 [Stratagems] Set exists:', setExists);

        if (!setExists && autoCreate) {
            console.log('🔄 [Stratagems] Auto-creating set...');
            await createSet(client, formattedBaseUrl, setName);
            console.log('🔄 [Stratagems] Set created successfully');
        } else if (!setExists) {
            throw new Error(`Set "${setName}" not found. Enable "Auto Create Set/Lookup" to create it automatically.`);
        }

        // STEP 3: Add value pair to the lookup
        const lookupResult = await addValueToLookup(
            client,
            formattedBaseUrl,
            lookupName,
            leftValue,
            rightValue,
            leftMetadata,
            rightMetadata
        );
        console.log('🔄 [Stratagems] Value pair added to lookup:', lookupResult);

        // STEP 4: Add value to the set
        const setResult = await addValueToSet(
            client,
            formattedBaseUrl,
            setName,
            setValue,
            null // No metadata for set tracking in fullLookup
        );
        console.log('🔄 [Stratagems] Value added to set:', setResult);

        // Return combined results
        return {
            success: true,
            lookupResult: lookupResult.data,
            setResult: setResult.data
        };

    } catch (error: any) {
        console.log('🔄 [Stratagems] Error in executeFullLookup:', error.message);

        return {
            success: false,
            error: error.message
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

    console.log('🔄 [Stratagems] Adding value pair to lookup:', url);

    const payload: any = { left, right };
    if (leftMetadata) {
        payload.leftMetadata = leftMetadata;
    }
    if (rightMetadata) {
        payload.rightMetadata = rightMetadata;
    }

    console.log('🔄 [Stratagems] Add value pair payload:', payload);

    const response = await client.post<AddLookupValueResult>(url, payload);

    if (!response.success) {
        throw new Error(`Failed to add value pair to lookup: ${response.error || 'Unknown error'}`);
    }

    if (!response.data) {
        throw new Error('Add value pair response missing data field');
    }

    return { success: true, data: response.data };
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

    console.log('🔄 [Stratagems] Adding value to set:', url);

    const payload: any = { value };
    if (metadata) {
        payload.metadata = metadata;
    }

    console.log('🔄 [Stratagems] Add value payload:', payload);

    const response = await client.post<AddSetValueResult>(url, payload);

    if (!response.success) {
        throw new Error(`Failed to add value to set: ${response.error || 'Unknown error'}`);
    }

    if (!response.data) {
        throw new Error('Add value response missing data field');
    }

    return { success: true, data: response.data };
}