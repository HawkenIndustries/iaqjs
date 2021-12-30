import {Options, Data, Measurement} from './interfaces/reference'
import {v4 as uuid} from 'uuid';
import "./styles/index.scss"


interface UserParams {
    [key: string]: any;
}

interface DomStrings {
    small: string // mini and small
    large?: string,
}

interface IndicatorValues {
    text: string,
    class: string,
    color: string,
    score: number
}

function htmlToElement(html: string): Element{
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild as Element
}

const DomStrings: DomStrings = {
    small: `<div class="iaq-container-parent"> <a data-iaq-container> <div class="iaq-indicator"> </div><div class="iaq-measurement-details"> <div class="iaq-measurement-name"> <span data-name></span> <span data-unit></span> </div><div class="iaq-measurement-indicator"></div></div><div class="iaq-logo"> <div class="iaq-logo-measurement"></div><svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg" data-svg-icon> <path fill-rule="evenodd" clip-rule="evenodd" d="M0 28L7.96584 5.37409H12.2163L9.87 12.0377H17.3081L21.546 0H25.7965L17.8306 22.6264H13.5802L16.1483 15.333H8.71018L4.25043 28H0Z"></path> </svg> </div></a></div>`,
    // radialSvg: `<svg viewBox="0 0 36 36" width="72px" height="72px"> <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="4" stroke="#FFD22B" style="stroke-opacity: 0.09;" data-stroke></path> <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#FFD22B" stroke-width="4" stroke-dasharray="57,100" stroke-linecap="round" data-stroke-dasharray></path> <text x="10" y="23.5" font-size="14px" font-weight="300" data-text></text></svg>`,
    large: `<div class="iaq-container-parent"> <a data-iaq-container> <div class="iaq-measurement-details"> <div class="iaq-measurement-icon"> </div><div class="iaq-measurement-values"> <span data-value></span> <span data-unit></span> </div><div class="iaq-measurement-name"> </div></div><div class="iaq-logo-and-indicator"> <div class="iaq-logo"> <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M0 28L7.96584 5.37409H12.2163L9.87 12.0377H17.3081L21.546 0H25.7965L17.8306 22.6264H13.5802L16.1483 15.333H8.71018L4.25043 28H0Z"/> </svg> </div><div class="iaq-score-indicator"> </div></div></a> </div>`
}


export default class IAQ{
    clientId: string
    options: Options
    lastUpdated: number;
    host: string;
    sessionId: string;
    interval: ReturnType<typeof setInterval>
    logged: Boolean
    clickUrl: string
    uParams: UserParams
    constructor(clientId: string, host?: string, uParams?: UserParams){
        this.clientId = clientId
        this.lastUpdated = null;
        this.host = host ? host: "https://app.hawkenaq.com/api/client"
        this.interval = null;
        this.sessionId = uuid();
        this.clickUrl = "https://a.iaq.ai";
        this.uParams = uParams;
        this.reportInit();
    }
    generate(dom: Element, widgetId: string, options: Options): void{
        let domOptions: Options = {
            theme: options.theme || 'dark',
            iconMode: options.iconMode || false,
            size: options.size || 'small',
            bgGradient: options.bgGradient || false
        }
        this.getData(widgetId, true).then((data) => {
            this.updateElement(data, dom, widgetId, domOptions);
        })
    }
    private async reportInit(): Promise<void>{
        try {
            if(window.IAQ._tracker?.[this.clientId]){
                return null;
            }
            let url = new URL(this.host + "/event");
            url.searchParams.append("clientKey", this.clientId);
            url.searchParams.append('sessionId', this.sessionId);
            url.searchParams.append('requestUrl', window.location.href);
            url.searchParams.append('type', 'init');
            let res = await fetch(url.toString());
            res.json().then((d) => {
                console.log(d);
                if(window.IAQ._tracker!= null){
                    window.IAQ._tracker[this.clientId] = true
                } else {
                    window.IAQ._tracker = new Object();
                    window.IAQ._tracker[this.clientId] = true
                }
            })
        } catch (error) {
            console.error(error);   
        }
    }
    async getData(widgetId: string, generate: Boolean = false): Promise<Data>{
        try {
            let url = new URL(this.host);
            url.searchParams.append("clientKey", this.clientId);
            url.searchParams.append('sessionId', this.sessionId);
            url.searchParams.append('requestUrl', window.location.href);
            url.searchParams.append("widgetId", widgetId);
            if(generate){
                url.searchParams.append("type", "generate");
            } else {
                url.searchParams.append("type", "data");
            }
            if(this.logged == false){
                this.reportInit();
            }
            let res = await fetch(url.toString());
            let data: Data  = await res.json()
            return data;
        } catch (error) {
            console.error(error);
        }
    }
    private getIndicatorValues(score: number): IndicatorValues{
        if(score >= 75) {
            return {
                text: "Excellent",
                class: "iaq-score-excellent",
                color: "#4E7CFF",
                score
            }
        } else if(score>= 50 && score <75){
            return {
                text: "Moderate",
                class: "iaq-score-moderate",
                color: "#FFCA3A",
                score
            }
        } else {
            return {
                text: "Poor",
                class: "iaq-score-poor",
                color: "#FF5050",
                score
            }
        }
    }
    private generateRadialSvg(s: number, theme?: string, size?: string): Element {
        let i = this.getIndicatorValues(s)
        let textFill = "#021449"
        let opacity = 1
        let strokeOpacity = 0.09
        if(theme == "dark" || theme == "blue"){
            textFill = "#ffffff"
        } else {
            opacity = 0;
        }
        let svgSize: number = 72;
        let viewBox = "0 0 36 36"
        let color = i.color;
        let gaussianColor = i.color
        let circle ="";
        if(size == "mini"){
            svgSize = 48;
            // viewBox = "0 0 64 64"
        }
        if(theme == "blue"){
            color = "white";
            gaussianColor = "black"
            opacity = 0.3
            strokeOpacity = 0;
            circle = `<circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.2)"></circle>`
        }
        let str = `
        <svg viewBox="${viewBox}" width="${svgSize}px" height="${svgSize}px" data-radial-graph>
            <defs>
                <filter id="gaussianBlur" height="200%" x="-20%" y="-20%" width="200%">
                    <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                </filter>
            </defs>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="4" stroke="${color}" style="stroke-opacity: ${strokeOpacity};" data-stroke></path>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${gaussianColor}" style="filter: url(#gaussianBlur);stroke-opacity:${opacity}" stroke-width="4" stroke-dasharray="${i.score},100" stroke-linecap="round" data-stroke-dasharray></path>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${i.score},100" stroke-linecap="round" data-stroke-dasharray></path>
            <text x="10" y="23.5" font-size="14px" font-weight="300" fill="${textFill}" data-text>${Math.round(i.score)}</text>
            ${circle}
        </svg>`
        return htmlToElement(str);
    }
    private getDisplayVal(measurement: Measurement): any{
     if(measurement.curVal){
        if(!isNaN(Number(measurement.curVal))){
             return Math.round(measurement.curVal * 10)/10
        } else {
            return measurement.curVal
        }
     } else {
         return Math.round(measurement.curScore * 10 )/10
     }   
    }
    private updateElement(data: Data, dom: Element, widgetId: string, options: Options): void{
        let clickUrl = new URL(this.clickUrl + `/wc/${widgetId}`);
        clickUrl.searchParams.append('sessionId', this.sessionId);
        clickUrl.searchParams.append('widgetId', widgetId);
        clickUrl.searchParams.append('requestUrl', window.location.href);
        if(this.uParams){
            for(let param in this.uParams){
                clickUrl.searchParams.append(`uParams.${param}`, this.uParams[param]);
            }
        }
        let measurement = data.measurements[0];
        console.log(data);
        if(options.size == "small" || options.size == "mini"){
            let childNode = htmlToElement(DomStrings.small);
            let iaqContainerClasses: Array<string> = []
            if(options.size == "small"){
              iaqContainerClasses.push('iaq-container-small')
            }
            if(options.size == "mini"){
                iaqContainerClasses.push('iaq-container-mini')
            }
            if(options.theme == "light2"){
                iaqContainerClasses.push("iaq-light-2")
            } else {
                iaqContainerClasses.push(`iaq-${options.theme}`)
            }
            if(options.bgGradient){
                iaqContainerClasses.push('gradient')
            }
            childNode.querySelector('[data-iaq-container]')?.setAttribute("href", clickUrl.toString());
            childNode.querySelector('[data-iaq-container]')?.setAttribute("target", "_blank")
            iaqContainerClasses.forEach((el) =>  childNode.querySelector('[data-iaq-container]').classList.add(el))
            let iaqIndicator = childNode.querySelector('.iaq-indicator');
            let iaqName = childNode.querySelector('.iaq-measurement-name');
            let iaqMeasurementIndicator = childNode.querySelector('.iaq-measurement-indicator');
            if(options.iconMode){
                let measurementIcon = htmlToElement(measurement.icon);
                // measurementIcon.setAttribute('height', '32px');
                // measurementIcon.setAttribute('width', '32px');
                iaqIndicator.appendChild(measurementIcon);
                iaqIndicator.classList.add('iaq-measurement-icon')
                iaqName.querySelector('[data-name]').innerHTML = this.getDisplayVal(measurement)
                if(measurement.unit){
                    iaqName.querySelector('[data-unit]').innerHTML = measurement.unit
                }
                childNode.querySelector('.iaq-logo-measurement').innerHTML = this.getIndicatorValues(measurement.curScore).text
                iaqMeasurementIndicator.innerHTML = data.name
                childNode.querySelector('.iaq-logo-measurement').classList.add(
                    this.getIndicatorValues(measurement.curScore).class
                )
                childNode.querySelector('.iaq-logo').classList.add(
                    'iaq-lower-logo'
                )
                if(options.size == "mini"){
                    let miniSvgIcon = childNode.querySelector('[data-svg-icon]');
                    miniSvgIcon.setAttribute("width", "22px");
                    miniSvgIcon.setAttribute("height", "24px");
                    miniSvgIcon.setAttribute("data-mini-svg", "");
                }

            } else {
                iaqIndicator.appendChild(this.generateRadialSvg(measurement.curScore, options.theme, options.size))
                iaqName.innerHTML = data.name
                iaqName.classList.add('iaq-radial-mode')
                if(iaqMeasurementIndicator){
                    iaqMeasurementIndicator.innerHTML = this.getIndicatorValues(measurement.curScore).text
                    iaqMeasurementIndicator.classList.add(this.getIndicatorValues(measurement.curScore).class)
                }
            }
            let iaqLogo = childNode.querySelector('.iaq-logo');
            if(options.theme == "dark" || options.theme == "blue"){
                iaqLogo.classList.add('iaq-light')
            } else {
                iaqLogo.classList.add('iaq-dark')
            }
            dom.appendChild(childNode)
        } else {
            let childNode = htmlToElement(DomStrings.large);
            let iaqContainerClasses: Array<string> = []
            if(options.size == "medium"){
              iaqContainerClasses.push('iaq-container-medium')
            }
            if(options.size == "large") {
                iaqContainerClasses.push('iaq-container-large')
            }
            if(options.theme == "light2"){
                iaqContainerClasses.push("iaq-light-2")
            } else {
                iaqContainerClasses.push(`iaq-${options.theme}`)
            }
            if(options.bgGradient){
                iaqContainerClasses.push('gradient')
            }
            childNode.querySelector('[data-iaq-container]')?.setAttribute("href", clickUrl.toString());
            childNode.querySelector('[data-iaq-container]')?.setAttribute("target", "_blank")
            iaqContainerClasses.forEach((el) =>  childNode.querySelector('[data-iaq-container]').classList.add(el))
            // Add Name
            childNode.querySelector('[data-value]').innerHTML = this.getDisplayVal(measurement)
            if(measurement.unit){
                childNode.querySelector('[data-unit]').innerHTML = measurement.unit;
            }
            let measurementIcon = htmlToElement(measurement.icon);
            measurementIcon.setAttribute('height', '36px');
            measurementIcon.setAttribute('width', '36px');
            if(options.size == "large"){
                measurementIcon.setAttribute('height', '24px');
                measurementIcon.setAttribute('width', '24px');
            }
            childNode.querySelector('.iaq-measurement-icon').appendChild(measurementIcon)
            childNode.querySelector('.iaq-measurement-name').innerHTML = data.name
            let indicators = this.getIndicatorValues(measurement.curScore);
            childNode.querySelector('.iaq-score-indicator').innerHTML = indicators.text;
            childNode.querySelector('.iaq-score-indicator').classList.add(indicators.class)
            dom.appendChild(childNode)
        }
    }
}