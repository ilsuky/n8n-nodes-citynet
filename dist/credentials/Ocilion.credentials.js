"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ocilion = void 0;
class Ocilion {
    constructor() {
        this.name = 'ocilion';
        this.displayName = 'Ocilion';
        this.properties = [
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: 'http://213.174.227.206/api/v2',
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
exports.Ocilion = Ocilion;
//# sourceMappingURL=Ocilion.credentials.js.map