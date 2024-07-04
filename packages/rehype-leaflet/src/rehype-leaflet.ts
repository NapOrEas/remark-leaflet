import { type Element, type Root } from 'hast'
import { parse } from 'space-separated-tokens'
import { type Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'

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
    //noUI: boolean
    //lock: boolean
    recenter: boolean
    //noScrollZoom: boolean

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
function toLeafletElement(config: MapConfig): Element {
    const mapId = config.id || `leaflet-map-${Math.random().toString(36).substr(2, 9)}`

    // Check if the image path is a local file and convert it to a data URL
    let imageUrl = config.image

    // Create the Leaflet map container
    const div: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
            id: mapId,
            className: ['leaflet-map'],
            style: `width: ${config.width}; height: ${config.height};`  // You can customize the dimensions as needed
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
        
        let bounds = L.latLngBounds(${JSON.stringify(config.bounds)});
        
        var map = L.map('${mapId}', {
        minZoom: ${config.minZoom},
        maxZoom: ${config.maxZoom},
        zoom: ${config.defaultZoom}
        }).fitBounds(bounds);

        L.imageOverlay('${imageUrl}', bounds).addTo(map);

        if (${config.recenter}) {
            map.setMaxBounds(bounds);
        }
        
        map.on("first-layer-ready", () => {
        
        })

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
    return (ast: any) => {

        visit(ast, 'element', (node: any, index, parent) => {
            if (isLeafletElement(node)) {
                const configText = node.children.map((child: any) => child.value).join('')
                const config = yaml.load(configText) as MapConfig
                const leafletElement = toLeafletElement(config)

                if (parent && typeof index === 'number') {
                    parent.children[index] = leafletElement
                }
            }
        })
    }
}
