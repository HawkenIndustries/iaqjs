export interface Theme {
    scoreColor: string;
    backgroundColor: string;
    iconColor: string;
    unitColor: string;
}
export interface Options {
    measurementIds?: Array<string>;
    widgetId?: string;
    theme?: 'dark' | 'lights' | 'light2' | 'blue';
    size?: 'mini' | 'small' | 'medium' | 'large';
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
