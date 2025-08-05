import {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeListSearchItems,
    NodeConnectionType,
    type INodeExecutionData,
    type INodeType,
    type INodeTypeDescription
} from 'n8n-workflow';



import { executeAddToLookup, executeAddToSet, executeCheckSetValues, executeCreateLookup, executeCreateSet, executeGetLookupValues, executeGetSetInfo, executeGetSetValues, executeListLookups, executeListSets, executeRemoveFromLookup, executeRemoveFromSet } from './operations';
import { EightKitHttpClient } from './utils/httpClient';

export class EightKit implements INodeType {
    description: INodeTypeDescription = {
        displayName: '8kit',
        name: 'eightKit',
        icon: 'file:8kit.svg',
        group: ['transform'],
        version: 2,
        description: 'Integrate with 8kit Automation Tools for set tracking and lookup mapping',
        defaults: {
            name: '8kit',
        },
        inputs: [NodeConnectionType.Main],
        outputs: `={{$parameter["resource"] === "setValues" && $parameter["operation"] === "checkSetValues" ? [{"type": "main", "displayName": "Existing Values"}, {"type": "main", "displayName": "Non-Existing Values"}] : [{"type": "main"}]}}`,
        credentials: [
            {
                name: 'eightKitApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Set',
                        value: 'set',
                        description: 'Manage sets themselves (create, list, get info)',
                    },
                    {
                        name: 'Set Values',
                        value: 'setValues',
                        description: 'Manage values within sets (add, remove, check, get values)',
                    },
                    {
                        name: 'Lookup',
                        value: 'lookup',
                        description: 'Manage lookups themselves (create, list, get info)',
                    },
                    {
                        name: 'Lookup Values',
                        value: 'lookupValues',
                        description: 'Manage mappings within lookups (add, remove, get values)',
                    },
                ],
                default: 'set',
            },
            // Set Operations (manage sets themselves)
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['set'],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'createSet',
                        description: 'Create a new empty set for tracking unique values (emails, IDs, etc.)',
                        action: 'Create a new set',
                    },
                    {
                        name: 'List',
                        value: 'listSets',
                        description: 'Retrieve all sets available for your application',
                        action: 'List all sets',
                    },
                    {
                        name: 'Get Info',
                        value: 'getSetInfo',
                        description: 'Get detailed information about a specific set (metadata, statistics)',
                        action: 'Get set information',
                    },
                ],
                default: 'listSets',
            },
            // Set Values Operations (manage values within sets)
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['setValues'],
                    },
                },
                options: [
                    {
                        name: 'Check Values',
                        value: 'checkSetValues',
                        description: 'Check if a value exists in a set - great for deduplication and filtering',
                        action: 'Check if values exist in a set',
                    },
                    {
                        name: 'Add Value',
                        value: 'addToSet',
                        description: 'Add a new value to a set - automatically handles duplicates',
                        action: 'Add values to a set',
                    },
                    {
                        name: 'Remove Value',
                        value: 'removeFromSet',
                        description: 'Remove a specific value from a set',
                        action: 'Remove values from a set',
                    },
                    {
                        name: 'Get Values',
                        value: 'getSetValues',
                        description: 'Retrieve all values stored in a set',
                        action: 'Get all set values',
                    },
                ],
                default: 'checkSetValues',
            },
            // Lookup Operations (manage lookups themselves)
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['lookup'],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'createLookup',
                        description: 'Create a new lookup table for mapping between different ID systems',
                        action: 'Create a new lookup',
                    },
                    {
                        name: 'List',
                        value: 'listLookups',
                        description: 'Retrieve all lookup tables available for your application',
                        action: 'List all lookups',
                    },
                ],
                default: 'listLookups',
            },
            // Lookup Values Operations (manage mappings within lookups)
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['lookupValues'],
                    },
                },
                options: [
                    {
                        name: 'Add Mapping',
                        value: 'addToLookup',
                        description: 'Create ID mappings between two systems (e.g., internal ID ↔ external ID)',
                        action: 'Add ID mappings to a lookup',
                    },
                    {
                        name: 'Get Values',
                        value: 'getLookupValues',
                        description: 'Retrieve all ID mappings stored in a lookup table',
                        action: 'Get all lookup values',
                    },
                    {
                        name: 'Remove Mapping',
                        value: 'removeFromLookup',
                        description: 'Remove a specific ID mapping from a lookup table',
                        action: 'Remove values from a lookup',
                    },
                ],
                default: 'addToLookup',
            },
            // Name (for set and lookup operations)
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                placeholder: 'my_set_name',
                description: 'Unique identifier for the set or lookup. Must contain only letters, numbers, hyphens, and underscores. Maximum 100 characters.',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['set', 'setValues', 'lookup', 'lookupValues'],
                    },
                    hide: {
                        operation: ['listSets', 'listLookups'],
                    },
                },
            },
            // Description (for create operations)
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                placeholder: 'Optional description of this set or lookup',
                description: 'Optional human-readable description explaining the purpose of this set or lookup. Helpful for documentation and team collaboration.',
                displayOptions: {
                    show: {
                        resource: ['set', 'lookup'],
                        operation: ['createSet', 'createLookup'],
                    },
                },
            },
            // Value (for set operations)
            {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                placeholder: 'user@example.com',
                description: 'The value to check, add, or remove from the set. Can be any string up to 255 characters (e.g., email, user ID, domain name).',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['setValues'],
                        operation: ['checkSetValues', 'addToSet', 'removeFromSet'],
                    },
                },
            },
            // Left Value (for lookup operations)
            {
                displayName: 'Left Value',
                name: 'leftValue',
                type: 'string',
                default: '',
                placeholder: 'user123',
                description: 'The left-side value in the lookup mapping. Typically represents an ID or key from one system (e.g., internal user ID, product SKU).',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['lookupValues'],
                        operation: ['addToLookup'],
                    },
                },
            },
            // Right Value (for lookup operations)
            {
                displayName: 'Right Value',
                name: 'rightValue',
                type: 'string',
                default: '',
                placeholder: 'ext_user_456',
                description: 'The right-side value in the lookup mapping. Typically represents the corresponding ID or key from another system (e.g., external system ID, CRM ID).',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['lookupValues'],
                        operation: ['addToLookup'],
                    },
                },
            },
            // Value (for remove operations)
            {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                placeholder: 'value_to_remove',
                description: 'The specific value to remove from the lookup or set. This should match an existing entry exactly.',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['lookupValues'],
                        operation: ['removeFromLookup'],
                    },
                },
            },
            // Get Set Value Data (for check set values)
            {
                displayName: 'Include Set Value Data',
                name: 'getSetValueData',
                type: 'boolean',
                default: false,
                description: 'Whether to include additional metadata about the set value in the output. Useful for debugging or when you need creation timestamps.',
                displayOptions: {
                    show: {
                        resource: ['setValues'],
                        operation: ['checkSetValues'],
                    },
                },
            },
            // Set Value Data Field Name (conditional field)
            {
                displayName: 'Set Value Data Field Name',
                name: 'setValueDataFieldName',
                type: 'string',
                default: '__checkData',
                placeholder: '__checkData',
                description: 'The field name where set value metadata will be stored in the output JSON. Choose a name that won\'t conflict with your existing data fields.',
                displayOptions: {
                    show: {
                        resource: ['setValues'],
                        operation: ['checkSetValues'],
                        getSetValueData: [true],
                    },
                },
            },
            // Advanced Settings Collection
            {
                displayName: 'Advanced Settings',
                name: 'advancedSettings',
                type: 'collection',
                placeholder: 'Add Advanced Settings',
                default: {},
                description: 'Configure advanced options like pagination, filtering, and sorting',
                displayOptions: {
                    show: {
                        resource: ['lookup'],
                        operation: ['listLookups'],
                    },
                },
                options: [
                    {
                        displayName: 'Pagination',
                        name: 'pagination',
                        type: 'fixedCollection',
                        placeholder: 'Add Pagination',
                        default: {
                            pagination: {},
                        },
                        description: 'Configure pagination for large result sets',
                        options: [
                            {
                                displayName: 'Pagination Settings',
                                name: 'pagination',
                                default: {
                                    pagination: {},
                                },
                                values: [
                                    {
                                        displayName: 'Page',
                                        name: 'page',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '1',
                                        description: 'Page number to retrieve (starts from 1). Use this to navigate through multiple pages of results.',
                                    },
                                    {
                                        displayName: 'Items Per Page',
                                        name: 'limit',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            maxValue: 100,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '10',
                                        description: 'Maximum number of lookups to return per page (1-100). Smaller values load faster but require more requests for large datasets.',
                                    },
                                    {
                                        displayName: 'Offset (Advanced)',
                                        name: 'offset',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 0,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '0',
                                        description: 'Number of items to skip from the beginning. Alternative to page-based pagination. Leave at 0 to use page-based navigation.',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Advanced Settings for Set Operations (listSets)
            {
                displayName: 'Advanced Settings',
                name: 'advancedSettings',
                type: 'collection',
                placeholder: 'Add Advanced Settings',
                default: {},
                description: 'Configure advanced options like pagination, filtering, and sorting',
                displayOptions: {
                    show: {
                        resource: ['set'],
                        operation: ['listSets'],
                    },
                },
                options: [
                    {
                        displayName: 'Pagination',
                        name: 'pagination',
                        type: 'fixedCollection',
                        placeholder: 'Add Pagination',
                        default: {
                            pagination: {},
                        },
                        description: 'Configure pagination for large result sets',
                        options: [
                            {
                                displayName: 'Pagination Settings',
                                name: 'pagination',
                                default: {
                                    pagination: {},
                                },
                                values: [
                                    {
                                        displayName: 'Page',
                                        name: 'page',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '1',
                                        description: 'Page number to retrieve (starts from 1). Use this to navigate through multiple pages of results.',
                                    },
                                    {
                                        displayName: 'Items Per Page',
                                        name: 'limit',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            maxValue: 100,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '10',
                                        description: 'Maximum number of sets to return per page (1-100). Smaller values load faster but require more requests for large datasets.',
                                    },
                                    {
                                        displayName: 'Offset (Advanced)',
                                        name: 'offset',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 0,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '0',
                                        description: 'Number of items to skip from the beginning. Alternative to page-based pagination. Leave at 0 to use page-based navigation.',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Advanced Settings for Set Values Operations (getSetValues)
            {
                displayName: 'Advanced Settings',
                name: 'advancedSettings',
                type: 'collection',
                placeholder: 'Add Advanced Settings',
                default: {},
                description: 'Configure advanced options like pagination, filtering, and sorting',
                displayOptions: {
                    show: {
                        resource: ['setValues'],
                        operation: ['getSetValues'],
                    },
                },
                options: [
                    {
                        displayName: 'Pagination',
                        name: 'pagination',
                        type: 'fixedCollection',
                        placeholder: 'Add Pagination',
                        default: {
                            pagination: {},
                        },
                        description: 'Configure pagination for large result sets',
                        options: [
                            {
                                displayName: 'Pagination Settings',
                                name: 'pagination',
                                default: {
                                    pagination: {},
                                },
                                values: [
                                    {
                                        displayName: 'Page',
                                        name: 'page',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '1',
                                        description: 'Page number to retrieve (starts from 1). Use this to navigate through multiple pages of results.',
                                    },
                                    {
                                        displayName: 'Items Per Page',
                                        name: 'limit',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            maxValue: 100,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '10',
                                        description: 'Maximum number of set values to return per page (1-100). Smaller values load faster but require more requests for large datasets.',
                                    },
                                    {
                                        displayName: 'Offset (Advanced)',
                                        name: 'offset',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 0,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '0',
                                        description: 'Number of items to skip from the beginning. Alternative to page-based pagination. Leave at 0 to use page-based navigation.',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Advanced Settings for Lookup Values Operations (getLookupValues)
            {
                displayName: 'Advanced Settings',
                name: 'advancedSettings',
                type: 'collection',
                placeholder: 'Add Advanced Settings',
                default: {},
                description: 'Configure advanced options like pagination, filtering, and sorting',
                displayOptions: {
                    show: {
                        resource: ['lookupValues'],
                        operation: ['getLookupValues'],
                    },
                },
                options: [
                    {
                        displayName: 'Pagination',
                        name: 'pagination',
                        type: 'fixedCollection',
                        placeholder: 'Add Pagination',
                        default: {
                            pagination: {},
                        },
                        description: 'Configure pagination for large result sets',
                        options: [
                            {
                                displayName: 'Pagination Settings',
                                name: 'pagination',
                                default: {
                                    pagination: {},
                                },
                                values: [
                                    {
                                        displayName: 'Page',
                                        name: 'page',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '1',
                                        description: 'Page number to retrieve (starts from 1). Use this to navigate through multiple pages of results.',
                                    },
                                    {
                                        displayName: 'Items Per Page',
                                        name: 'limit',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 1,
                                            maxValue: 100,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '10',
                                        description: 'Maximum number of lookup values to return per page (1-100). Smaller values load faster but require more requests for large datasets.',
                                    },
                                    {
                                        displayName: 'Offset (Advanced)',
                                        name: 'offset',
                                        type: 'number',
                                        typeOptions: {
                                            minValue: 0,
                                            required: false,
                                        },
                                        default: null,
                                        placeholder: '0',
                                        description: 'Number of items to skip from the beginning. Alternative to page-based pagination. Leave at 0 to use page-based navigation.',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {
        const items = this.getInputData();
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        // For checkSetValues, we need two output arrays
        if (operation === 'checkSetValues') {
            const existingData: INodeExecutionData[] = [];
            const nonExistingData: INodeExecutionData[] = [];

            for (let i = 0; i < items.length; i++) {
                try {
                    const result = await executeCheckSetValues.call(this, i);

                    if (result === null || result === undefined) {
                        continue;
                    }

                    const newItem: INodeExecutionData = {
                        json: result.result,
                    };

                    // Route to appropriate output based on existence
                    if (result.outputIndex === 0) {
                        existingData.push(newItem);
                    } else {
                        nonExistingData.push(newItem);
                    }
                } catch (error) {
                    throw error;
                }
            }

            return [existingData, nonExistingData];
        }

        // For other operations, use single output
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                let result: any;

                switch (operation) {
                    case 'createSet':
                        result = await executeCreateSet.call(this, i);
                        break;
                    case 'listSets':
                        result = await executeListSets.call(this, i);
                        break;
                    case 'getSetInfo':
                        result = await executeGetSetInfo.call(this, i);
                        break;
                    case 'addToSet':
                        result = await executeAddToSet.call(this, i);
                        break;
                    case 'removeFromSet':
                        result = await executeRemoveFromSet.call(this, i);
                        break;
                    case 'getSetValues':
                        result = await executeGetSetValues.call(this, i);
                        break;
                    case 'createLookup':
                        result = await executeCreateLookup.call(this, i);
                        break;
                    case 'listLookups':
                        result = await executeListLookups.call(this, i);
                        break;
                    case 'addToLookup':
                        result = await executeAddToLookup.call(this, i);
                        break;
                    case 'getLookupValues':
                        result = await executeGetLookupValues.call(this, i);
                        break;
                    case 'removeFromLookup':
                        result = await executeRemoveFromLookup.call(this, i);
                        break;
                    default:
                        throw new Error(`Unknown operation: ${operation}`);
                }

                // Handle different result types
                if (result === null || result === undefined) {
                    continue;
                }

                // Handle empty objects
                if (typeof result === 'object' && Object.keys(result).length === 0) {
                    continue;
                }

                // Add valid results
                const newItem: INodeExecutionData = {
                    json: result,
                };
                returnData.push(newItem);
            } catch (error) {
                throw error;
            }
        }

        return [returnData];
    }

    async getSets(this: ILoadOptionsFunctions): Promise<INodeListSearchItems[]> {
        try {
            const credentials = await this.getCredentials('eightKitApi');
            const baseUrl = (credentials.hostUrl as string).trim().replace(/\/$/, '');

            const client = new EightKitHttpClient(this as any, 0);
            const response = await client.get<{ sets: string[] }>(`${baseUrl}/api/v1/sets`);

            if (response.success && response.data?.sets) {
                return response.data.sets.map(set => ({
                    name: set,
                    value: set,
                }));
            }
        } catch (error) {
            console.log('Error loading sets:', error);
        }

        return [];
    }

    async getLookups(this: ILoadOptionsFunctions): Promise<INodeListSearchItems[]> {
        try {
            const credentials = await this.getCredentials('eightKitApi');
            const baseUrl = (credentials.hostUrl as string).trim().replace(/\/$/, '');

            const client = new EightKitHttpClient(this as any, 0);
            const response = await client.get<{ lookups: string[] }>(`${baseUrl}/api/v1/lookups`);

            if (response.success && response.data?.lookups) {
                return response.data.lookups.map(lookup => ({
                    name: lookup,
                    value: lookup,
                }));
            }
        } catch (error) {
            console.log('Error loading lookups:', error);
        }

        return [];
    }
}