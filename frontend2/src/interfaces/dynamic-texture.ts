import { Color3 } from "@babylonjs/core";

export interface TextureConfig {
    name: string;
    alpha: number;
    width: number;
    height: number;
    flip: boolean;
    emissiveColor?: Color3;
    noCache?: boolean;
}