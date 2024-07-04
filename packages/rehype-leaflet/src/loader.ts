
import { EventEmitter } from 'events'
import fetch from 'node-fetch';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface ImageLayerData {
    data: string;
    h: number;
    w: number;
    alias: string;
    id: string;
}


export class Loader extends EventEmitter {
    constructor() {
        super();
    }

    async loadImage(id: string, layers: string[]): Promise<void> {
        for (let image of layers) {
            const { link, id: layerId, alias } = await this.getLink(image);

            const { h, w } = await this.getImageDimensions(link);
            const layer = {
                data: link,
                h,
                w,
                alias,
                id: layerId
            };
            this.emit(`${id}-layer-data-ready`, layer);
        }
    }

    async loadImageAsync(id: string, layers: string[]): Promise<ImageLayerData> {
        return new Promise(async (resolve, reject) => {
            for (let image of layers) {
                const { link, id: layerId, alias } = await this.getLink(image);

                const { h, w } = await this.getImageDimensions(link);
                const layer = {
                    data: link,
                    h,
                    w,
                    alias,
                    id: layerId
                };
                resolve(layer);
            }
        });
    }

    async getImageDimensions(url: string): Promise<{ h: number; w: number }> {
        if (/https?:/.test(url)) {
            // Handle remote URL
            const response = await fetch(url);
            const buffer = await response.buffer();
            const metadata = await sharp(buffer).metadata();
            return { w: metadata.width || 0, h: metadata.height || 0 };
        } else {
            // Handle local file
            const buffer = await fs.readFile(url);
            const metadata = await sharp(buffer).metadata();
            return { w: metadata.width || 0, h: metadata.height || 0 };
        }
    }

    async getLink(url: string) {
        url = decodeURIComponent(url);
        let link: string = '', alias: string = '';
        try {
            if (/https?:/.test(url)) {
                // URL
                const [linkpath, aliaspath] = url.split("|");
                link = linkpath || '';
                alias = aliaspath || '';
            } else {
                // Local file
                // Assuming you have a way to resolve local files
                const [linkpath, aliaspath] = url.split("|");
                alias = aliaspath && aliaspath.length ? aliaspath : '';
                // Resolve the local file path to a resource path
                // Implement your logic here to get the local file path
                link = linkpath || ''; // Placeholder, replace with actual logic
            }
        } catch (e) {
            console.error(e);
        }
        return { link, id: encodeURIComponent(url), alias };
    }
}