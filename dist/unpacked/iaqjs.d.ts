import { Options, Data } from './interfaces/reference';
export default class IAQ {
    clientId: string;
    options: Options;
    lastUpdated: Number;
    host: string;
    interval: ReturnType<typeof setInterval>;
    constructor(clientId: string);
    generate(dom: Element, options: Options): void;
    getData(options: Options, updateElement?: Boolean, dom?: Element): Promise<Data>;
    getDefaultStyle(type: string, meta?: any): string;
    private getIndicatorText;
    private scoreToUse;
    private updateElement;
}
