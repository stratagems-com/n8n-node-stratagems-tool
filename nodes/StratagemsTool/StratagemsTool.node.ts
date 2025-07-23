import {
    IExecuteFunctions,
    NodeConnectionType,
    type INodeExecutionData,
    type INodeType,
    type INodeTypeDescription,
} from 'n8n-workflow';

import {
    executeAddToLookup,
    executeAddToSet,
    executeCheckSetValues,
    executeFullLookup,
    executeGetAppInfo,
    executeHealthCheck,
    executeSearchLookup,
} from './operations';

export class StratagemsTool implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Stratagems Tool',
        name: 'stratagemsTool',
        icon: 'file:stratagemsTool.svg',
        group: ['transform'],
        version: 2,
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
                        operation: [],
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
            // Metadata Fields (for addToSet)
            {
                displayName: 'Metadata Fields',
                name: 'metadataFields',
                type: 'string',
                default: '',
                placeholder: 'field1,field2,field3',
                description: 'Comma-separated list of input fields to include as metadata',
                displayOptions: {
                    show: {
                        operation: ['addToSet'],
                    },
                },
            },
            {
                displayName: 'Left Metadata Fields',
                name: 'leftMetadataFields',
                type: 'string',
                default: '',
                placeholder: 'field1,field2,field3',
                description: 'Comma-separated list of input fields to include as metadata',
                displayOptions: {
                    show: {
                        operation: ['addToLookup', 'fullLookup'],
                    },
                },
            },
            {
                displayName: 'Right Metadata Fields',
                name: 'rightMetadataFields',
                type: 'string',
                default: '',
                placeholder: 'field1,field2,field3',
                description: 'Comma-separated list of input fields to include as metadata',
                displayOptions: {
                    show: {
                        operation: ['addToLookup', 'fullLookup'],
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
            // Search Value (for search lookup)
            {
                displayName: 'Search Value',
                name: 'searchValue',
                type: 'string',
                default: '',
                placeholder: 'Value to search for',
                description: 'The value to search for in the lookup',
                displayOptions: {
                    show: {
                        operation: ['searchLookup'],

                    },

                },
            },

            // ======== ADVANCED SETTINGS GROUP ========
            {
                displayName: 'Advanced Settings',
                name: 'advancedSettingsGroup',
                type: 'notice',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues', 'addToSet', 'addToLookup', 'searchLookup', 'fullLookup'],
                    },
                },
            },
            // Auto Create Set/Lookup
            {
                displayName: 'Auto Create Set/Lookup',
                name: 'autoCreate',
                type: 'boolean',
                default: false,
                description: 'Automatically create set or lookup if it doesn\'t exist (based on operation)',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues', 'addToSet', 'addToLookup', 'searchLookup', 'fullLookup'],
                    },
                },
            },
            // Get Set Value Data (new switch)
            {
                displayName: 'Get Set Value Data',
                name: 'getSetValueData',
                type: 'boolean',
                default: false,
                description: 'Include set value data in the output alongside input data',
                displayOptions: {
                    show: {
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
                description: 'Field name to store the set value data in the output',
                displayOptions: {
                    show: {
                        operation: ['checkSetValues'],
                        getSetValueData: [true],
                    },
                },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];


        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;
            const autoCreate = this.getNodeParameter('autoCreate', i, false) as boolean;

            try {
                let result: any;

                switch (operation) {
                    case 'checkSetValues':
                        result = await executeCheckSetValues.call(this, i, autoCreate);
                        break;
                    case 'addToSet':
                        result = await executeAddToSet.call(this, i, autoCreate);
                        break;
                    case 'addToLookup':
                        result = await executeAddToLookup.call(this, i, autoCreate);
                        break;
                    case 'searchLookup':
                        result = await executeSearchLookup.call(this, i, autoCreate);
                        break;
                    case 'fullLookup':
                        result = await executeFullLookup.call(this, i, autoCreate);
                        break;
                    case 'getAppInfo':
                        result = await executeGetAppInfo.call(this, i);
                        break;
                    case 'healthCheck':
                        result = await executeHealthCheck.call(this, i);
                        break;
                    default:
                        throw new Error(`Unknown operation: ${operation}`);
                }

                // Handle different result types
                if (result === null || result === undefined) {
                    // Skip this item completely - don't add to returnData
                    continue;
                }

                // Handle empty objects
                if (typeof result === 'object' && Object.keys(result).length === 0) {
                    // Skip empty objects too
                    continue;
                }

                // Add valid results
                const newItem: INodeExecutionData = {
                    json: result,
                };
                returnData.push(newItem);
            } catch (error) {
                // Re-throw the error to stop processing
                throw error;
            }
        }

        // Return empty array if no items passed the filter
        return [returnData];
    }
}