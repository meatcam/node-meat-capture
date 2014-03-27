'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');
var defaults = {
  inputFormat: 'video4linux2',
  initialSkip: '0:0:1',
  size: '320x240',
  input: '/dev/video0',
  fps: '5',
  seconds: '2',
  gifFrameDelay: '100',
  tempOutput: 'tmp/out.gif',
  tempMinified: 'tmp/min.gif'
};

var Capture = function(opts) {
  var options = _.extend({}, defaults, opts);

  function base64(callback) {
    fs.readFile(options.tempMinified, {
      encoding: 'base64'
    }, function(err, data) {
      if (err) {
        callback(err);
      }
      callback(null, data);
    });
  }

  function compress(callback) {
    exec([
      'gifsicle -O2',
      '-d' + options.gifFrameDelay,
      '-o', options.tempMinified,
      options.tempOutput
    ].join(' '), function(err) {
      if (err) {
        callback(err);
      }
      base64(callback);
    });
  }

  this.capture = function(callback) {
    exec([
      'avconv -y',
      '-f', options.inputFormat,
      '-ss', options.initialSkip,
      '-s', options.size,
      '-i', options.input,
      '-r', options.fps,
      '-t', options.seconds,
      '-pix_fmt rgb24 -vf format=rgb8,format=rgb24',
      options.tempOutput
    ].join(' '), function(err) {
      if (err) {
        callback(err);
      }
      compress(callback);
    });
  };
};

module.exports = Capture;
