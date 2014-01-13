// Generated by CoffeeScript 1.6.3
(function() {
  var app, express, libxmljs, moment, port, request, _;

  request = require('request');

  libxmljs = require('libxmljs');

  _ = require('underscore');

  express = require('express');

  app = express.createServer();

  moment = require('moment');

  app.get('/', function(req, res) {
    var cleanid, date_fields, date_fmt, handler, url;
    url = req.param('url');
    date_fields = req.param('datefields');
    date_fmt = req.param('datefmt');
    cleanid = req.param('cleanid');
    if (!(url && (cleanid || date_fields && date_fmt))) {
      return res.send(406, "missing required parameters");
    }
    if (cleanid) {
      handler = function(node) {
        var n;
        n = node.get(cleanid);
        if (n && n.text()) {
          return n.text(n.text().split('?')[0]);
        }
      };
    } else {
      date_fields = _.map(date_fields.split(','), function(f) {
        return f.trim();
      });
      handler = function(node) {
        return _.each(date_fields, function(df) {
          var fuckedup_date, n, proper_date;
          n = node.get(df);
          if (n && n.text()) {
            fuckedup_date = n.text();
            proper_date = moment(fuckedup_date, date_fmt);
            if (proper_date) {
              return n.text(proper_date.format());
            }
          }
        });
      };
    }
    return request(url, function(error, response, body) {
      var gchild, xmlDoc;
      if (error) {
        return res.send(406, "bad response from target url: " + error);
      }
      if (!error && response.statusCode === 200) {
        xmlDoc = libxmljs.parseXml(body);
        gchild = xmlDoc.find('//item');
        _.each(gchild, handler);
        return res.end(xmlDoc.toString());
      }
    });
  });

  port = process.env.PORT || 4000;

  console.log("feedfix up on " + port);

  app.listen(port);

}).call(this);
