import { ICredentialType, NodePropertyTypes, INodeProperties } from 'n8n-workflow';

export class Ocilion implements ICredentialType {
	name = 'ocilion';

	displayName = 'Ocilion';

	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'http://213.174.227.206/api/v2',
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
