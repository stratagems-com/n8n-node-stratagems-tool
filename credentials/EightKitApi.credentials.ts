import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class EightKitApi implements ICredentialType {
    name = 'eightKitApi';
    displayName = '8kit API';
    documentationUrl = 'https://github.com/stratagems-com/stratagems-tools-open-source';
    iconUrl = 'file:../8kit.svg';
    properties: INodeProperties[] = [
        {
            displayName: 'Host URL',
            name: 'hostUrl',
            type: 'string',
            default: 'https://api.yourdomain.com',
            placeholder: 'https://api.yourdomain.com',
            description: 'Base URL of your 8kit API instance',
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
                'X-Api-Key': '={{$credentials.apiKey}}',
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