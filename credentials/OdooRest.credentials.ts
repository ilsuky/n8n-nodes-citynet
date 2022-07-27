import { ICredentialType, NodePropertyTypes, INodeProperties } from 'n8n-workflow';

export class OdooRest implements ICredentialType {
	name = 'odooRest';

	displayName = 'Odoo Rest';

	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'https://erp.it.local/api',
		},
		{
			displayName: 'ApiToken',
			name: 'apiToken',
			type: 'string',
			default: '',
		},
	];
}
