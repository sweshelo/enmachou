import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import * as topojson from 'topojson-client'
import "./Map.css"

import mapJson from "../japan_geo2topo.json"
import {useRef} from "react"

const Map = ({visited}) => {
  const mapRef = useRef(null)
  const NonOperatingPrefectures = [
    '和歌山県',
    '鳥取県',
    '山口県',
    '徳島県',
    '長崎県',
    '沖縄県'
  ]

  const w = 350;
  const h = 450;
  // 地図の投影図法を設定する．
  const projection = d3.geoMercator()
    .center([137.5, 38])
    .scale(1200)
    .translate([w / 2, h / 2]);

  // GeoJSONからpath要素を作る．
  const path = d3.geoPath()
    .projection(projection);

  const jpn = mapJson;
  const geoJp = topojson.feature(jpn, jpn.objects['-']);
  const svg = d3.select(mapRef.current);
  svg.attr('height', h)
    .attr('width', w)
    .selectAll("path")
    .data(geoJp.features)
    .enter()
    .append("path")
    .attr("class", (d) => visited?.includes(d.properties.name_ja) ? 'visited-pref' : NonOperatingPrefectures.includes(d.properties.name_ja) ? 'non-operating-pref' : 'unvisited-pref')
    .attr("d", path);

  return (
    <>
      <svg id="map" ref={mapRef} />
    </>
  )
}

export default Map;
