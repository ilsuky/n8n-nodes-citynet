import { ICredentialType, NodePropertyTypes, INodeProperties } from 'n8n-workflow';

export class EasyProvisioning implements ICredentialType {
	name = 'easyProvisioning';

	displayName = 'Easy Provisioning';

	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'https://cwmapi.citynet.at',
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
