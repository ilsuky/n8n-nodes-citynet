import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeParameters, INodeType, INodeTypeDescription, NodeOperationError } from 'n8n-workflow';

import {
	sipWiseApiRequest,
} from './GenericFunctions';

export class SipWise implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sip Wise',
		name: 'sipWise',
		icon: 'file:sipwise.svg',
		group: ['transform'],
		version: 1,
		description: 'SipWise Api Node',
		defaults: {
			name: 'Sip Wise',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'sipWise',
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
					{
						name: 'Customercontacts',
						value: 'customercontacts',
					},
					{
						name: 'Subscriber',
						value: 'subscribers',
					},
					{
						name: 'SubscriberPreferences',
						value: 'subscriberpreferences',
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
						description: 'Retrieve all records',
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
				description: 'Id of Resource',
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
				description: 'Body of request',
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
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
				default: 10,
				description: 'Limit the items Retrieved',
			},
			{
				displayName: 'Filters to Set',
				name: 'filters',
				placeholder: 'Add Filter',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				description: 'The filter to set.',
				default: {},
				options: [
					{
						name: 'filter',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of filter to set',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Filter value to set.',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation:[
							'getAll',
						],
					},
				},
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		
		const resource = this.getNodeParameter('resource', 0, '') as string;
		const operation = this.getNodeParameter('operation', 0, '') as string;
		let item: INodeExecutionData;

		// Itterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			try{
				//--------------------------------------------------------
				// 						GetAll
				//--------------------------------------------------------
				if(operation == 'getAll'){

					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const limit = this.getNodeParameter('limit', itemIndex, '') as number;
					const endpoint = resource;

					const filterInput = this.getNodeParameter('filters.filter', itemIndex, []) as INodeParameters[];
					item = items[itemIndex];
					
					
					const qs:IDataObject ={};
					for (let filterIndex = 0; filterIndex < filterInput.length; filterIndex++) {
						qs[`${filterInput[filterIndex].name}`] = filterInput[filterIndex].value;
					};
					qs.page = 1;
					let data;
					do {
						data = await sipWiseApiRequest.call(this,'Get', endpoint, {}, qs);
						qs.page += 1;
					
						if(split){
							//const data = await sipWiseApiRequestAllItems.call(this,'Get', endpoint, {}, qs);
							const datajson = data._embedded[`ngcp:${resource}`];
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
							newItem.json = data;
							returnItems.push(newItem);
						}

						if (limit!=0 && returnItems.length > limit) {
							return this.prepareOutputData(returnItems.slice(0, limit));
						}

					} while (data._links.next);
				}
				
				//--------------------------------------------------------
				// 						Update
				//--------------------------------------------------------
				if(operation == 'update'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = `${resource}/${id}`;
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
					newItem.json = await sipWiseApiRequest.call(this,'Put', endpoint, requestBody, {});
					returnItems.push(newItem);
				}				
				
				//--------------------------------------------------------
				// 						Get
				//--------------------------------------------------------
				if(operation == 'get'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = `${resource}/${id}`;
					
					item = items[itemIndex];

					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await sipWiseApiRequest.call(this,'Get', endpoint, {}, {});
					returnItems.push(newItem);
				}

				//--------------------------------------------------------
				// 						Create
				//--------------------------------------------------------
				if(operation == 'create'){
					const endpoint = `${resource}/`;
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
					newItem.json = await sipWiseApiRequest.call(this,'Post', endpoint, requestBody, {});
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