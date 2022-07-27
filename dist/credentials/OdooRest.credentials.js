"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdooRest = void 0;
class OdooRest {
    constructor() {
        this.name = 'odooRest';
        this.displayName = 'Odoo Rest';
        this.properties = [
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: 'https://erp.it.local/api',
            },
            {
                displayName: 'ApiToken',
                name: 'apiToken',
                type: 'string',
                default: '',
            },
        ];
    }
}
exports.OdooRest = OdooRest;
//# sourceMappingURL=OdooRest.credentials.js.map