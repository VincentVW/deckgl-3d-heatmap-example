import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL, {HexagonLayer, GeoJsonLayer} from 'deck.gl';
import _ from 'lodash';
import d3 from 'd3'

// const LIGHT_SETTINGS = {
//   lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
//   ambientRatio: 0.2,
//   diffuseRatio: 0.5,
//   specularRatio: 0.3,
//   lightsStrength: [1.0, 0.0, 2.0, 0.0],
//   numberOfLights: 2
// };

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  // [209, 55, 78],
  [1, 152, 189],
  // [73, 227, 206],
  // [216, 254, 181],
  // [254, 237, 177],
  // [254, 173, 84],
  // [209, 55, 78]
];

const colorDomain = [0,5]
const elevationScale = {min: 1, max: 50};

const defaultProps = {
  radius: 5000,
  upperPercentile: 100,
  coverage: 1
};


export default class DeckGLOverlay extends Component {

  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {

    return {
      longitude: 20.4157267858730052,
      latitude: 52.232395363869415,
      zoom: 3,
      minZoom: 2,
      maxZoom: 15,
      pitch: 40.5,
      bearing: -27.396674584323023
    };
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.locData && this.props.locData && (nextProps.locData.length !== this.props.locData.length)) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // setParameters(gl, {
    //   depthTest: true,
    //   depthFunc: gl.LEQUAL
    // });
  }

  render() {
    const {
      viewport, 
      data, 
      radius, 
      coverage, 
      upperPercentile, 
      locData, 
      colorScale
    } = this.props;

    if (!data) {
      return null;
    }

    if (!locData) {
      return null;
    }

    const maxValue = _.maxBy(data.features, o => o.properties.activity_count).properties.activity_count

    const getColor = d3.scale.linear()
        .domain([0, maxValue])  
        .range(["green", "red"]); 

    const layers = [
      new GeoJsonLayer({
        id: 'geojson',
        data,
        opacity: 0.8,
        stroked: true,
        filled: false,
        extruded: false,
        wireframe: false,
        fp64: false,  
        lineWidthMinPixels: 2,
        lineWidthScale: 2,
        getElevation: f => Math.sqrt(f.properties.activity_count) * 10000,
        getFillColor: f => colorScale(f.properties.activity_count),
        getLineColor: f => { const count = f.properties.activity_count ? f.properties.activity_count : 0; const rgb = d3.rgb(getColor(count)); return [rgb.r, rgb.g, rgb.b]},
        getLineWidth: f => 2000,
        lightSettings: LIGHT_SETTINGS,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      }),
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        // colorDomain,
        coverage,
        data: locData,
        elevationRange: [0, 30000],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        // upperPercentile
      }),
    ]

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}

DeckGLOverlay.displayName = 'DeckGLOverlay';
DeckGLOverlay.defaultProps = defaultProps;