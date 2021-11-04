export interface Theme {
    scoreColor: string;
    backgroundColor: string;
    iconColor: string;
    unitColor: string;
}
export interface Size {
    height: Number;
    width: Number;
}
export interface Options {
    measurementIds?: Array<string>;
    widgetId?: string;
    autoUpdate?: Boolean;
    updateInterval?: Number;
    theme?: Theme;
    size?: Size;
}
export interface Measurement {
    type: string;
    curVal?: string;
    curScore: string;
    icon: string;
    unit?: string;
    name?: string;
    toUse?: string;
}
export interface Data {
    name: String;
    measurements: Array<Measurement>;
}
