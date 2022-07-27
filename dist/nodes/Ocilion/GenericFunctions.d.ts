import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
import { OcilionApiCredentials } from './types';
export declare function ocilionApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: IDataObject | undefined, qs: IDataObject | undefined, cookie: string): Promise<any>;
export declare function getCookie(this: IExecuteFunctions | ILoadOptionsFunctions, { username, password, host }: OcilionApiCredentials): Promise<any>;
