"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odooRestApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function odooRestApiRequest(method, endpoint, body = {}, qs = {}) {
    const credentials = await this.getCredentials('odooRest');
    const options = {
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
            'Content-Type': 'http',
        };
    }
    if (method === 'Put') {
        options.headers = {
            'api-key': `${credentials.apiToken}`,
            'Content-Type': 'http',
        };
    }
    if (Object.keys(qs).length === 0) {
        delete options.qs;
    }
    if (Object.keys(body).length === 0) {
        delete options.body;
    }
    else {
        options.json = true;
    }
    try {
        return await this.helpers.request(options);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
exports.odooRestApiRequest = odooRestApiRequest;
//# sourceMappingURL=GenericFunctions.js.map