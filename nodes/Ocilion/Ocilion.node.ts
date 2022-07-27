import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError } from 'n8n-workflow';

import {
	getCookie,
	ocilionApiRequest,
} from './GenericFunctions';

import { OcilionApiCredentials } from './types';

export class Ocilion implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ocilion',
		name: 'ocilion',
		icon: 'file:ocilion.svg',
		group: ['transform'],
		version: 1,
		description: 'Ocilion Api',
		defaults: {
			name: 'Ocilion',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'ocilion',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Customers',
						value: 'customers',
					},
				],
				default: 'customers',
				description: 'Resource to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a record',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Retrieve a record',
					},
					{
						name: 'GetAll',
						value: 'getAll',
						description: 'Retrieve all record',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record',
					},					
				],
				default: 'get',
				description: 'Operation to perform',
			},
			{
				displayName: 'WorldId',
				name: 'worldId',
				type: 'string',
				default: '',
				description: 'World Id of resource',
			},
			{
				displayName: 'Id',
				name: 'id',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'get',
							'update',
						],
					},
				},
				default: '',
				description: 'Id of resource',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
				default: '[{"property":"","value":"","op":"="}]',
				description: 'Filter to apply',
			},
			{
				displayName: 'Retrieve and Split Data Items',
				name: 'split',
				type: 'boolean',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
				default: true,
				description: 'Retrieve and Split Data array into seperate Items',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'create',
							'update',
						],
					},
				},
				default: '',
				description: 'Request body',
			},			
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		
		const resource = this.getNodeParameter('resource', 0, '') as string;
		const operation = this.getNodeParameter('operation', 0, '') as string;
		let item: INodeExecutionData;
		const credentials = await this.getCredentials('ocilion') as OcilionApiCredentials;
		const cookie = await getCookie.call(this,credentials);
		// Itterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			try{

				//--------------------------------------------------------
				// 						Get
				//--------------------------------------------------------
				if(operation == 'get'){
					
					const worldId = this.getNodeParameter('worldId', itemIndex, '') as string;
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = `${worldId}/${resource}/${id}`;
					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await ocilionApiRequest.call(this,'Get', endpoint, {}, {},cookie);
					returnItems.push(newItem);
				}
				
				//--------------------------------------------------------
				// 						Update
				//--------------------------------------------------------
				if(operation == 'update'){
					const worldId = this.getNodeParameter('worldId', itemIndex, '') as string;
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = `${worldId}/${resource}/${id}`;
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					let requestBody:IDataObject = {};
					if(body.length >0){
						try {
							requestBody = JSON.parse(body);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Request body is not valid JSON.');
						}
					}
					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await ocilionApiRequest.call(this,'Put', endpoint, requestBody, {},cookie);
					returnItems.push(newItem);
				}
				
				//--------------------------------------------------------
				// 						GetAll
				//--------------------------------------------------------
				if(operation == 'getAll'){
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const worldId = this.getNodeParameter('worldId', itemIndex, '') as string;
					const filter = this.getNodeParameter('filter', itemIndex, '') as string;
					const endpoint = `${worldId}/${resource}`;
					let qs:IDataObject = {};
					if(filter.length > 0){
						qs = { filter : filter };
					}
					
					item = items[itemIndex];
					if(split){
						const data = await ocilionApiRequest.call(this,'Get', endpoint, {}, qs,cookie);
						const datajson = data.data;
						for (let dataIndex = 0; dataIndex < datajson.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = datajson[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = await ocilionApiRequest.call(this,'Get', endpoint, {}, qs,cookie);
						returnItems.push(newItem);
					}
				}

				//--------------------------------------------------------
				// 						Create
				//--------------------------------------------------------
				if(operation == 'create'){
					const worldId = this.getNodeParameter('worldId', itemIndex, '') as string;
					const endpoint = `${worldId}/${resource}`;
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					let requestBody:IDataObject = {};
					if(body.length >0){
						try {
							requestBody = JSON.parse(body);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Request body is not valid JSON.');
						}
					}
					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await ocilionApiRequest.call(this,'Post', endpoint, requestBody, {},cookie);
					returnItems.push(newItem);
				}

				
			} catch (error:any) {
				if (this.continueOnFail()) {
					returnItems.push({json:{ error: error.message}});
					continue;
				}
				throw error;
			}

		}

		return this.prepareOutputData(returnItems);
	}
}
