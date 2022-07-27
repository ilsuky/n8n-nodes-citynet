"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SipWise = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class SipWise {
    constructor() {
        this.description = {
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
                            operation: [
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
                            operation: [
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
                            operation: [
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
                            operation: [
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
                            operation: [
                                'getAll',
                            ],
                        },
                    },
                }
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnItems = [];
        const resource = this.getNodeParameter('resource', 0, '');
        const operation = this.getNodeParameter('operation', 0, '');
        let item;
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                if (operation == 'getAll') {
                    const split = this.getNodeParameter('split', itemIndex, '');
                    const limit = this.getNodeParameter('limit', itemIndex, '');
                    const endpoint = resource;
                    const filterInput = this.getNodeParameter('filters.filter', itemIndex, []);
                    item = items[itemIndex];
                    const qs = {};
                    for (let filterIndex = 0; filterIndex < filterInput.length; filterIndex++) {
                        qs[`${filterInput[filterIndex].name}`] = filterInput[filterIndex].value;
                    }
                    ;
                    qs.page = 1;
                    let data;
                    do {
                        data = await GenericFunctions_1.sipWiseApiRequest.call(this, 'Get', endpoint, {}, qs);
                        qs.page += 1;
                        if (split) {
                            const datajson = data._embedded[`ngcp:${resource}`];
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
                            newItem.json = data;
                            returnItems.push(newItem);
                        }
                        if (limit != 0 && returnItems.length > limit) {
                            return this.prepareOutputData(returnItems.slice(0, limit));
                        }
                    } while (data._links.next);
                }
                if (operation == 'update') {
                    const id = this.getNodeParameter('id', itemIndex, '');
                    const endpoint = `${resource}/${id}`;
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
                    newItem.json = await GenericFunctions_1.sipWiseApiRequest.call(this, 'Put', endpoint, requestBody, {});
                    returnItems.push(newItem);
                }
                if (operation == 'get') {
                    const id = this.getNodeParameter('id', itemIndex, '');
                    const endpoint = `${resource}/${id}`;
                    item = items[itemIndex];
                    const newItem = {
                        json: {},
                        binary: {},
                    };
                    newItem.json = await GenericFunctions_1.sipWiseApiRequest.call(this, 'Get', endpoint, {}, {});
                    returnItems.push(newItem);
                }
                if (operation == 'create') {
                    const endpoint = `${resource}/`;
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
                    newItem.json = await GenericFunctions_1.sipWiseApiRequest.call(this, 'Post', endpoint, requestBody, {});
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
exports.SipWise = SipWise;
//# sourceMappingURL=SipWise.node.js.map