import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class StratagemsApi implements ICredentialType {
    name = 'stratagemsApi';
    displayName = 'Stratagems API';
    documentationUrl = 'https://github.com/your-org/st-open-source';
    properties: INodeProperties[] = [
        {
            displayName: 'Host URL',
            name: 'hostUrl',
            type: 'string',
            default: 'https://api.yourdomain.com',
            placeholder: 'https://api.yourdomain.com',
            description: 'Base URL of your Stratagems API instance',
            required: true,
        },
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            placeholder: 'st_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            description: 'Your application API key (starts with st_)',
            required: true,
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'X-API-Key': '={{$credentials.apiKey}}',
                'Content-Type': 'application/json',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.hostUrl}}',
            url: '/api/v1/apps/health',
            method: 'GET',
        },
    };
} 