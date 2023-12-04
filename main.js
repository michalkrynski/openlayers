import './style.scss';
// import {Map, View} from 'ol';
// import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
// import { Layer from 'ol/layer/Layer.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Feature } from 'ol';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { Point } from 'ol/geom';
// import VectorSource from 'ol/source/Vector';
// import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay.js';
import {composeCssTransform} from 'ol/transform.js';
import {OGCMapTile, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';


const iconStyle = new Style({
  image: new Icon({
    anchor: [36, 82],
    anchorXUnits: 'pixels',
    anchorYUnits: 'pixels',
    src: 'data/cqure-marker.svg',
  }),
});

const markers = [];

jsonData.forEach(item => {
  const marker = createMarkerLayer(item.position, iconStyle)
  markers.push(marker);
});

function createMarkerLayer(coordinates, style, zIndex = 10) {
  const feature = new Feature(new Point([coordinates.lng, coordinates.lat]));

  const source = new VectorSource({
    features: [feature],
  });

  const vectorLayer = new VectorLayer({
    source: source,
    style,
  });

  vectorLayer.setZIndex(zIndex);

  return vectorLayer;
}

const svgContainer = document.createElement('div');
const xhr = new XMLHttpRequest();
xhr.open('GET', './data/BlankMap-World.svg');
xhr.addEventListener('load', function () {
  const svg = xhr.responseXML.documentElement;
  svgContainer.ownerDocument.importNode(svg);
  svgContainer.appendChild(svg);
});
xhr.send();

const width = 2560;
const height = 1280;
const svgResolution = 360 / width;
svgContainer.style.width = width + 'px';
svgContainer.style.height = height + 'px';
svgContainer.style.transformOrigin = 'top left';
svgContainer.className = 'svg-layer';

const mapLayer = new TileLayer({
  render: function (frameState) {
    const scale = svgResolution / frameState.viewState.resolution;
    const center = frameState.viewState.center;
    const size = frameState.size;
    const cssTransform = composeCssTransform(
      size[0] / 2,
      size[1] / 2,
      scale,
      scale,
      frameState.viewState.rotation,
      -center[0] / svgResolution - width / 2,
      center[1] / svgResolution - height / 2
    );
    svgContainer.style.transform = cssTransform;
    svgContainer.style.opacity = this.getOpacity();
    return svgContainer;
  },
})

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});

const map = new Map({
  target: 'map',
  layers: [
    ...markers
  ],
  overlays: [popup],
  view: new View({
    center: [0, 0],
    extent: [-180, -90, 180, 90],
    projection: 'EPSG:4326',
    zoom: 2,
  }),
});

mapLayer.setMap(map);

// display popup on click
// map.on('singleclick', function (evt) {
//   const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
//     return feature;
//   });

//   if (!feature) {
//     return;
//   }

//   popup.setPosition(evt.coordinate);
// });