import { Options, Data } from './interfaces/reference';
import "./styles/index.scss";
interface UserParams {
    [key: string]: any;
}
export default class IAQ {
    clientId: string;
    options: Options;
    lastUpdated: number;
    host: string;
    sessionId: string;
    interval: ReturnType<typeof setInterval>;
    logged: Boolean;
    clickUrl: string;
    uParams: UserParams;
    constructor(clientId: string, host?: string, uParams?: UserParams);
    generate(dom: Element, widgetId: string, options: Options): void;
    private reportInit;
    getData(widgetId: string, generate?: Boolean): Promise<Data>;
    private getIndicatorValues;
    private generateRadialSvg;
    private getDisplayVal;
    private updateElement;
}
export {};
