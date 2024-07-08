import { type Element, type Root } from 'hast'
import { parse } from 'space-separated-tokens'
import { type Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'
//import { Loader } from './loader'

//const loader = new Loader();

// see https://github.com/javalent/obsidian-leaflet?tab=readme-ov-file#options for all options
interface MapConfig {
    id: string
    image: string
    //tileServer: string
    //tileSubdomains: string
    //tileOverlay: string
    //osmLayer: string
    lat: number
    long: number
    height: string
    width: string
    minZoom: number
    maxZoom: number
    defaultZoom: number
    zoomDelta: number
    //zoomFeatures: string
    unit: string
    scale: number
    //marker: string
    //commandMarker: string
    //markerFile: string
    //markerFolder: string
    //darkMode: boolean
    //overlay: string
    //overlayTag: string
    //overlayColor: string
    bounds: [[number, number], [number, number]]
    //coordinates: string
    //zoomTag: string
    //geojson: string
    //geojsonColor: string
    //geojsonFolder: string
    //gpx: string
    //gpxMarkers: string
    //gpxColor: string
    //gpxFolder: string
    //imageOverlay: string
    //draw: boolean
    //drawColor: string
    //showAllMarkers: boolean
    //preserveAspect: boolean
    noUI: boolean
    //lock: boolean
    recenter: boolean
    noScrollZoom: boolean

}

/**
 * Check if a hast element has the `language-leaflet` class name.
 *
 * @param element
 *   The hast element to check.
 * @returns
 *   Whether or not the element has the `language-leaflet` class name.
 */
function isLeafletElement(element: Element): boolean {
    if (element.tagName !== 'code') {
        return false
    }

    const className = element.properties?.className
    if (typeof className === 'string') {
        return parse(className).includes('language-leaflet')
    }

    return Array.isArray(className) && className.includes('language-leaflet')
}

/**
 * Convert the Leaflet map configuration to a hast element.
 *
 * @param config
 *   The Leaflet map configuration.
 * @returns
 *   A `<div>` element with embedded Leaflet map.
 */
async function toLeafletElement(config: MapConfig): Promise<Element> {
    const defaults: MapConfig = {
        id: `leaflet-map-${Math.random().toString(36).substr(2, 9)}`,
        image: '',
        lat: 50.0,
        long: 50.0,
        height: '500px',
        width: '100%',
        minZoom: 1,
        maxZoom: 10,
        defaultZoom: 5,
        zoomDelta: 1,
        unit: 'meters',
        scale: 1,
        bounds: [[0, 0], [0, 0]],
        noUI: false,
        recenter: false,
        noScrollZoom: false
    }
    // Check if the image path is a local file and convert it to a data URL
    const merged = { ...defaults, ...config }

    let imageUrl = merged.image

    // Use the loader to get image dimensions

    const h = merged.bounds[1][0]
    const w = merged.bounds[1][1]


    // Create the Leaflet map container
    const div: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
            id: merged.id,
            className: ['leaflet-map'],
            style: `width: ${merged.width}; height: ${merged.height};`  // You can customize the dimensions as needed
        },
        children: []
    }

    // Add the Leaflet map initialization script
    const script: Element = {
        type: 'element',
        tagName: 'script',
        properties: {},
        children: [{
            type: 'text',
            value: `
        document.addEventListener('DOMContentLoaded', function() {
        
        let mapBounds = L.latLngBounds(${JSON.stringify(merged.bounds)});
        
        var map = L.map('${merged.id}', {
        minZoom: ${merged.minZoom},
        maxZoom: ${merged.maxZoom},
        scrollWheelZoom: ${!merged.noScrollZoom},
        zoomDelta: ${merged.zoomDelta},
        zoomSnap: ${merged.zoomDelta},
        zoomControl: ${!merged.noUI},
        wheelPxPerZoomLevel: 60 * (1 / ${merged.zoomDelta})
        }).fitBounds(mapBounds);
     
        const southWest = map.unproject([0, ${h}], map.getMaxZoom() -1);
        const northEast = map.unproject([${w}, 0],  map.getMaxZoom() -1);

        let imageBounds = L.latLngBounds(southWest, northEast);

        L.imageOverlay('${imageUrl}', imageBounds).addTo(map);

        if (${merged.recenter}) {
            map.setMaxBounds(mapBounds);
        }
        
        });
      `
        }]
    }

    return {
        type: 'element',
        tagName: 'div',
        properties: {},
        children: [div, script]
    }
}

/**
 * A rehype plugin to render Leaflet maps.
 *
 * @param options
 *   Options that may be used to tweak the output.
 */
export const rehypeLeaflet: Plugin<[], Root> = () => {
    return async (ast: any) => {

        const leafLetNodes: Array<{ node: any; index: number | undefined; parent: any }> = [];



        visit(ast, 'element', (node: any, index, parent) => {
            if (isLeafletElement(node)) {
                leafLetNodes.push({ node, index, parent })
            }
        })

        for (const { node, index, parent } of leafLetNodes) {

            const configText = node.children.map((child: any) => child.value).join('')
            const config = yaml.load(configText) as MapConfig
            const leafletElement = await toLeafletElement(config)

            if (parent && typeof index === 'number') {
                parent.children[index] = leafletElement
            }
        }


    }
}
