"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sipWiseApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function sipWiseApiRequest(method, endpoint, body = {}, qs = {}) {
    const credentials = await this.getCredentials('sipWise');
    const options = {
        headers: {},
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
        return await this.helpers.request(options);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), { 'error': error });
    }
}
exports.sipWiseApiRequest = sipWiseApiRequest;
//# sourceMappingURL=GenericFunctions.js.map