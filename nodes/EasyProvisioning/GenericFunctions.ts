import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	IDataObject,
	ILoadOptionsFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import {
	EasyProvisioningApiCredentials,
} from './types';


export async function easyProvisioningApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	jwtToken: string
) {
	const credentials = await this.getCredentials('easyProvisioning') as EasyProvisioningApiCredentials;
	const options: OptionsWithUri = {
		headers: {
			'Authorization': 'Bearer ' + jwtToken,
		},
		method,
		body,
		qs,
		uri: `${credentials.host}/api/v1/${endpoint}`,
		json: true,
		gzip: true,
		rejectUnauthorized: false,
	};

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	} 

	if (Object.keys(body).length === 0) {
		delete options.body;
	}
	try {
		return await this.helpers.request!(options);
	} catch (error:any) {
		throw new NodeApiError(this.getNode(), {error:error});
	}
}


/**
 * Get a JWT Token based on Easy provisioning account username and password.
 */
 export async function getJwtToken(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	{ username, password, host }: EasyProvisioningApiCredentials,
) {
	const options: OptionsWithUri = {
		method: 'POST',
		body: `{ "user": {"email": "${username}", "password": "${password}"} }`,
		uri: `${host}/user_service/api/v1/login`,
		json: true,
		rejectUnauthorized: false,
	};

	try {
		const token = await this.helpers.request!(options);
		return token.jwt;
	} catch (error:any) {
		throw new NodeApiError(this.getNode(), {error:error});
	}
}