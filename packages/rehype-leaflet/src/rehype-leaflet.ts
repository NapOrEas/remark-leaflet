import { type Element, type Root } from 'hast'
import { parse } from 'space-separated-tokens'
import { type Plugin } from 'unified'
import { visit } from 'unist-util-visit'

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
function toLeafletElement(config: string): Element {
    const mapId = `leaflet-map-${Math.random().toString(36).substr(2, 9)}`
    const mapConfig = JSON.parse(config)

    // Create the Leaflet map container
    const div: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
            id: mapId,
            className: ['leaflet-map'],
            style: 'width: 100%; height: 400px;'  // You can customize the dimensions as needed
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
          var map = L.map('${mapId}').setView([${mapConfig.lat}, ${mapConfig.lng}], ${mapConfig.zoom});
          L.tileLayer('${mapConfig.tileLayer}', {
            attribution: '${mapConfig.attribution}',
            maxZoom: ${mapConfig.maxZoom}
          }).addTo(map);
          ${mapConfig.markers.map((marker: { lat: number, lng: number, popup: string }) => `
            L.marker([${marker.lat}, ${marker.lng}]).addTo(map).bindPopup('${marker.popup}');
          `).join('')}
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
const rehypeLeaflet: Plugin<[], Root> = () => {
    return (ast: any) => {

        visit(ast, 'element', (node: any, index, parent) => {
            if (isLeafletElement(node)) {
                const config = node.children.map((child: any) => child.value).join('')
                const leafletElement = toLeafletElement(config)

                if (parent && typeof index === 'number') {
                    parent.children[index] = leafletElement
                }
            }
        })
    }
}

export default rehypeLeaflet