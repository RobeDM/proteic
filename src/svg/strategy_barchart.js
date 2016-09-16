class SvgBarchartStrategy extends SvgChart {

  constructor(chartContext) {
    super(chartContext);
    var config = this.config;

    this.svgContainer = new SvgContainer(config);
    this.axes = new XYAxes('categorical', 'linear', config);
    this.bars = new Barset(this.axes.xAxis, this.axes.yAxis);

    this.svgContainer
      .add(this.axes)
      .add(this.bars, [new Tooltip()]);

  }

	/**
	 * Renders a barchart based on data object
	 * @param  {Object} data Data Object. Contains an array with x and y properties.
	 * 
	 */
  draw(data) {
    data = data || this.data;
    var svg = this.svgContainer.svg
      , config = this.config
      , isStacked = this.config.stacked
      , keys = this._getDataKeys(data)
      , yMin = 0
      , yMax = 0
      , method = isStacked ? 'stacked' : 'grouped';

    yMax = isStacked
      ? d3.max(data, (d) => d.total)
      : this._calculateMaxGrouped(data);

    this.axes.updateDomainByKeysAndBBox(keys, [yMin, yMax]);

    this.axes.transition(svg, 200);

    this.bars.update(svg, config, data, method);

    this.data = data; // TODO: ? 
  }
  _calculateMaxGrouped(data) {
    var max = -99999999;
    for (let i in data) {
      let object = data[i];
      let keys = Object.keys(object);
      for (let k in keys) {
        var key = keys[k];
        if (key !== 'total' && key !== 'key' && (object[key] > max)) {
          max = object[key];
        }
      }

    }
    return max;
  }

  _getDataKeys(data) {
    return data.map((d) => d.key);
  }

  transition2Stacked() {
    this.config.stacked = true;
  }

  transition2Grouped() {
    this.config.stacked = false;
  }

	/**
	 * This method adds config options to the chart context.
	 * @param  {Object} config Config object
	 */
  _loadConfigOnContext(config) {
    config = config || { events: {} };
    if (!config.events) {
      config.events = {};
    }
    super._loadConfigOnContext(config);
    this.config.stacked = typeof (config.stacked) === 'undefined' ? _default[this.constructor.name].stacked : config.stacked;
    //Just for testing purposes
    return this;
  }
}