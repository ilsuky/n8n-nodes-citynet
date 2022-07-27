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
	Accumulator,
	OdooRestApiCredentials,
	LoadedResource,
} from './types';


export async function odooRestApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {}
) {
	const credentials = await this.getCredentials('odooRest') as OdooRestApiCredentials;
	const options: OptionsWithUri = {
		headers: {
			'api-key': `${credentials.apiToken}`,
		},
		method,
		body,
		qs,
		uri: `${credentials.host}/${endpoint}`,
		json: false,
		gzip: true,
		rejectUnauthorized: false,
	};

	if (method === 'Post') {
		options.headers = {
			'api-key': `${credentials.apiToken}`,
			'Content-Type' : 'http',
		};
	}

	if (method === 'Put') {
		options.headers = {
			'api-key': `${credentials.apiToken}`,
			'Content-Type' : 'http',
		};
	}

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}
	else{
		options.json = true;
	}

	try {
		return await this.helpers.request!(options);
	} catch (error:any) {
		throw new NodeApiError(this.getNode(), error);
	}
}