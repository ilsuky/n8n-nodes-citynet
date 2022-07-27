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
	SipWiseApiCredentials,
	LoadedResource,
} from './types';


export async function sipWiseApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {}
) {
	const credentials = await this.getCredentials('sipWise') as SipWiseApiCredentials;

	const options: OptionsWithUri = {
		headers: {
		},
		method,
		body,
		qs,
		uri: `${credentials.host}/${endpoint}`,
		json: true,
		auth: {
			user: credentials.username,
			pass: credentials.password,
		},
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
		throw new NodeApiError(this.getNode(), {'error':error});
	}
}
