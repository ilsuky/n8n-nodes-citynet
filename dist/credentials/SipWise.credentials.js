"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SipWise = void 0;
class SipWise {
    constructor() {
        this.name = 'sipWise';
        this.displayName = 'Sip Wise';
        this.properties = [
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: 'https://sip.cnh.at:1443/api',
            },
            {
                displayName: 'Username',
                name: 'username',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                default: '',
            },
        ];
    }
}
exports.SipWise = SipWise;
//# sourceMappingURL=SipWise.credentials.js.map