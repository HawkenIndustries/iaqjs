import {Options, Data, Measurement} from './interfaces/reference'
export default class IAQ{
    clientId: string
    options: Options
    lastUpdated: Number;
    host: string;
    interval: ReturnType<typeof setInterval>
    constructor(clientId: string){
        this.clientId = clientId
        this.lastUpdated = null;
        this.host = "https://app.hawkenaq.com/api/client"
        this.interval = null;
    }
    generate(dom: Element, options: Options): void{
        this.getData(options, true, dom);
        if(this.interval == null){
            this.interval = setInterval(this.getData, 1000 * 60 *5, options, true, dom);
        }
    }
    async getData(options: Options, updateElement: Boolean = false, dom?: Element): Promise<Data>{
        try {
            let url = new URL(this.host);
            url.searchParams.append("clientKey", this.clientId);
            if(options.widgetId){
                url.searchParams.append("widgetId", options.widgetId);
            }
            if(Array.isArray(options.measurementIds)){
                url.searchParams.append("measurementIds", JSON.stringify(options.measurementIds));
            }
            let res = await fetch(url.toString());
            let data: Data  = await res.json()
            if(updateElement){
                if(dom!=null){
                    this.updateElement(data, dom)
                } else {
                    console.warn('Dom not initialize');
                }
                
            }
            console.log(data)
            return data;
        } catch (error) {
            console.error(error);
        }
    }
    getDefaultStyle(type: string, meta?: any): string{
        if(type == "data-measurement"){
            return `display: flex;height: 226px;width: 315px;padding-left: 32px;padding-right: 24px;padding-top: 16px;padding-bottom: 0px;color:white;background-color: rgb(37, 41, 74);border-radius: 20px;font-family:Roboto,sans-serif;font-weight:300`
        } 
        else if (type == "data-measurement-values"){
            return `display:flex;align-items:baseline`
        }
        else if(type == "data-measurement-score"){
            return `font-size:3.2rem`
        }
        else if(type == "data-measurement-unit"){
            if(meta == null){
                return 'display:none'
            } else {
                return `font-size:1.2rem;margin-left:5px`
            }
        }
        else if(type == "data-name"){
            return `font-size:1.65rem;line-height:2rem;margin-top:1rem`;
        }
        else if(type == "data-indicator"){
            if(meta){
                let score = Number(meta);
                // return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem`
                if(score >= 75) {
                    return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem;color:#02c39a`
                } else if(score>= 50 && score <75){
                    return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem;color:#e8912b`
                } else {
                    return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem;color:#e8912b`
                }
            } else {
                return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem`
            }
        }
        else if(type == "data-icon") {
            return `height:40px;width:40px;margin-bottom:18px`
        }
    }

    private getIndicatorText(score: Number): string{
        if(score >= 75) {
            return "Excellent"
        } else if(score>= 50 && score <75){
            return "Moderate"
        } else {
            return "Poor"
        }
    }
    private scoreToUse(m: Measurement): string{
        let score: any;
        if(m.toUse == "curScore"){
            score = Math.round(Number(m.curScore))
        } else {
            if(!isNaN(Number(m.curVal))){
                score = Math.round(Number(m.curVal))
            } else {
                score = m.curVal
            }
        }
        return String(score);
    }
    private updateElement(data: Data, dom: Element): void{
        let domString = ``;
        for(let mm in data.measurements){
            let m = data.measurements[mm]
            domString+= `<div data-measurement="${mm}" style="${this.getDefaultStyle('data-measurement')}">
            <div data-details style="width:100%">
                <div data-indicator style="${this.getDefaultStyle('data-indicator', m.curScore)}">${this.getIndicatorText(Number(m.curScore))}</div>
                <div data-icon style="${this.getDefaultStyle('data-icon')}">${m.icon}</div>
                <div data-measurement-values style="${this.getDefaultStyle('data-measurement-values')}">
                    <span data-measurement-score style="${this.getDefaultStyle('data-measurement-score')}">${this.scoreToUse(m)}</span>
                    <span data-measurement-unit style="${this.getDefaultStyle('data-measurement-unit', m.unit)}">${m.unit}</span>
                </div>
                <div data-name style="${this.getDefaultStyle('data-name')}">${m.name}</div>
            </div>
        </div>`
        }
        dom.innerHTML = domString;

    }
}