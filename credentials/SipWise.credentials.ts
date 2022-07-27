import { ICredentialType, NodePropertyTypes, INodeProperties } from 'n8n-workflow';

export class SipWise implements ICredentialType {
	name = 'sipWise';

	displayName = 'Sip Wise';

	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'https://sip.cnh.at:1443/api',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
		},
	];
}
