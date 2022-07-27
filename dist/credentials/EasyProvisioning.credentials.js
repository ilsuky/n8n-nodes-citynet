"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyProvisioning = void 0;
class EasyProvisioning {
    constructor() {
        this.name = 'easyProvisioning';
        this.displayName = 'Easy Provisioning';
        this.properties = [
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: 'https://cwmapi.citynet.at',
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
exports.EasyProvisioning = EasyProvisioning;
//# sourceMappingURL=EasyProvisioning.credentials.js.map