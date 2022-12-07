import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError } from 'n8n-workflow';

import {
	odooRestApiRequest,
} from './GenericFunctions';

export class OdooRest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Odoo Rest',
		name: 'odooRest',
		icon: 'file:odoo.svg',
		group: ['transform'],
		version: 1,
		description: 'Odoo Rest Api Addon',
		defaults: {
			name: 'Odoo Rest',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'odooRest',
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
						name: 'Partner',
						value: 'res.partner',
					},					
					{
						name: 'Installation',
						value: 'res.partner.installation',
					},
					{
						name: 'User',
						value: 'res.users',
					},
					{
						name: 'Project Task',
						value: 'project.task',
					},
					{
						name: 'Project Task Type',
						value: 'project.task.type',
					},					
					{
						name: 'Sale Order',
						value: 'sale.order',
					},
					{
						name: 'Sale Order Line',
						value: 'sale.order.line',
					},
					{
						name: 'Sale Order Line Dynamic Info',
						value: 'sale.product.dynamic.info',
					},
					{
						name: 'Helpdesk',
						value: 'helpdesk.ticket',
					},		
					{
						name: 'Phone Number',
						value: 'phone.number.info',
					},
					{
						name: 'Domains',
						value: 'web.domain.info',
					},
					{
						name: 'CPE',
						value: 'cpe.dynamic.info',
					},
					{
						name: 'Set-Top-Box',
						value: 'settop.dynamic.info',
					},
					{
						name: 'E-Mail',
						value: 'email.dynamic.info',
					},
					{
						name: 'E-Mail Alias',
						value: 'emailalias.dynamic.info',
					},
					{
						name: 'SLA-PIN',
						value: 'slapin.dynamic.info',
					},
					{
						name: 'Bank Statement',
						value: 'account.bank.statement',
					},
					{
						name: 'Bank Statement Lines',
						value: 'account.bank.statement.line',
					},
					{
						name: 'Domain Handle',
						value: 'domain.contact.handle',
					},
					{
						name: 'Domain Documentation',
						value: 'domain.domain.registry',
					},
					{
						name: 'Domain Registrars',
						value: 'domain.registrar',
					},
					{
						name: 'Domain Nameserver',
						value: 'domain.nameserver',
					},	
					{
						name: 'Webserver Subscriptions',
						value: 'webserver.subscriptions',
					},	
					{
						name: 'Webserver Config',
						value: 'webserver.config',
					},	
					{
						name: 'StadwerkBilling',
						value: 'stadwerk.billing',
					},	
					{
						name: 'StadwerkBillingLine',
						value: 'stadwerk.billing.line',
					},		
					{
						name: 'Employee',
						value: 'hr.employee',
					},		
					{
						name: 'Attendance',
						value: 'hr.attendance',
					},							
					{
						name: 'LogNote',
						value: 'mail.message',
					},
				],
				default: 'res.partner',
				description: 'Object model to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search record(s)',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by Id',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record by Id',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record by Id',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new record',
					},
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a Function',
					},
					{
						name: 'Schema',
						value: 'schema',
						description: 'Retrieve the schema of the Resource',
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
							'delete',
						],
					},
				},
				default: '',
				description: 'Id of the Resource',
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
							'execute',
						],
					},
				},
				default: '',
				description: 'Request body',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'search',
						],
					},
				},
				default: '',
				description: 'Search Domain',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						operation:[
							'search',
						],
					},
				},
				default: '',
				description: 'Fields to retrieve',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation:[
							'search',
						],
					},
				},
				default: 10,
				description: 'Limit the items Retrieved',
			},			
			{
				displayName: 'Retrieve and Split Data Items',
				name: 'split',
				type: 'boolean',
				displayOptions: {
					show: {
						operation:[
							'get',
							'search',
							'schema',
						],
					},
				},
				default: true,
				description: 'Retrieve and Split Data array into seperate Items',
			},
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
				// 						Search
				//--------------------------------------------------------
				if(operation == 'search'){
					const domain = this.getNodeParameter('domain', itemIndex, '') as string;
					const fields = this.getNodeParameter('fields', itemIndex, '') as string;
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const limit = this.getNodeParameter('limit', itemIndex, '') as string;
					const endpoint = resource + '/search';
					
					const qs =
									{	
										domain: `${domain}`,
										fields: `${fields}`,
										limit: `${limit}`
									}
								;
					item = items[itemIndex];
					if(split){
						const data = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, qs)).data;
						for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, qs));
	
						returnItems.push(newItem);
					}
				}
				//--------------------------------------------------------
				// 						Get
				//--------------------------------------------------------
				if(operation == 'get'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;
					const endpoint = resource + '/' + id;

					item = items[itemIndex];

					if(split){
						const data = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {})).data;
						for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {}));
	
						returnItems.push(newItem);
					}
				}
				//--------------------------------------------------------
				// 						Update
				//--------------------------------------------------------
				if(operation == 'update'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					const endpoint = resource + '/' + id;
					let jsonBody = {};
					if(body && body.length>0){
						jsonBody = JSON.parse(body);
					}

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(JSON.stringify(await odooRestApiRequest.call(this,'Put', endpoint, jsonBody, {})));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Delete
				//--------------------------------------------------------
				if(operation == 'delete'){
					const id = this.getNodeParameter('id', itemIndex, '') as string;
					const endpoint = resource + '/' + id;

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Delete', endpoint, {}, {}));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Create
				//--------------------------------------------------------
				if(operation == 'create'){
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					const endpoint = resource + '/create';
					
					let requestBody:IDataObject = {};
					if(body.length >0){
						try {
							requestBody = JSON.parse(body);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Request body is not valid JSON: ' + body );
						}
					}
					
					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(JSON.stringify(await odooRestApiRequest.call(this,'Post', endpoint, requestBody, {})));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Execute
				//--------------------------------------------------------
				if(operation == 'execute'){
					const body = this.getNodeParameter('body', itemIndex, '') as string;
					const endpoint = resource + '/execute_kw';
					let jsonBody = {};
					if(body && body.length>0){
						jsonBody = JSON.parse(body);
					}

					item = items[itemIndex];
					const newItem: INodeExecutionData = {
						json: {},
						binary: {},
					};
					newItem.json = JSON.parse(JSON.stringify(await odooRestApiRequest.call(this,'Post', endpoint, jsonBody, {})));
					
					returnItems.push(newItem);
				}
				//--------------------------------------------------------
				// 						Schema
				//--------------------------------------------------------
				if(operation == 'schema'){
					const endpoint = resource + '/schema';
					const split = this.getNodeParameter('split', itemIndex, '') as boolean;

					item = items[itemIndex];
					if(split){
						const data = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {})).data;
						for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
							const newItem: INodeExecutionData = {
								json: {},
								binary: {},
							};
							newItem.json = data[dataIndex];
	
							returnItems.push(newItem);
						}
					}
					else{
						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};
						newItem.json = JSON.parse(await odooRestApiRequest.call(this,'Get', endpoint, {}, {}));
	
						returnItems.push(newItem);
					}
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
