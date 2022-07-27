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
	OcilionApiCredentials,
} from './types';


export async function ocilionApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	cookie: string
) {
	const credentials = await this.getCredentials('ocilion') as OcilionApiCredentials;

	const options: OptionsWithUri = {
		headers: {
			'Cookie': cookie,
			'Content-Type': 'application/json',
			'Accept': '*/*',
		},
		method,
		body,
		qs,
		uri: `${credentials.host}/${endpoint}`,
		json: true,
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
		throw new NodeApiError(this.getNode(), {'error':error});
	}
}

/**
 * Get a Cookie based on Ocilion account username and password.
 */
 export async function getCookie(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	{ username, password, host }: OcilionApiCredentials,
) {
	const credentials = await this.getCredentials('ocilion') as OcilionApiCredentials;
	const options: OptionsWithUri = {
		method: 'POST',
		form: {
			username:username,
			password:password,
		},
		uri: `${host}/login`,
		//@ts-ignore
		resolveWithFullResponse: true,
		rejectUnauthorized: false,
		
	};

	try {
		const cookie = await this.helpers.request!(options);
		const cookieheader = cookie.headers['set-cookie'];
		return cookieheader;
	} catch (error:any) {
		throw new NodeApiError(this.getNode(), {error:error});
	}
}