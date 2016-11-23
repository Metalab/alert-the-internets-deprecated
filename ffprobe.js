var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

var videopath = process.argv[2];
var outputpath = videopath+"_metadata.json";

ffmpeg(videopath).ffprobe(function(err, data) {
  fs.writeFile(outputpath, JSON.stringify(data), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved! Output: "+outputpath);
  });
});
