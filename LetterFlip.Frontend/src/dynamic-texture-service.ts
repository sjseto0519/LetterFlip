import { autoinject } from 'aurelia-framework';
import { Scene, DynamicTexture, StandardMaterial, Color3 } from '@babylonjs/core';

export interface TextureConfig {
    name: string;
    alpha: number;
    width: number;
    height: number;
    flip: boolean;
    emissiveColor?: Color3;
}

@autoinject
export class DynamicTextureService {
    private textureMap: Map<string, StandardMaterial> = new Map();
    private scene: Scene;

    public initialize(scene: Scene) {
        this.scene = scene;
    }

    private generateConfigHash(config: TextureConfig): string {
        return JSON.stringify(config);
    }

    public toWallMaterial(config: TextureConfig): StandardMaterial {
        const hash = this.generateConfigHash(config);

        // Check if a texture with the same config exists
        if (this.textureMap.has(hash)) {
            return this.textureMap.get(hash);
        }

        // Create new DynamicTexture
        const dynamicTexture = new DynamicTexture("dynamic_texture", {width: config.width, height: config.height}, this.scene);
        const ctx = dynamicTexture.getContext();
        
        const img = new Image();
        img.src = `/textures/${config.name}.jpg`;
        img.onload = () => {
            if (config.flip) {
                ctx.scale(1, -1);
                ctx.drawImage(img, 0, -img.height);
            } else {
                ctx.drawImage(img, 0, 0);
            }

            dynamicTexture.update();
        };

        // Create material and assign the dynamic texture
        const material = new StandardMaterial("Mat", this.scene);
        material.diffuseTexture = dynamicTexture;
        if (config.emissiveColor) {
            material.emissiveColor = config.emissiveColor;
            material.useEmissiveAsIllumination = true;
        }
        material.alpha = config.alpha;

        // Store the material in the map for future use
        this.textureMap.set(hash, material);

        return material;
    }
}
