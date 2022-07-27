import { json } from 'express';
import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeParameters, INodeType, INodeTypeDescription } from 'n8n-workflow';

import {
	easyProvisioningApiRequest, getJwtToken,
} from './GenericFunctions';
import { EasyProvisioningApiCredentials } from './types';

export class EasyProvisioning implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Easy Provisioning',
		name: 'easyProvisioning',
		icon: 'file:easy.svg',
		group: ['transform'],
		version: 1,
		description: 'Easy Provisioning Api',
		defaults: {
			name: 'Easy Provisioning',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'easyProvisioning',
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
						name: 'Installations',
						value: 'installations',
					},
					{
						name: 'Internet Accesses',
						value: 'internet_accesses',
					},
					{
						name: 'Internet services',
						value: 'internet_services',
					},
					{
						name: 'Credentials',
						value: 'credentials',
					},					
					{
						name: 'Devices',
						value: 'devices',
					},					
					{
						name: 'Voice lines',
						value: 'voice_lines',
					},
					{
						name: 'Voice services',
						value: 'voice_services',
					},
					{
						name: 'TV services',
						value: 'tv_services',
					},
					{
						name: 'Wifi configurations',
						value: 'wifi_configurations',
					},
					{
						name: 'CreateLog',
						value: 'customer_histories',
					},
				],
				default: 'customers',
				description: 'Resource to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'customers',
							'installations',
							'internet_accesses',
							'internet_services',
							'credentials',
							'devices',
							'voice_lines',
							'voice_services',
							'tv_services',
							'wifi_configurations',
							'customer_histories',
						],
					},
				},
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
						name: 'Pagination',
						value: 'pagination',
						description: 'Retrieve pagination',						
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record',
					},					
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record',
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
							'delete',
							'update',
						],
					},
				},
				default: '',
				description: 'Id of Resource',
			},
			{
				displayName: 'Filter Attribute',
				name: 'filterAttribute',
				type: 'string',
				default: '',
				description: 'The attribute to filter on',
				displayOptions: {
					show: {
						operation:[
							'getAll',
							'pagination',
						],
					},
				},
			},
			{
				displayName: 'Filter Operation',
				name: 'filterOperation',
				type: 'string',
				default: '',
				description: 'The filter Operation',
				displayOptions: {
					show: {
						operation:[
							'getAll',
							'pagination',
						],
					},
				},
			},
			{
				displayName: 'Filter Value',
				name: 'filterValue',
				type: 'string',
				default: '',
				description: 'The value to filter',
				displayOptions: {
					show: {
						operation:[
							'getAll',
							'pagination',
						],
					},
				},
			},
			{
				displayName: 'Retrieve and Split Data Items',
				name: 'split',
				type: 'boolean',
				displayOptions: {
					show: {
						operation:[
							'getAll',
							'pagination',
						],
					},
				},
				default: true,
				description: 'Retrieve and Split Data array into seperate Items',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						operation:[
							'pagination',
						],
					},
				},
				default: 1,
				description: 'Current Page',
			},			
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation:[
							'getAll',
							'pagination',
						],
					},
				},
				default: 10,
				description: 'Limit the items Retrieved',
			},
			{
				displayName: 'Values to Set',
				name: 'values',
				placeholder: 'Add Value',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				description: 'The value to set.',
				default: {},
				options: [
					{
						name: 'attributes',
						displayName: 'Attributes',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of value to set',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to set.',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation:[
							'create',
							'update',
						],
					},
				},
			},
			{
				displayName: 'Relationships to Set',
				name: 'relationships',
				type: 'json',
				default: '',
				description: '',
				displayOptions: {
					show: {
						operation:[
							'create',
							'update',
						],
					},
				},				
			},			
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		
		const resource = this.getNodeParameter('resource', 0, '') as string;
		const operation = this.getNodeParameter('operation', 0, '') as string;
		let item: INodeExecutionData;

		const credentials = await this.getCredentials('easyProvisioning') as EasyProvisioningApiCredentials;
		const token = await getJwtToken.call(this,credentials);
		// Itterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			try{
				//--------------------------------------------------------
				// 						Get
				//--------------------------------------------------------
				if(operation == 'get'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					
					const endpoint = `${resource}/${id}`;
					
					item = items[itemIndex];

					const data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, {},token);
					const datajson = data.data;
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = datajson;

					returnItems.push(newItem);
						
				}

				//--------------------------------------------------------
				// 						Pagination
				//--------------------------------------------------------
				if(operation == 'pagination'){
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const limit = this.getNodeParameter('limit', itemIndex, '') as number;
					const page = this.getNodeParameter('page', itemIndex, '') as number;
					const endpoint = resource;
					
					const filterAttribute = this.getNodeParameter('filterAttribute', itemIndex, '') as string;
					const filterOperation = this.getNodeParameter('filterOperation', itemIndex, '') as string;
					const filterkey = filterAttribute+'_'+filterOperation;
					const filterValue = this.getNodeParameter('filterValue', itemIndex, '') as string;
					
					
					let qs:IDataObject = {};
					qs[`page[number]`] = page;
					qs[`page[size]`] = limit;
					
					if(filterAttribute.length>0){
						qs[`filter[${filterkey}]`] = filterValue;
					}
					
					console.log(qs);
					
					const data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, qs ,token);
					
					if(split){
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
						newItem.json = data;
						returnItems.push(newItem);
					}	
						
				}					

				//--------------------------------------------------------
				// 						GetAll
				//--------------------------------------------------------
				if(operation == 'getAll'){
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const limit = this.getNodeParameter('limit', itemIndex, '') as number;
					const endpoint = resource;

					const filterAttribute = this.getNodeParameter('filterAttribute', itemIndex, '') as string;
					const filterOperation = this.getNodeParameter('filterOperation', itemIndex, '') as string;
					const filterkey = filterAttribute+'_'+filterOperation;
					const filterValue = this.getNodeParameter('filterValue', itemIndex, '') as string;

					let qs:IDataObject = {};
					qs[`page[number]`] = 1;
					if(filterAttribute.length>0 && filterOperation.length>0 && filterValue.length>0){
						qs[`filter[${filterkey}]`] = filterValue;
					}

					item = items[itemIndex];
					
					
					let data;
					do {
						data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, qs ,token);
						qs[`page[number]`] += 1;
						if(split){
							//const data = await easyProvisioningApiRequest.call(this,'Get', endpoint, {}, qs ,token);
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
							newItem.json = data;
							returnItems.push(newItem);
						}

						if (limit!=0 && returnItems.length > limit) {
							return this.prepareOutputData(returnItems.slice(0, limit));
						}

					} while (data.links.next);
				}

				//--------------------------------------------------------
				// 						Update
				//--------------------------------------------------------
				if(operation == 'update'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = `${resource}/${id}`;
					const relationshipsInput = this.getNodeParameter('relationships', itemIndex, '') as string;
					const attributesInput = this.getNodeParameter('values.attributes', itemIndex, []) as INodeParameters[];
					item = items[itemIndex];
					
					const attributes:IDataObject ={};
					for (let attributesIndex = 0; attributesIndex < attributesInput.length; attributesIndex++) {
						attributes[`${attributesInput[attributesIndex].name}`] = attributesInput[attributesIndex].value;
					};
					
					let relationships = {};
					if(relationshipsInput && relationshipsInput.length>0){
						relationships = JSON.parse(relationshipsInput);
					}
					
					const toCreate:IDataObject ={};
					toCreate.data ={
						"type": resource,
						attributes,
						"relationships": relationships,
					};
					
					console.log(toCreate);
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await easyProvisioningApiRequest.call(this,'Put', endpoint, toCreate, {},token);
					returnItems.push(newItem);
				}	

				//--------------------------------------------------------
				// 						Create
				//--------------------------------------------------------
				if(operation == 'create'){
					const endpoint = resource;
					const relationshipsInput = this.getNodeParameter('relationships', itemIndex, '') as string;
					const attributesInput = this.getNodeParameter('values.attributes', itemIndex, []) as INodeParameters[];
					item = items[itemIndex];
					
					const attributes:IDataObject ={};
					for (let attributesIndex = 0; attributesIndex < attributesInput.length; attributesIndex++) {
						attributes[`${attributesInput[attributesIndex].name}`] = attributesInput[attributesIndex].value;
					};

					let relationships = {};
					if(relationshipsInput && relationshipsInput.length>0){
						relationships = JSON.parse(relationshipsInput);
					}
					
					const toCreate:IDataObject ={};
					toCreate.data = {
						"type": resource,
						attributes,
						"relationships": relationships,
					};
					
					console.log(toCreate);
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await easyProvisioningApiRequest.call(this,'Post', endpoint, toCreate, {},token);
					returnItems.push(newItem);
				}		

				//--------------------------------------------------------
				// 						Delete
				//--------------------------------------------------------
				if(operation == 'delete'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = `${resource}/${id}`;

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = await easyProvisioningApiRequest.call(this,'Delete', endpoint, {}, {},token);
					
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
