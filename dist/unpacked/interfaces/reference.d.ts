declare global {
    interface Window {
        IAQ: any;
    }
}
export interface Theme {
    scoreColor: string;
    backgroundColor: string;
    iconColor: string;
    unitColor: string;
}
export interface Options {
    theme?: 'dark' | 'light' | 'light2' | 'blue';
    size?: 'mini' | 'small' | 'medium' | 'large';
    bgGradient?: Boolean;
    iconMode?: Boolean;
}
export interface Measurement {
    type: string;
    curVal?: any;
    curScore: number;
    icon: string;
    unit?: string;
    name?: string;
    toUse?: string;
}
export interface Data {
    name: string;
    measurements: Array<Measurement>;
}
