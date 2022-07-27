"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ocilion = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class Ocilion {
    constructor() {
        this.description = {
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
                            operation: [
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
                            operation: [
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
                            operation: [
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
                            operation: [
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
    }
    async execute() {
        const items = this.getInputData();
        const returnItems = [];
        const resource = this.getNodeParameter('resource', 0, '');
        const operation = this.getNodeParameter('operation', 0, '');
        let item;
        const credentials = await this.getCredentials('ocilion');
        const cookie = await GenericFunctions_1.getCookie.call(this, credentials);
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                if (operation == 'get') {
                    const worldId = this.getNodeParameter('worldId', itemIndex, '');
                    const id = this.getNodeParameter('id', itemIndex, '');
                    const endpoint = `${worldId}/${resource}/${id}`;
                    item = items[itemIndex];
                    const newItem = {
                        json: {},
                        binary: {},
                    };
                    newItem.json = await GenericFunctions_1.ocilionApiRequest.call(this, 'Get', endpoint, {}, {}, cookie);
                    returnItems.push(newItem);
                }
                if (operation == 'update') {
                    const worldId = this.getNodeParameter('worldId', itemIndex, '');
                    const id = this.getNodeParameter('id', itemIndex, '');
                    const endpoint = `${worldId}/${resource}/${id}`;
                    const body = this.getNodeParameter('body', itemIndex, '');
                    let requestBody = {};
                    if (body.length > 0) {
                        try {
                            requestBody = JSON.parse(body);
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Request body is not valid JSON.');
                        }
                    }
                    item = items[itemIndex];
                    const newItem = {
                        json: {},
                        binary: {},
                    };
                    newItem.json = await GenericFunctions_1.ocilionApiRequest.call(this, 'Put', endpoint, requestBody, {}, cookie);
                    returnItems.push(newItem);
                }
                if (operation == 'getAll') {
                    const split = this.getNodeParameter('split', itemIndex, '');
                    const worldId = this.getNodeParameter('worldId', itemIndex, '');
                    const filter = this.getNodeParameter('filter', itemIndex, '');
                    const endpoint = `${worldId}/${resource}`;
                    let qs = {};
                    if (filter.length > 0) {
                        qs = { filter: filter };
                    }
                    item = items[itemIndex];
                    if (split) {
                        const data = await GenericFunctions_1.ocilionApiRequest.call(this, 'Get', endpoint, {}, qs, cookie);
                        const datajson = data.data;
                        for (let dataIndex = 0; dataIndex < datajson.length; dataIndex++) {
                            const newItem = {
                                json: {},
                                binary: {},
                            };
                            newItem.json = datajson[dataIndex];
                            returnItems.push(newItem);
                        }
                    }
                    else {
                        const newItem = {
                            json: {},
                            binary: {},
                        };
                        newItem.json = await GenericFunctions_1.ocilionApiRequest.call(this, 'Get', endpoint, {}, qs, cookie);
                        returnItems.push(newItem);
                    }
                }
                if (operation == 'create') {
                    const worldId = this.getNodeParameter('worldId', itemIndex, '');
                    const endpoint = `${worldId}/${resource}`;
                    const body = this.getNodeParameter('body', itemIndex, '');
                    let requestBody = {};
                    if (body.length > 0) {
                        try {
                            requestBody = JSON.parse(body);
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Request body is not valid JSON.');
                        }
                    }
                    item = items[itemIndex];
                    const newItem = {
                        json: {},
                        binary: {},
                    };
                    newItem.json = await GenericFunctions_1.ocilionApiRequest.call(this, 'Post', endpoint, requestBody, {}, cookie);
                    returnItems.push(newItem);
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnItems.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return this.prepareOutputData(returnItems);
    }
}
exports.Ocilion = Ocilion;
//# sourceMappingURL=Ocilion.node.js.map