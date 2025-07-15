import {
    IExecuteFunctions,
    NodeConnectionType,
    type INodeExecutionData,
    type INodeType,
    type INodeTypeDescription,
} from 'n8n-workflow';

export class StratagemsTool implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Stratagems Tool',
        name: 'stratagemsTool',
        icon: 'file:stratagemsTool.svg',
        group: ['transform'],
        version: 1,
        description: 'Integrate with Stratagems Automation Tools for set tracking, lookup mapping, and app management',
        defaults: {
            name: 'Stratagems Tool',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'stratagemsApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    // Set Operations
                    {
                        name: 'Check Set Values',
                        value: 'checkSetValues',
                        description: 'Check if values exist in a set',
                        action: 'Check if values exist in a set',
                    },
                    {
                        name: 'Add to Set',
                        value: 'addToSet',
                        description: 'Add values to a set to mark them as processed',
                        action: 'Add values to a set',
                    },
                    // Lookup Operations
                    {
                        name: 'Add to Lookup',
                        value: 'addToLookup',
                        description: 'Add ID mappings to a lookup with optional metadata',
                        action: 'Add ID mappings to a lookup',
                    },
                    {
                        name: 'Search Lookup',
                        value: 'searchLookup',
                        description: 'Search for ID mappings in a lookup',
                        action: 'Search for ID mappings',
                    },
                    {
                        name: 'Full Lookup with Set Tracking',
                        value: 'fullLookup',
                        description: 'Add to lookup AND automatically track in a set',
                        action: 'Add to lookup and track in set',
                    },
                    // App Operations
                    {
                        name: 'Get App Info',
                        value: 'getAppInfo',
                        description: 'Retrieve current application information',
                        action: 'Get application information',
                    },
                    {
                        name: 'Health Check',
                        value: 'healthCheck',
                        description: 'Check API health and connectivity',
                        action: 'Check API health',
                    },
                ],
                default: 'checkSetValues',
            },
            // Set Name (for set and lookup operations)
            {
                displayName: 'Set Name',
                name: 'setName',
                type: 'string',
                default: '',
                placeholder: 'processed-orders',
                description: 'Unique name of the set',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['checkSetValues', 'addToSet', 'fullLookup'],
                    },
                },
            },
            // Lookup Name (for lookup operations)
            {
                displayName: 'Lookup Name',
                name: 'lookupName',
                type: 'string',
                default: '',
                placeholder: 'order-mapping',
                description: 'Unique name of the lookup',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addToLookup', 'searchLookup', 'fullLookup'],
                    },
                },
            },
            // Mode (single/bulk)
            {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                    {
                        name: 'Single',
                        value: 'single',
                        description: 'Process one value per item',
                    },
                    {
                        name: 'Bulk',
                        value: 'bulk',
                        description: 'Process multiple values per item',
                    },
                ],
                default: 'single',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues', 'addToSet', 'addToLookup', 'fullLookup'],
                    },
                },
            },
            // Value Field (for set operations)
            {
                displayName: 'Value Field',
                name: 'valueField',
                type: 'string',
                default: 'value',
                description: 'Field name containing the value to process',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues', 'addToSet'],
                    },
                },
            },
            // Output Field (for check set values)
            {
                displayName: 'Output Field',
                name: 'outputField',
                type: 'string',
                default: 'exists',
                description: 'Field name for the result',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues'],
                    },
                },
            },
            // Filter Mode (for check set values)
            {
                displayName: 'Filter Mode',
                name: 'filterMode',
                type: 'options',
                options: [
                    {
                        name: 'All',
                        value: 'all',
                        description: 'Return all items with existence status',
                    },
                    {
                        name: 'Existing Only',
                        value: 'existing',
                        description: 'Return only items that exist in set',
                    },
                    {
                        name: 'Non-Existing Only',
                        value: 'nonExisting',
                        description: 'Return only items that don\'t exist in set',
                    },
                ],
                default: 'all',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues'],
                    },
                },
            },
            // Left Field (for lookup operations)
            {
                displayName: 'Left Field',
                name: 'leftField',
                type: 'string',
                default: 'left',
                description: 'Field name containing the left system ID',
                displayOptions: {
                    show: {
                        operation: ['addToLookup', 'fullLookup'],
                    },
                },
            },
            // Right Field (for lookup operations)
            {
                displayName: 'Right Field',
                name: 'rightField',
                type: 'string',
                default: 'right',
                description: 'Field name containing the right system ID',
                displayOptions: {
                    show: {
                        operation: ['addToLookup', 'fullLookup'],
                    },
                },
            },
            // Set Value Field (for full lookup)
            {
                displayName: 'Set Value Field',
                name: 'setValueField',
                type: 'options',
                options: [
                    {
                        name: 'Left Value',
                        value: 'left',
                        description: 'Use left field value for set tracking',
                    },
                    {
                        name: 'Right Value',
                        value: 'right',
                        description: 'Use right field value for set tracking',
                    },
                    {
                        name: 'Custom Field',
                        value: 'custom',
                        description: 'Use a custom field for set tracking',
                    },
                ],
                default: 'left',
                displayOptions: {
                    show: {
                        operation: ['fullLookup'],
                    },
                },
            },
            // Custom Set Value Field (for full lookup)
            {
                displayName: 'Custom Set Value Field',
                name: 'customSetValueField',
                type: 'string',
                default: 'id',
                description: 'Custom field name for set tracking',
                displayOptions: {
                    show: {
                        operation: ['fullLookup'],
                        setValueField: ['custom'],
                    },
                },
            },
            // Search Type (for search lookup)
            {
                displayName: 'Search Type',
                name: 'searchType',
                type: 'options',
                options: [
                    {
                        name: 'Left',
                        value: 'left',
                        description: 'Search by left system ID',
                    },
                    {
                        name: 'Right',
                        value: 'right',
                        description: 'Search by right system ID',
                    },
                    {
                        name: 'Both',
                        value: 'both',
                        description: 'Search by both (returns all mappings)',
                    },
                ],
                default: 'left',
                displayOptions: {
                    show: {
                        operation: ['searchLookup'],
                    },
                },
            },
            // Search Field (for search lookup)
            {
                displayName: 'Search Field',
                name: 'searchField',
                type: 'string',
                default: 'searchValue',
                description: 'Field name containing the search value',
                displayOptions: {
                    show: {
                        operation: ['searchLookup'],
                    },
                },
            },
            // Limit (for search lookup)
            {
                displayName: 'Limit',
                name: 'limit',
                type: 'number',
                default: 50,
                description: 'Maximum number of results (max: 100)',
                typeOptions: {
                    minValue: 1,
                    maxValue: 100,
                },
                displayOptions: {
                    show: {
                        operation: ['searchLookup'],
                    },
                },
            },
            // Metadata Fields (for set and lookup operations)
            {
                displayName: 'Metadata Fields',
                name: 'metadataFields',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: false,
                },
                default: {},
                options: [
                    {
                        name: 'metadata',
                        displayName: 'Metadata',
                        values: [
                            {
                                displayName: 'Include Timestamp',
                                name: 'includeTimestamp',
                                type: 'boolean',
                                default: true,
                                description: 'Include current timestamp in metadata',
                            },
                            {
                                displayName: 'Additional Fields',
                                name: 'additionalFields',
                                type: 'string',
                                default: '',
                                placeholder: 'field1,field2,field3',
                                description: 'Comma-separated list of additional fields to include in metadata',
                            },
                        ],
                    },
                ],
                displayOptions: {
                    show: {
                        operation: ['addToSet', 'addToLookup', 'fullLookup'],
                    },
                },
            },
            // Auto-create options
            {
                displayName: 'Auto-create Options',
                name: 'autoCreateOptions',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: false,
                },
                default: {},
                options: [
                    {
                        name: 'autoCreate',
                        displayName: 'Auto-create',
                        values: [
                            {
                                displayName: 'Create Set If Missing',
                                name: 'createSetIfMissing',
                                type: 'boolean',
                                default: false,
                                description: 'Automatically create set if it doesn\'t exist',
                                displayOptions: {
                                    show: {
                                        operation: ['checkSetValues', 'addToSet', 'fullLookup'],
                                    },
                                },
                            },
                            {
                                displayName: 'Create Lookup If Missing',
                                name: 'createLookupIfMissing',
                                type: 'boolean',
                                default: false,
                                description: 'Automatically create lookup if it doesn\'t exist',
                                displayOptions: {
                                    show: {
                                        operation: ['addToLookup', 'searchLookup', 'fullLookup'],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            // Advanced Settings
            {
                displayName: 'Advanced Settings',
                name: 'advancedSettings',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: false,
                },
                default: {},
                options: [
                    {
                        name: 'advanced',
                        displayName: 'Advanced',
                        values: [
                            {
                                displayName: 'Retry on Failure',
                                name: 'retryOnFailure',
                                type: 'number',
                                default: 3,
                                description: 'Number of retry attempts',
                                typeOptions: {
                                    minValue: 0,
                                    maxValue: 10,
                                },
                            },
                            {
                                displayName: 'Retry Delay (ms)',
                                name: 'retryDelay',
                                type: 'number',
                                default: 1000,
                                description: 'Delay between retries in milliseconds',
                                typeOptions: {
                                    minValue: 100,
                                    maxValue: 10000,
                                },
                            },
                            {
                                displayName: 'Continue on Error',
                                name: 'continueOnError',
                                type: 'boolean',
                                default: false,
                                description: 'Continue processing other items if one fails',
                            },
                            {
                                displayName: 'Timeout (ms)',
                                name: 'timeout',
                                type: 'number',
                                default: 30000,
                                description: 'Request timeout in milliseconds',
                                typeOptions: {
                                    minValue: 5000,
                                    maxValue: 120000,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;
            const advancedSettings = this.getNodeParameter('advancedSettings', i, {}) as any;
            const retryOnFailure = advancedSettings?.advanced?.retryOnFailure || 3;
            const retryDelay = advancedSettings?.advanced?.retryDelay || 1000;
            const continueOnError = advancedSettings?.advanced?.continueOnError || false;
            const timeout = advancedSettings?.advanced?.timeout || 30000;

            try {

                let result: any;

                switch (operation) {
                    case 'checkSetValues':
                        result = await (this as any).executeCheckSetValues(i, retryOnFailure, retryDelay, timeout);
                        break;
                    case 'addToSet':
                        result = await (this as any).executeAddToSet(i, retryOnFailure, retryDelay, timeout);
                        break;
                    case 'addToLookup':
                        result = await (this as any).executeAddToLookup(i, retryOnFailure, retryDelay, timeout);
                        break;
                    case 'searchLookup':
                        result = await (this as any).executeSearchLookup(i, retryOnFailure, retryDelay, timeout);
                        break;
                    case 'fullLookup':
                        result = await (this as any).executeFullLookup(i, retryOnFailure, retryDelay, timeout);
                        break;
                    case 'getAppInfo':
                        result = await (this as any).executeGetAppInfo(i, retryOnFailure, retryDelay, timeout);
                        break;
                    case 'healthCheck':
                        result = await (this as any).executeHealthCheck(i, retryOnFailure, retryDelay, timeout);
                        break;
                    default:
                        throw new Error(`Unknown operation: ${operation}`);
                }

                const newItem: INodeExecutionData = {
                    json: {
                        ...items[i].json,
                        ...result,
                    },
                };

                returnData.push(newItem);
            } catch (error) {
                if (advancedSettings?.advanced?.continueOnError) {
                    // Add error information to the item and continue
                    const errorItem: INodeExecutionData = {
                        json: {
                            ...items[i].json,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            success: false,
                        },
                    };
                    returnData.push(errorItem);
                } else {
                    // Re-throw the error to stop processing
                    throw error;
                }
            }
        }

        return [returnData];
    }

    private async executeCheckSetValues(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        const setName = this.getNodeParameter('setName', itemIndex) as string;
        const mode = this.getNodeParameter('mode', itemIndex) as string;
        const valueField = this.getNodeParameter('valueField', itemIndex) as string;
        const outputField = this.getNodeParameter('outputField', itemIndex) as string;
        const filterMode = this.getNodeParameter('filterMode', itemIndex) as string;
        const autoCreateOptions = this.getNodeParameter('autoCreateOptions', itemIndex, {}) as any;
        const createSetIfMissing = autoCreateOptions?.autoCreate?.createSetIfMissing || false;

        // Implementation will be added here
        return {
            [outputField]: true,
            checkedValue: 'sample-value',
            operation: 'checkSetValues',
        };
    }

    private async executeAddToSet(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        const setName = this.getNodeParameter('setName', itemIndex) as string;
        const mode = this.getNodeParameter('mode', itemIndex) as string;
        const valueField = this.getNodeParameter('valueField', itemIndex) as string;
        const metadataFields = this.getNodeParameter('metadataFields', itemIndex, {}) as any;
        const autoCreateOptions = this.getNodeParameter('autoCreateOptions', itemIndex, {}) as any;
        const createSetIfMissing = autoCreateOptions?.autoCreate?.createSetIfMissing || false;

        // Implementation will be added here
        return {
            addedToSet: true,
            setValue: 'sample-value',
            operation: 'addToSet',
        };
    }

    private async executeAddToLookup(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
        const mode = this.getNodeParameter('mode', itemIndex) as string;
        const leftField = this.getNodeParameter('leftField', itemIndex) as string;
        const rightField = this.getNodeParameter('rightField', itemIndex) as string;
        const metadataFields = this.getNodeParameter('metadataFields', itemIndex, {}) as any;
        const autoCreateOptions = this.getNodeParameter('autoCreateOptions', itemIndex, {}) as any;
        const createLookupIfMissing = autoCreateOptions?.autoCreate?.createLookupIfMissing || false;

        // Implementation will be added here
        return {
            mappingAdded: true,
            leftValue: 'sample-left',
            rightValue: 'sample-right',
            operation: 'addToLookup',
        };
    }

    private async executeSearchLookup(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
        const searchType = this.getNodeParameter('searchType', itemIndex) as string;
        const searchField = this.getNodeParameter('searchField', itemIndex) as string;
        const limit = this.getNodeParameter('limit', itemIndex) as number;
        const autoCreateOptions = this.getNodeParameter('autoCreateOptions', itemIndex, {}) as any;
        const createLookupIfMissing = autoCreateOptions?.autoCreate?.createLookupIfMissing || false;

        // Implementation will be added here
        return {
            results: [],
            totalFound: 0,
            operation: 'searchLookup',
        };
    }

    private async executeFullLookup(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
        const setName = this.getNodeParameter('setName', itemIndex) as string;
        const mode = this.getNodeParameter('mode', itemIndex) as string;
        const leftField = this.getNodeParameter('leftField', itemIndex) as string;
        const rightField = this.getNodeParameter('rightField', itemIndex) as string;
        const setValueField = this.getNodeParameter('setValueField', itemIndex) as string;
        const customSetValueField = this.getNodeParameter('customSetValueField', itemIndex) as string;
        const metadataFields = this.getNodeParameter('metadataFields', itemIndex, {}) as any;
        const autoCreateOptions = this.getNodeParameter('autoCreateOptions', itemIndex, {}) as any;
        const createLookupIfMissing = autoCreateOptions?.autoCreate?.createLookupIfMissing || false;
        const createSetIfMissing = autoCreateOptions?.autoCreate?.createSetIfMissing || false;

        // Implementation will be added here
        return {
            mappingAdded: true,
            setTrackingAdded: true,
            trackedValue: 'sample-value',
            operation: 'fullLookup',
        };
    }

    private async executeGetAppInfo(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        // Implementation will be added here
        return {
            appInfo: {
                id: 'sample-app-id',
                name: 'Sample App',
                isActive: true,
            },
            operation: 'getAppInfo',
        };
    }

    private async executeHealthCheck(
        this: IExecuteFunctions,
        itemIndex: number,
        retryOnFailure: number,
        retryDelay: number,
        timeout: number,
    ): Promise<any> {
        // Implementation will be added here
        return {
            health: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
            },
            operation: 'healthCheck',
        };
    }
} 