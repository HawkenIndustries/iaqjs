import { Options, Data } from './interfaces/reference';
export default class IAQ {
    clientId: string;
    options: Options;
    lastUpdated: Number;
    host: string;
    sessionId: string;
    interval: ReturnType<typeof setInterval>;
    logged: Boolean;
    clickUrl: string;
    constructor(clientId: string, host?: string);
    generate(dom: Element, options: Options): void;
    private reportInit;
    getData(options: Options, updateElement?: Boolean, dom?: Element): Promise<Data>;
    getDefaultStyle(type: string, meta?: any): string;
    private getIndicatorText;
    private scoreToUse;
    private updateElement;
}
