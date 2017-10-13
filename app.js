/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './json-deckgl-overlay.js';

import {json as requestJson} from 'd3-request';
import {csv as requestCsv} from 'd3-request';
import { mapboxApiKey } from './constants';


// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL = 'static/country_polygons.json'
const LOC_DATA_URL = 'static/points.csv'


const colorScale = r => [r * 255, 140, 200 * (1 - r)];


class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null,
      locData: null
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        this.setState({data: response});
      }
    });

    requestCsv(LOC_DATA_URL, (error, response) => {
      if (!error) {
        const data = response.map(d => ([Number(d.lng), Number(d.lat)]));
        this.setState({locData: data});
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, data, locData} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={mapboxApiKey}>
        <DeckGLOverlay viewport={viewport}
          data={data}
          locData={locData}
          colorScale={colorScale} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));