import { IExecuteFunctions } from 'n8n-workflow';
import { StratagemsHttpClient, buildSetEndpoint, validateSetName, validateValue } from '../utils/httpClient';

export interface CheckSetValuesParams {
    setName: string;
    mode: string;
    valueField: string;
    outputField: string;
    filterMode: string;
    createSetIfMissing: boolean;
}

interface SingleCheckResult {
    exists: boolean;
    value?: any;
}

interface BulkCheckResult {
    found: number;
    notFound: number;
    errors: Array<{ index: number; error: string }>;
    checks: Array<{ value: string; exists: boolean; setValue?: any }>;
}

export async function executeCheckSetValues(
    this: IExecuteFunctions,
    itemIndex: number,
    autoCreate: boolean,
): Promise<any> {
    console.log('🔍 [Stratagems] executeCheckSetValues called for itemIndex:', itemIndex);
    console.log('🔍 [Stratagems] Starting checkSetValues operation...');

    const setName = this.getNodeParameter('setName', itemIndex) as string;
    const mode = "single" //this.getNodeParameter('mode', itemIndex) as string;
    const valueField = this.getNodeParameter('valueField', itemIndex) as string;
    const outputField = this.getNodeParameter('outputField', itemIndex) as string;
    const filterMode = this.getNodeParameter('filterMode', itemIndex) as string;

    console.log('🔍 [Stratagems] Parameters:', {
        setName,
        mode,
        valueField,
        outputField,
        filterMode,
        autoCreate
    });

    // Validate inputs
    validateSetName(setName);

    const inputData = this.getInputData()[itemIndex].json;
    const value = inputData[valueField];

    console.log('🔍 [Stratagems] Input data:', { inputData, value, valueField });

    if (!value) {
        throw new Error(`Value field "${valueField}" is required and cannot be empty`);
    }

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, ''); // Remove trailing slash if present

    console.log('🔍 [Stratagems] API Configuration:', {
        originalUrl: baseUrl,
        formattedUrl: formattedBaseUrl
    });

    const client = new StratagemsHttpClient(this, itemIndex);

    try {
        let result;
        result = await executeSingleCheck.call(this, itemIndex, {
            setName,
            value,
            outputField,
            filterMode,
            client,
            baseUrl: formattedBaseUrl,
            autoCreate,
        }, inputData);


        return result || [];
    } catch (error: any) {
        console.log('🔍 [Stratagems] Error in executeCheckSetValues:', error.message);
        throw error;
    }
}

async function executeSingleCheck(
    this: IExecuteFunctions,
    itemIndex: number,
    params: {
        setName: string;
        value: any;
        outputField: string;
        filterMode: string;
        client: StratagemsHttpClient;
        baseUrl: string;
        autoCreate: boolean;
    },
    inputData: any
): Promise<any> {
    const { setName, value, outputField, filterMode, client, baseUrl, autoCreate } = params;

    // Validate the value
    //TODO: Add support for other value types
    if (typeof value !== 'string') {
        throw new Error(`Value must be a string, got ${typeof value}`);
    }
    validateValue(value);

    // Build endpoint for single value check
    const endpoint = buildSetEndpoint(setName, 'contains');

    // Ensure baseUrl is valid and properly formatted
    if (!baseUrl || typeof baseUrl !== 'string') {
        throw new Error('Invalid base URL provided');
    }

    // Ensure baseUrl ends with no trailing slash and endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${formattedEndpoint}`;

    console.log('🔍 [Stratagems] Single check URL:', url);
    console.log('🔍 [Stratagems] Single check payload:', { value });

    try {
        console.log('🔍 [Stratagems] Making API request (POST)...');
        // Changed from GET with query param to POST with body
        const response = await client.post<SingleCheckResult>(url, { value });

        console.log('🔍 [Stratagems] API Response received:', response);

        if (!response.success) {
            throw new Error(`API Error: ${response.error || 'Unknown error'}`);
        }

        if (!response.data) {
            throw new Error('API response missing data field');
        }

        const result = response.data;
        const exists = result.exists;

        console.log('🔍 [Stratagems] API Response:', { result });



        if (filterMode === 'existing' && !exists) {
            console.log('🔍 [Stratagems] Filtering out non-existing value (existing mode)');
            return undefined;
        }
        if (filterMode === 'nonExisting' && exists) {
            console.log('🔍 [Stratagems] Filtering out existing value (non-existing mode)');
            return undefined;
        }

        const output = {
            [outputField || "__checkData"]: result.value,
            ...inputData,
        };

        console.log('🔍 [Stratagems] Single check result:', output);
        return output;
    } catch (error: any) {
        console.log('🔍 [Stratagems] Single check error:', error.message);

        // Handle 404 (set not found) if auto-create is enabled
        if (error.message.includes('404') || error.message.includes('SET_NOT_FOUND')) {
            console.log('🔍 [Stratagems] Set not found, autoCreate:', autoCreate);

            if (autoCreate) {
                // Set doesn't exist, so value definitely doesn't exist
                const exists = false;

                // Apply filter mode
                if (filterMode === 'existing' && !exists) {
                    console.log('🔍 [Stratagems] Auto-create: Filtering out non-existing value (existing mode)');
                    return undefined; // Skip this item
                }
                if (filterMode === 'nonExisting' && exists) {
                    console.log('🔍 [Stratagems] Auto-create: Filtering out existing value (non-existing mode)');
                    return undefined; // Skip this item
                }

                const output = {
                    [outputField || "__checkData"]: null,
                    ...inputData,
                };

                console.log('🔍 [Stratagems] Auto-create single check result:', output);
                return output;
            } else {
                throw new Error(`Set "${setName}" not found. Enable "Auto Create Set/Lookup" to create it automatically.`);
            }
        }

        console.log('🔍 [Stratagems] Re-throwing error:', error.message);
        throw error;
    }
}
