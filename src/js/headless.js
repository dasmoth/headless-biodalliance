#! /usr/bin/env node

"use strict"

const biodalliance = require('dalliance');
const jsdom = require('jsdom');
const XMLHttpRequest = require('xhr2');
const fs = require('fs');

const args = require('yargs')
      .usage('Usage: $0 [options]')
      .describe('config', 'Configuration file')
      .nargs('config', 1)
      .describe('output', 'Output filename')
      .nargs('output', 1)
      .describe('region', 'Target genome region (in format chrom:start-end)')
      .describe('width', 'Browser width (in logical pixels, default=1000)')
      .default('width', 1000)
      .describe('timeout', 'Timeout to abort render (seconds, default=30)')
      .default('timeout', 30)
      .demand(0, ['output'])
      .argv;

const defaultOpts = {
    chr:                 '22',
    viewStart:           30300000,
    viewEnd:             30500000,

    coordSystem: {
        speciesName: 'Human',
        taxon: 9606,
        auth: 'GRCh',
        version: '38',
        ucscName: 'hg38'
    },

    sources:          [
        {name:                 'Genome',
         twoBitURI:            'http://www.biodalliance.org/datasets/hg38.2bit',
         tier_type: 'sequence'},

        {name: 'GENCODE',
         desc: 'Gene structures from GENCODE 20',
         bwgURI: 'https://www.biodalliance.org/datasets/GRCh38/gencode.v20.annotation.bb',
         stylesheet_uri: 'https://www.biodalliance.org/stylesheets/gencode2.xml',
         collapseSuperGroups: true}
   ]
}

const fixedOpts = {
    maxWorkers: 0
}

// Nearly the same pattern as used in "actual" Biodalliance, but requires
// and end position

const REGION_PATTERN = /^([\d+,\w,\.,\_,\-]+)[\s:]+([0-9,\.]+?)([KkMmGg])?(-|\.\.|\s)+([0-9,\.]+)([KkMmGg])?$/;

function parseRegion(region) {
    const match = REGION_PATTERN.exec(region)
    if (!match) {
        console.log('Bad region: ' + region);
        process.exit(1);
    } else {
        return {
            chr: match[1],
            viewStart: parseLocCardinal(match[2], match[3]),
            viewEnd: parseLocCardinal(match[5], match[6])
        }
    }
}

function parseLocCardinal(n, m) {
    var i = parseFloat(n.replace(/,/g, ''));
    if (m === 'k' || m === 'K') {
        return (i * 1000)|0;
    } else if (m == 'm' || m === 'M') {
        return (i * 1000000)|0;
    } else {
        return i|0;
    }
}

function headlessBiodalliance(config, output, width, timeout, region) {
    const configData = config ? JSON.parse(fs.readFileSync(config)) : {};
    const regionData = region ? parseRegion(region) : {};

    const browser = new biodalliance.Browser(
        Object.assign(
            {},
            defaultOpts,
            configData,
            fixedOpts,
            regionData,
            {
                offscreenInitWidth: width,
                onFirstRender: function() {
                    const svg = browser.makeSVG({'width': width, output: 'string'});
                    fs.writeFileSync(output, svg.replace(/clippath/g, 'clipPath'))
                    process.exit(0);
                }
            }
        )
    );

    setTimeout(
        function() {
            console.log('timeout!');
            process.exit(1);
        }, timeout * 1000
    );
}

const XMLAwareHttpRequest = function() {
    XMLHttpRequest.call(this);
}

XMLAwareHttpRequest.prototype = Object.create(XMLHttpRequest.prototype);
XMLAwareHttpRequest.prototype.constructor = XMLAwareHttpRequest;

Object.defineProperty(XMLAwareHttpRequest.prototype, "responseXML", {
    get: function() {
        return jsdom.jsdom(this.response, {parsingMode: 'xml'});
    }
});

jsdom.env({
    html: '<!doctype html><html><body><div id="svgHolder"></div></body></html>',
    features: {QuerySelector: true},
    done: function(err, window) {
        global.window = window;
        global.Node = window.Node;
        global.document = window.document;
        global.localStorage = {};
        global.XMLHttpRequest = XMLAwareHttpRequest;

        headlessBiodalliance(args.config, args.output, args.width, args.timeout, args.region);
    }
});
