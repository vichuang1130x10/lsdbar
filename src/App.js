import React, { Component } from "react";
import * as d3 from "d3";
import "./App.css";

const width = 500;
const height = 300;
const margin = { top: 20, right: 5, bottom: 25, left: 35 };

class App extends Component {
  state = {
    scaleX: null,
    scaleY: null,
    bars: [],
    lines: [],
    trendData: [],
  };

  xAxis = React.createRef();
  yAxis = React.createRef();
  filename = "";

  handleCSV = (e) => {
    this.filename = e.target.files[0].name;
    d3.csv(URL.createObjectURL(e.target.files[0])).then((d) => {
      console.log("start parsing");
      let n = {};
      const subGroupNames = Object.keys(d[0]);
      console.log(subGroupNames);
      subGroupNames.forEach((name) => {
        n[name] = d.map((d) => d[name]);
      });
      console.log(n);

      this.drawSvg(n);
    });
  };

  drawSvg = (rawData) => {
    const x = Object.keys(rawData);
    const scaleX = d3
      .scaleBand()
      .domain(x)
      .range([margin.left, width - margin.left]);

    const scaleY = d3
      .scaleLinear()
      .domain([0, 45])
      .range([height - margin.bottom, margin.top]);

    let data = [];
    x.forEach((name, i) => {
      const mean = d3.mean(rawData[name]);
      const stdev = d3.deviation(rawData[name]);
      const SE = Math.sqrt((stdev * stdev) / rawData[name].length);
      const CI_TOP = mean + 2 * SE;
      const CI_BOTTOM = mean - 2 * SE;
      console.log(CI_TOP);
      console.log(CI_BOTTOM);

      const color = d3.schemeAccent[i];

      data.push({ name, mean, color, CI_TOP, CI_BOTTOM });
    });

    const bars = data.map((d) => {
      return {
        x: scaleX(d.name) + 20,
        y: scaleY(d.mean),
        height: 10,
        width: 10,
        fill: d.color,
      };
    });

    const trend = d3
      .line()
      .x((d) => scaleX(d.name) + 25)
      .y((d) => scaleY(d.mean) + 5);

    const trendData = trend(data);

    const lines = data.map((d) => {
      return {
        x1: scaleX(d.name) + 25,
        y1: scaleY(d.CI_TOP),
        x2: scaleX(d.name) + 25,
        y2: scaleY(d.CI_BOTTOM),
        stroke: d.color,
      };
    });

    //   const textLabels = updateData.map(d => ({
    //     x: xScale(d.unit) + 7 - barPadding,
    //     y: yScaleRight(d.total),
    //     text: d.total,
    // }))

    // const text = bins.map((d) => {
    //   return {
    //     x: scaleX(d.x0 + 2),
    //     y: scaleY(d.length + 2),
    //     text: d.length,
    //   };
    // });

    this.setState({ bars, scaleX, scaleY, lines, trendData });
  };

  componentDidUpdate() {
    console.log("component udpated");
    this.createAxis();
  }

  createAxis = () => {
    const { scaleX, scaleY } = this.state;
    let xAxisD3 = d3.axisBottom().tickFormat((d) => d);
    let yAxisD3 = d3.axisLeft().tickFormat((d) => d);

    xAxisD3.scale(scaleX);

    if (this.xAxis.current) {
      console.log("draw x");
      d3.select(this.xAxis.current).call(xAxisD3);
    }

    yAxisD3.scale(scaleY);

    if (this.yAxis.current) {
      console.log("draw y");
      d3.select(this.yAxis.current).call(yAxisD3);
    }
  };

  render() {
    const { bars, lines, trendData } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <input type="file" onChange={this.handleCSV} />
          </div>
          <svg width={width} height={height}>
            {trendData.length ? (
              <path
                d={trendData}
                fill={"none"}
                stroke={"#ccc"}
                strokeWidth={"0.5px"}
              />
            ) : null}
            {bars.length
              ? bars.map((d, i) => (
                  <rect
                    key={i}
                    x={d.x}
                    y={d.y}
                    width={d.width}
                    height={d.height}
                    fill={d.fill}
                  />
                ))
              : null}

            {lines.length
              ? lines.map((d, i) => (
                  <line
                    key={i}
                    x1={d.x1}
                    y1={d.y1}
                    x2={d.x2}
                    y2={d.y2}
                    stroke={d.stroke}
                  />
                ))
              : null}

            {lines.length
              ? lines.map((d, i) => (
                  <line
                    key={i}
                    x1={d.x1 - 5}
                    y1={d.y1}
                    x2={d.x2 + 5}
                    y2={d.y1}
                    stroke={d.stroke}
                  />
                ))
              : null}

            {lines.length
              ? lines.map((d, i) => (
                  <line
                    key={i}
                    x1={d.x1 - 5}
                    y1={d.y2}
                    x2={d.x2 + 5}
                    y2={d.y2}
                    stroke={d.stroke}
                  />
                ))
              : null}

            <g
              ref={this.xAxis}
              transform={`translate(0, ${height - margin.bottom})`}
            />
            <g ref={this.yAxis} transform={`translate(${margin.left}, 0)`} />
          </svg>
        </header>
      </div>
    );
  }
}

export default App;
