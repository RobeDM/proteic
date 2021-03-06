import {simple2nested} from '../../utils/dataTransformation'
import {select} from 'd3';

export class Barset {
  constructor(xAxis, yAxis) {
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.lineGenerator = d3.line()
      .x((d) => xAxis.scale()(d.x))
      .y((d) => yAxis.scale()(d.y));
  }


  update(svg, config, data, method) {
    let bars = null;

    if (method === 'stacked') {
      this._updateStacked(svg, config, data);
    } else {
      this._updateGrouped(svg, config, data);
    }
    bars = svg.selectAll('g.serie rect');
    bars
      .on('mousedown.user', config.onDown)
      .on('mouseup.user', config.onUp)
      .on('mouseleave.user', config.onLeave)
      .on('mouseover.user', config.onHover)
      .on('click.user', config.onClick);
      
    /**
    TODO: Add default events?
    bars
      .on('mousedown.default', config.onDown)
      .on('mouseup.default', config.onUp)
      .on('mouseleave.default', function (){ select(this).transition().duration(150).attr('fill-opacity', 1)})
      .on('mouseover.default',  function (){ select(this).transition().duration(150).attr('fill-opacity', 0.9)})
      .on('click.default', config.onClick);
    **/

    this.interactiveElements = bars;
  }

  _updateStacked(svg, config, dataSeries) {
    this._cleanCurrentSeries(svg);

    let colorScale = config.colorScale,
      layer = svg.selectAll('.serie').data(dataSeries),
      layerEnter = layer.enter().append('g'),
      layerMerge = null,
      bar = null,
      barEnter = null,
      barMerge = null,
      x = this.xAxis.scale(),
      y = this.yAxis.scale();

    layerMerge = layer.merge(layerEnter)
      .attr('class', 'serie')
      .attr('fill', (d, i) => colorScale(i));

    bar = layerMerge.selectAll('rect')
      .data((d) => d);

    barEnter = bar.enter().append('rect');

    barMerge = bar.merge(barEnter)
      .attr("x", (d) => x(d.data.key))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());
  }


  _updateGrouped(svg, config, data) {
    this._cleanCurrentSeries(svg);

    let keys = d3.map(data, (d) => d.key).keys(),
      colorScale = config.colorScale,
      layer = svg.selectAll('.serie').data(data),
      layerEnter = null,
      layerMerge = null,
      bar = null,
      barEnter = null,
      barMerge = null,
      x = this.xAxis.scale(),
      y = this.yAxis.scale(),
      xGroup = d3.scaleBand().domain(keys).range([0, x.bandwidth()]),
      height = config.height;

    data = simple2nested(data, 'x');

    layer = svg.selectAll('.serie').data(data);

    layerEnter = layer.enter().append('g')
      .attr('transform', (d) => 'translate(' + x(d.key) + ')');

    layerMerge = layer.merge(layerEnter)
      .attr('class', 'serie')
      .attr('transform', (d) => 'translate(' + x(d.key) + ')');

    bar = layerMerge.selectAll('rect')
      .data((d) => d.values);

    barEnter = bar.enter().append('rect');

    barMerge = bar.merge(barEnter)
      .attr('width', xGroup.bandwidth())
      .attr("x", (d) => xGroup(d.key))
      .attr('fill', (d, i) => colorScale(i))
      .attr("y", (d) => y(d.y))
      .attr("height", (d) => height - y(d.y));

  }

  _getKeysFromData(data) {
    let keys = [];
    for (let p in data[0]) {
      if (p !== 'total' && p !== 'key') {
        keys.push(p);
      }
    }
    return keys;

  }

  _cleanCurrentSeries(svg) {
    svg.selectAll('.serie').remove();
  }

  render(svg, config) {
    //Do nothing, since bars render only when new data is received.
  }
}