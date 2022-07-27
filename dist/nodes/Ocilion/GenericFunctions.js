"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = exports.ocilionApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function ocilionApiRequest(method, endpoint, body = {}, qs = {}, cookie) {
    const credentials = await this.getCredentials('ocilion');
    const options = {
        headers: {
            'Cookie': cookie,
            'Content-Type': 'application/json',
            'Accept': '*/*',
        },
        method,
        body,
        qs,
        uri: `${credentials.host}/${endpoint}`,
        json: true,
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
exports.ocilionApiRequest = ocilionApiRequest;
async function getCookie({ username, password, host }) {
    const credentials = await this.getCredentials('ocilion');
    const options = {
        method: 'POST',
        form: {
            username: username,
            password: password,
        },
        uri: `${host}/login`,
        resolveWithFullResponse: true,
        rejectUnauthorized: false,
    };
    try {
        const cookie = await this.helpers.request(options);
        const cookieheader = cookie.headers['set-cookie'];
        return cookieheader;
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), { error: error });
    }
}
exports.getCookie = getCookie;
//# sourceMappingURL=GenericFunctions.js.map