// GameBanana Likes History Graph API
// Inspired by star-history (https://github.com/star-history/star-history)

import { JSDOM } from 'jsdom';
import { scaleTime, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line, curveMonotoneX } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import addFont from './addFont.js';

export default async function handler(req, res) {
  const { section = 'Tool', id = '19049', theme = 'light' } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    // fetch submission info first to get the name
    const infoResponse = await fetch(
      `https://gamebanana.com/apiv11/${section}/${id}/ProfilePage`
    );

    let submissionName = `${section} #${id}`;
    if (infoResponse.ok) {
      const info = await infoResponse.json();
      if (info._sName) {
        submissionName = info._sName;
      }
    }

    // fetch likes in parallel batches for speed
    const allLikes = [];
    const batchSize = 5; // fetch 5 pages at once
    const maxPages = 250;
    let currentPage = 1;
    let isComplete = false;

    while (currentPage <= maxPages && !isComplete) {
      // create batch of page requests
      const pagesToFetch = [];
      for (let i = 0; i < batchSize && currentPage + i <= maxPages; i++) {
        pagesToFetch.push(currentPage + i);
      }

      // fetch all pages in this batch
      const batchPromises = pagesToFetch.map(pageNum =>
        fetch(`https://gamebanana.com/apiv11/${section}/${id}/Likes?_nPage=${pageNum}`)
          .then(res => {
            if (!res.ok) throw new Error(`GameBanana API returned ${res.status}`);
            return res.json();
          })
      );

      const batchResults = await Promise.all(batchPromises);

      // process batch results
      for (const data of batchResults) {
        if (data._aRecords && data._aRecords.length > 0) {
          allLikes.push(...data._aRecords);
          if (data._aMetadata._bIsComplete) {
            isComplete = true;
            break;
          }
        } else {
          isComplete = true;
          break;
        }
      }

      currentPage += batchSize;
    }

    if (allLikes.length === 0) {
      throw new Error('No likes found');
    }

    allLikes.sort((a, b) => a._tsDateAdded - b._tsDateAdded);
    const timeSeriesMap = new Map();

    allLikes.forEach((like, index) => {
      const date = new Date(like._tsDateAdded * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      timeSeriesMap.set(dateKey, index + 1); // cumulative count
    });

    // convert to array with Date objects
    const timeSeries = Array.from(timeSeriesMap.entries()).map(([date, count]) => ({
      x: new Date(date),
      y: count
    }));

    const isDark = theme === 'dark';
    const isTrans = theme === 'trans';
    const width = 800;
    const height = 533; // 2:3 ratio like star-history
    const margin = { top: 60, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // banana theme
    const lineColor = isDark || isTrans ? '#FFD700' : '#FFC600';
    const bgColor = isTrans ? 'transparent' : (isDark ? '#0d1117' : '#ffffff');
    const textColor = isDark || isTrans ? '#ffffff' : '#000000';
    const labelColor = '#666666';

    const maxLikes = Math.max(...timeSeries.map(d => d.y), 1);

    // pretty much everything after this point is from star-history
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const document = dom.window.document;
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svgElement);

    const svg = select(svgElement)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('stroke-width', 3)
      .style('font-family', 'xkcd')
      .style('background', bgColor);

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', bgColor);

    addFont(svg);

    svg.append('defs')
      .append('filter')
      .attr('id', 'xkcdify')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('x', -5)
      .attr('y', -5)
      .attr('width', '100%')
      .attr('height', '100%')
      .call((f) => {
        f.append('feTurbulence')
          .attr('type', 'fractalNoise')
          .attr('baseFrequency', '0.05')
          .attr('result', 'noise');
        f.append('feDisplacementMap')
          .attr('scale', '5')
          .attr('xChannelSelector', 'R')
          .attr('yChannelSelector', 'G')
          .attr('in', 'SourceGraphic')
          .attr('in2', 'noise');
      });

    svg.append('text')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', textColor)
      .attr('x', '50%')
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .text('GameBanana Likes History');

    const legendXPadding = 7;
    const legendYPadding = 6;
    const xkcdCharWidth = 7;
    const xkcdCharHeight = 20;
    const colorBlockWidth = 8;
    const legendX = margin.left + 8;
    const legendY = margin.top + 5;

    const legendTextLength = submissionName.length;
    const legendWidth = legendTextLength * (xkcdCharWidth + 0.5) + colorBlockWidth + legendXPadding * 3 + 6;
    const legendHeight = xkcdCharHeight + legendYPadding * 2;

    const legend = svg.append('g').attr('class', 'legend');

    legend.append('rect')
      .style('fill', bgColor)
      .attr('fill-opacity', 0.85)
      .attr('stroke', textColor)
      .attr('stroke-width', 2)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('filter', 'url(#xkcdify)')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('x', legendX)
      .attr('y', legendY);

    legend.append('rect')
      .style('fill', lineColor)
      .attr('width', colorBlockWidth)
      .attr('height', colorBlockWidth)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('filter', 'url(#xkcdify)')
      .attr('x', legendX + legendXPadding)
      .attr('y', legendY + 12);

    legend.append('text')
      .style('font-size', '15px')
      .style('fill', textColor)
      .attr('x', legendX + legendXPadding + colorBlockWidth + 6)
      .attr('y', legendY + 12 + 8)
      .text(submissionName);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = scaleTime()
      .domain([
        Math.min(...timeSeries.map(d => d.x)),
        Math.max(...timeSeries.map(d => d.x))
      ])
      .range([0, chartWidth]);

    const yScale = scaleLinear()
      .domain([0, maxLikes])
      .range([chartHeight, 0]);

    const numberUnit = maxLikes >= 1000 ? 1000 : 1;
    const formatNumber = (n) => {
      if (n === 0) return ' ';
      if (numberUnit === 1000) {
        return `${(n / 1000).toFixed(1)}k`;
      }
      return `${n}`;
    };

    let tickValues;
    if (maxLikes < 100) {
      const step = 10;
      tickValues = [];
      for (let i = 0; i <= maxLikes; i += step) {
        tickValues.push(i);
      }
    } else if (maxLikes < 1000) {
      const step = 100;
      tickValues = [];
      for (let i = 0; i <= maxLikes; i += step) {
        tickValues.push(i);
      }
    } else {
      const step = 1000;
      tickValues = [];
      for (let i = 0; i <= maxLikes; i += step) {
        tickValues.push(i);
      }
    }

    const yAxisGenerator = axisLeft(yScale)
      .tickSize(1)
      .tickPadding(6)
      .tickValues(tickValues)
      .tickFormat(formatNumber);

    chart.append('g')
      .attr('class', 'yaxis')
      .call(yAxisGenerator);

    chart.selectAll('.domain')
      .attr('filter', 'url(#xkcdify)')
      .style('stroke', textColor);

    chart.selectAll('.yaxis > .tick > text')
      .style('font-family', 'xkcd')
      .style('font-size', '16px')
      .style('fill', textColor);

    const xAxisGenerator = axisBottom(xScale)
      .tickSize(0)
      .tickPadding(6)
      .ticks(5);

    chart.append('g')
      .attr('class', 'xaxis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxisGenerator);

    chart.selectAll('.xaxis .domain')
      .attr('filter', 'url(#xkcdify)')
      .style('stroke', textColor);

    chart.selectAll('.xaxis > .tick > text')
      .style('font-family', 'xkcd')
      .style('font-size', '16px')
      .style('fill', textColor);

    let yLabelOffset = 6;
    if (maxLikes >= 10000) {
      yLabelOffset = 2;
    } else if (maxLikes >= 1000) {
      yLabelOffset = 8;
    } else if (maxLikes >= 100) {
      yLabelOffset = 12;
    } else {
      yLabelOffset = 20;
    }

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('dy', '.75em')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '17px')
      .style('fill', textColor)
      .text('Likes')
      .attr('y', yLabelOffset)
      .attr('x', -height / 2 + 60);

    svg.append('text')
      .style('font-size', '17px')
      .style('fill', textColor)
      .attr('x', '50%')
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Date');

    const lineGenerator = line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(curveMonotoneX);

    chart.append('path')
      .datum(timeSeries)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('filter', 'url(#xkcdify)');

    const watermark = svg.append('g').attr('class', 'watermark');

    watermark.append('text')
      .attr('x', chartWidth + margin.left - 5)
      .attr('y', chartHeight + margin.top + 35)
      .attr('fill', '#666666')
      .style('font-size', '14px')
      .attr('text-anchor', 'end')
      .text('gamebanana-likes');

    watermark.append('text')
      .attr('x', chartWidth + margin.left - 5)
      .attr('y', chartHeight + margin.top + 50)
      .attr('fill', '#888888')
      .style('font-size', '11px')
      .attr('text-anchor', 'end')
      .text('inspired by star-history.com');

    // Extract the SVG HTML
    const svgHTML = svgElement.outerHTML;

    // Cache for 1 hour
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(svgHTML);

  } catch (error) {
    console.error('Error generating graph:', error);

    const errorSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
  <rect width="400" height="100" fill="#e74c3c"/>
  <text x="200" y="50" fill="#ffffff" font-size="16" text-anchor="middle">Error loading graph</text>
  <text x="200" y="70" fill="#ffffff" font-size="12" text-anchor="middle">${error.message}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(500).send(errorSvg);
  }
}
