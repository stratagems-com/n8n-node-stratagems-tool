import { IExecuteFunctions } from 'n8n-workflow';
import { checkLookupExists, createLookup } from '../utils/common';
import { StratagemsHttpClient, buildLookupEndpoint, validateLookupName } from '../utils/httpClient';

export interface SearchLookupParams {
    lookupName: string;
    searchType: string;
    searchValue: string;
}

interface LookupValue {
    id: string;
    lookupId: string;
    left: string;
    right: string;
    leftMetadata: any;
    rightMetadata: any;
    createdAt: string;
    updatedAt: string;
}

export async function executeSearchLookup(
    this: IExecuteFunctions,
    itemIndex: number,
    autoCreate: boolean,
): Promise<any> {
    console.log('🔍 [Stratagems] Starting searchLookup operation...');

    // Get parameters
    const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
    const searchType = this.getNodeParameter('searchType', itemIndex) as string;
    const searchValue = this.getNodeParameter('searchValue', itemIndex) as string;

    console.log('🔍 [Stratagems] Parameters:', {
        lookupName,
        searchType,
        searchValue,
        autoCreate
    });

    // Validate inputs
    validateLookupName(lookupName);

    console.log('🔍 [Stratagems] Search value:', searchValue);

    if (!searchValue && searchType !== 'both') {
        throw new Error(`Search value is required and cannot be empty for search type "${searchType}"`);
    }

    // Initialize HTTP client
    const credentials = await this.getCredentials('stratagemsApi');
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error('Host URL is not configured in credentials');
    }

    // Ensure baseUrl is properly formatted
    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, '');

    console.log('🔍 [Stratagems] API Configuration:', {
        formattedUrl: formattedBaseUrl
    });

    const client = new StratagemsHttpClient(this, itemIndex);

    try {
        // First, check if the lookup exists
        const lookupExists = await checkLookupExists(client, formattedBaseUrl, lookupName);
        console.log('🔍 [Stratagems] Lookup exists:', lookupExists);

        // If lookup doesn't exist and autoCreate is enabled, create it
        if (!lookupExists && autoCreate) {
            console.log('🔍 [Stratagems] Auto-creating lookup...');
            await createLookup(client, formattedBaseUrl, lookupName);
            console.log('🔍 [Stratagems] Lookup created successfully');
        } else if (!lookupExists) {
            throw new Error(`Lookup "${lookupName}" not found. Enable "Auto Create Set/Lookup" to create it automatically.`);
        }

        // Build search parameters based on search type
        const searchParams: { [key: string]: string } = {};

        if (searchType === 'both') {
            if (searchValue) {
                searchParams.search = searchValue;
            }
        } else if (searchType === 'left') {
            searchParams.left = searchValue;
        } else if (searchType === 'right') {
            searchParams.right = searchValue;
        } else {
            throw new Error(`Invalid search type: ${searchType}`);
        }

        // Perform the search
        const result = await searchLookup(client, formattedBaseUrl, lookupName, searchParams);
        console.log('🔍 [Stratagems] Search completed:', {
            resultsCount: result.data.length,
            searchParams
        });

        // Return the search results
        return {
            success: true,
            results: result.data,
            total: result.total
        };

    } catch (error: any) {
        console.log('🔍 [Stratagems] Error in searchLookup:', error.message);

        return {
            success: false,
            error: error.message,
            results: [],
            total: 0
        };
    }
}

async function searchLookup(
    client: StratagemsHttpClient,
    baseUrl: string,
    lookupName: string,
    searchParams: { [key: string]: string }
): Promise<{ success: boolean; data: LookupValue[]; total: number }> {
    const endpoint = buildLookupEndpoint(lookupName, 'search');

    // Build URL with query parameters
    let url = `${baseUrl}${endpoint}`;
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        queryParams.append(key, value);
    }

    const queryString = queryParams.toString();
    if (queryString) {
        url = `${url}?${queryString}`;
    }

    console.log('🔍 [Stratagems] Searching lookup:', url);

    const response = await client.get<LookupValue[]>(url);

    if (!response.success) {
        throw new Error(`Failed to search lookup: ${response.error || 'Unknown error'}`);
    }

    if (!response.data) {
        throw new Error('Search response missing data field');
    }

    // The API may return a total property in the response, but if not, use the array length
    const total = response.data.length;

    return {
        success: true,
        data: response.data,
        total
    };
}