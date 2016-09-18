'use strict';

var memwatch = require('memwatch-next');
var fs = require("fs");
var firstLine = true;
var date = (new Date(Date.now())).toLocaleDateString().replace(/\//gi, '-');
var filename = `/home/gb/Desktop/Mutant-${date}.log`
var leakfile = `/home/gb/Desktop/Mutant-leak-${date}.log`
var hd;

module.exports = function( logFile ){
  filename = logFile || filename;
  hd = new memwatch.HeapDiff();
  /*memwatch.on("stats", function(stats) {
    var info = [];

    if(firstLine) {
      info.push("num_full_gc");
      info.push("num_inc_gc");
      info.push("heap_compactions");
      info.push("usage_trend");
      info.push("estimated_base");
      info.push("current_base");
      info.push("min");
      info.push("max");
      fs.appendFileSync(filename, info.join(",") + "\n");
      info = [];
      firstLine = false;
    }

    info.push(stats["num_full_gc"]);
    info.push(stats["num_inc_gc"]);
    info.push(stats["heap_compactions"]);
    info.push(stats["usage_trend"]);
    info.push(stats["estimated_base"]);
    info.push(stats["current_base"]);
    info.push(stats["min"]);
    info.push(stats["max"]);

    fs.appendFile(filename, info.join(",") + "\n");
  });*/
  memwatch.on('leak', function(info) {
    let log = info;
    log[ 'leak' ] = hd.end();
    fs.appendFileSync(leakfile, JSON.stringify(log, null, 2));
    log = null;
    hd = null;
    hd = new memwatch.HeapDiff();
  });
}