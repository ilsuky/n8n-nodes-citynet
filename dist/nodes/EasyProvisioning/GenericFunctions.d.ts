import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
import { EasyProvisioningApiCredentials } from './types';
export declare function easyProvisioningApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: IDataObject | undefined, qs: IDataObject | undefined, jwtToken: string): Promise<any>;
export declare function getJwtToken(this: IExecuteFunctions | ILoadOptionsFunctions, { username, password, host }: EasyProvisioningApiCredentials): Promise<any>;
