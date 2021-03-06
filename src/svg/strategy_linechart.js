import { defaults } from '../utils/defaults/linechart';
import { SvgAxis } from './base/svgAxis';
import { XYAxes } from './components/xyAxes';
import { Lineset } from './components/lineset';
import { Legend } from './components/legend';
import { Areaset } from './components/areaset';
import { Pointset } from './components/pointset';
import { convertByXYFormat } from '../utils/dataTransformation';
import { sortByField } from '../utils/dataSorting';

export class SvgLinechartStrategy extends SvgAxis {

  constructor(context) {
    super(context);

    this.axes = new XYAxes(this.config.xAxisType, 'linear', this.config);

    this.lines = new Lineset(this.axes.x, this.axes.y);
    this.legend = new Legend();

    //Include components in the chart container
    this.svgContainer
      .add(this.axes)
      .add(this.legend)
      .add(this.lines);

    if (this._checkArea(this.config)) {
      this.areas = new Areaset(this.axes.x, this.axes.y);
      this.svgContainer.add(this.areas);
    }

    if (this._checkMarkers(this.config)) {
      this.points = new Pointset(this.axes.x, this.axes.y);
      this.svgContainer.add(this.points);
    }
  }

	/**
	 * Renders a linechart based on data object
	 * @param  {Object} data Data Object. Contains an array with x and y properties.
	 * 
	 */
  draw(data) {
    let svg = this.svgContainer.svg,
      config = this.config,
      needRescaling = this.config.needRescaling,
      bbox = null;

    //Transform data, if needed
    convertByXYFormat(data, config);

    //Sort data
    sortByField(data, 'x');

    //rescale, if needed.
    if (needRescaling) {
      this.rescale();
    }


    bbox = this._getDomainBBox(data);

    this.axes.updateDomainByBBox(bbox);

    //Create a transition effect for dial rescaling
    this.axes.transition(svg, 200);

    // Update legend
    this.legend.update(svg, config, data);

    //Now update lines
    this.lines.update(svg, config, data);

    if (config.areaOpacity > 0) {
      // Update areas
      this.areas.update(svg, config, data);
    }

    if (this._checkMarkers(config)) {
      // Update points
      this.points.update(svg, config, data);
    }

  }

  _getDomainBBox(data) {
    var minX = d3.min(data, (d) => d.x),
      maxX = d3.max(data, (d) => d.x),
      minY = d3.min(data, (d) => d.y),
      maxY = d3.max(data, (d) => d.y);
    return [minX, maxX, minY, maxY];
  }


  _checkMarkers(config) {
    return config.markerSize > 0;
  }
  _checkArea(config) {
    return config.areaOpacity > 0;
  }

  /**
   * This method adds config options to the chart context.
   * @param  {Object} config Config object
   */
  _loadConfig(config) {
    super._loadConfig(config, defaults);
    //Markers
    this.config.markerOutlineWidth = config.markerOutlineWidth || defaults.markerOutlineWidth;
    this.config.markerShape = config.markerShape || defaults.markerShape;
    this.config.markerSize = (typeof config.markerSize === 'undefined' || config.markerSize < 0) ? defaults.markerSize : config.markerSize;
    //Area
    this.config.areaOpacity = (typeof config.areaOpacity === 'undefined' || config.markerSize < 0) ? defaults.areaOpacity : config.areaOpacity;
    return this;
  }
}