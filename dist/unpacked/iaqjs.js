import { v4 as uuid } from 'uuid';
export default class IAQ {
    constructor(clientId, host) {
        this.clientId = clientId;
        this.lastUpdated = null;
        this.host = host ? host : "https://app.hawkenaq.com/api/client";
        this.interval = null;
        this.sessionId = uuid();
        this.logged = false;
        this.clickUrl = "https://a.iaq.ai";
    }
    generate(dom, options) {
        this.getData(options, true, dom);
        if (this.interval == null) {
            this.interval = setInterval(this.getData, 1000 * 60 * 5, options, true, dom);
        }
    }
    async reportInit() {
        try {
            let url = new URL(this.host + "/event");
            url.searchParams.append("clientKey", this.clientId);
            url.searchParams.append('sessionId', this.sessionId);
            url.searchParams.append('requestUrl', window.location.href);
            url.searchParams.append('type', 'init');
            let res = await fetch(url.toString());
            res.json().then((d) => {
                console.log(d);
                this.logged = true;
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    async getData(options, updateElement = false, dom) {
        try {
            let url = new URL(this.host);
            url.searchParams.append("clientKey", this.clientId);
            url.searchParams.append('sessionId', this.sessionId);
            url.searchParams.append('requestUrl', window.location.href);
            if (dom) {
                url.searchParams.append('type', 'generate');
            }
            else {
                url.searchParams.append('type', 'data');
            }
            if (options.widgetId) {
                url.searchParams.append("widgetId", options.widgetId);
            }
            if (this.logged == false) {
                this.reportInit();
            }
            if (Array.isArray(options.measurementIds)) {
                url.searchParams.append("measurementIds", JSON.stringify(options.measurementIds));
            }
            let res = await fetch(url.toString());
            let data = await res.json();
            if (updateElement) {
                if (dom != null) {
                    this.updateElement(data, dom, options.widgetId);
                }
                else {
                    console.warn('Dom not initialize');
                }
            }
            console.log(data);
            return data;
        }
        catch (error) {
            console.error(error);
        }
    }
    getDefaultStyle(type, meta) {
        if (type == "data-measurement") {
            return `display: flex;height: 226px;width: 315px;padding-left: 32px;padding-right: 24px;padding-top: 16px;padding-bottom: 0px;color:white;background-color: rgb(37, 41, 74);border-radius: 20px;font-family:Roboto,sans-serif;font-weight:300;text-decoration:none`;
        }
        else if (type == "data-measurement-values") {
            return `display:flex;align-items:baseline`;
        }
        else if (type == "data-measurement-score") {
            return `font-size:3.2rem`;
        }
        else if (type == "data-measurement-unit") {
            if (meta == null) {
                return 'display:none';
            }
            else {
                return `font-size:1.2rem;margin-left:5px`;
            }
        }
        else if (type == "data-name") {
            return `font-size:1.65rem;line-height:2rem;margin-top:1rem`;
        }
        else if (type == "data-indicator") {
            if (meta) {
                let score = Number(meta);
                // return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem`
                if (score >= 75) {
                    return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem;color:#02c39a`;
                }
                else if (score >= 50 && score < 75) {
                    return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem;color:#e8912b`;
                }
                else {
                    return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem;color:#e8912b`;
                }
            }
            else {
                return `display:flex;width:100%;height:30px;justify-content:flex-end;font-size:1.2rem`;
            }
        }
        else if (type == "data-icon") {
            return `height:40px;width:40px;margin-bottom:18px`;
        }
    }
    getIndicatorText(score) {
        if (score >= 75) {
            return "Excellent";
        }
        else if (score >= 50 && score < 75) {
            return "Moderate";
        }
        else {
            return "Poor";
        }
    }
    scoreToUse(m) {
        let score;
        if (m.toUse == "curScore") {
            score = Math.round(Number(m.curScore));
        }
        else {
            if (!isNaN(Number(m.curVal))) {
                score = Math.round(Number(m.curVal));
            }
            else {
                score = m.curVal;
            }
        }
        return String(score);
    }
    updateElement(data, dom, widgetId) {
        let domString = ``;
        let clickUrl = new URL(this.clickUrl + `/wc/${widgetId}`);
        clickUrl.searchParams.append('sessionId', this.sessionId);
        clickUrl.searchParams.append('widgetId', widgetId);
        clickUrl.searchParams.append('requestUrl', window.location.href);
        for (let mm in data.measurements) {
            let m = data.measurements[mm];
            domString += `<a data-measurement="${mm}" style="${this.getDefaultStyle('data-measurement')}" href="${clickUrl.toString()}" target="_blank">
            <div data-details style="width:100%">
                <div data-indicator style="${this.getDefaultStyle('data-indicator', m.curScore)}">${this.getIndicatorText(Number(m.curScore))}</div>
                <div data-icon style="${this.getDefaultStyle('data-icon')}">${m.icon}</div>
                <div data-measurement-values style="${this.getDefaultStyle('data-measurement-values')}">
                    <span data-measurement-score style="${this.getDefaultStyle('data-measurement-score')}">${this.scoreToUse(m)}</span>
                    <span data-measurement-unit style="${this.getDefaultStyle('data-measurement-unit', m.unit)}">${m.unit}</span>
                </div>
                <div data-name style="${this.getDefaultStyle('data-name')}">${m.name}</div>
            </div>
        </a>`;
        }
        dom.innerHTML = `<div style="overflow:hidden;width:100%;height:100%;display:flex;align-items:flex-start;justify-content:center;text-decoration:none">${domString}</div>`;
    }
}
