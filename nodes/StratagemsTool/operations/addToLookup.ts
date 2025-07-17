import { IExecuteFunctions } from 'n8n-workflow';

export interface AddToLookupParams {
    lookupName: string;
    mode: string;
    leftField: string;
    rightField: string;
    metadataFields: any;
    createLookupIfMissing: boolean;
}

export async function executeAddToLookup(
    this: IExecuteFunctions,
    itemIndex: number,
    autoCreate: boolean,
): Promise<any> {
    const lookupName = this.getNodeParameter('lookupName', itemIndex) as string;
    const mode = this.getNodeParameter('mode', itemIndex) as string;
    const leftField = this.getNodeParameter('leftField', itemIndex) as string;
    const rightField = this.getNodeParameter('rightField', itemIndex) as string;

    // Implementation will be added here
    return {
        mappingAdded: true,
        leftValue: 'sample-left',
        rightValue: 'sample-right',
        operation: 'addToLookup',
        autoCreate,
    };
} 