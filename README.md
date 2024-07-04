# What is this?

This repo will contain remark and rehype plugins to add support for
leaflet maps.
It is mainly built to support leaflet maps that have been created using [obsidian-leaflet](https://github.com/javalent/obsidian-leaflet).

## Options

| Option       | Description                                                                        | Default                                    |
| ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| id           | Unique identifier (can be anything). **Required.**                                 |                                            |
| image        | Direct URL/file path to an image file to be used as the map layer.                 | OpenStreetMap map                          |
| lat          | Default latitude to display when rendering                                         | 50% (image) / 39.983334 (open street map)  |
| long         | Default longitude to display when rendering                                        | 50% (image) / -82.983330 (open street map) |
| height       | Height of the map element. Can be provided in pixels or percentage of note height. | 500px                                      |
| width        | Width of the map element. Can be provided in pixels or percentage of note width.   | 100%                                       |
| minZoom      | Minimum allowable zoom level of the map.                                           | 1                                          |
| maxZoom      | Maximum allowable zoom level of the map.                                           | 10                                         |
| defaultZoom  | Map will load zoomed to this level.                                                | 5                                          |
| zoomDelta    | Zoom level will change by this amount when zooming.                                | 1                                          |
| unit         | Unit to display distances in                                                       | meters                                     |
| scale        | Scale factor for image map distance calculation.                                   | 1                                          |
| bounds       | Set image map bounds to specified coordinates instead of default                   |                                            |
| noUI         | No controls will be added to the map.                                              | false                                      |
| recenter     | Forces map to stay re-center itself after panning.                                 | false                                      |
| noScrollZoom | Turns off scrollwheel zooming.                                                     | false                                      |