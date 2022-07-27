"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtToken = exports.easyProvisioningApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function easyProvisioningApiRequest(method, endpoint, body = {}, qs = {}, jwtToken) {
    const credentials = await this.getCredentials('easyProvisioning');
    const options = {
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
        },
        method,
        body,
        qs,
        uri: `${credentials.host}/api/v1/${endpoint}`,
        json: true,
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
        throw new n8n_workflow_1.NodeApiError(this.getNode(), { error: error });
    }
}
exports.easyProvisioningApiRequest = easyProvisioningApiRequest;
async function getJwtToken({ username, password, host }) {
    const options = {
        method: 'POST',
        body: `{ "user": {"email": "${username}", "password": "${password}"} }`,
        uri: `${host}/user_service/api/v1/login`,
        json: true,
        rejectUnauthorized: false,
    };
    try {
        const token = await this.helpers.request(options);
        return token.jwt;
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), { error: error });
    }
}
exports.getJwtToken = getJwtToken;
//# sourceMappingURL=GenericFunctions.js.map