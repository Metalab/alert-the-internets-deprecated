
var ffmpeg      =   require('fluent-ffmpeg');
var Promise     =   require('promise');
var fs          =   require('fs');
var models      =   require('./models/models.js'); // db model definitions

// var mainvid = "uploads/1456859550473_winkekatze-mit-audio.avi";
// var mainvid = "uploads/1456784702241_tmp_13280-VID_20160229_230756-178981832.mp4";
// var mainvid = "uploads/1456554516431_Komp 1.avi";

// var outputDest = "editedVideos/TESTOUTPUT2.mp4";

module.exports.snapshot = function(newVideo, callback) {
  var file = "uploads/"+newVideo.filename;
  var outputname = newVideo.videoId+'_'+newVideo.machinetitle+'.png';
  ffmpeg(file)
  .screenshots({
    count: 1,
    folder: 'snapshots',
    filename: outputname,
//     size: '640x?',
  })
  .on('end', function() {
    newVideo.update( {snapshotFilename: outputname}, {safe: true} , function(err) {
      if (err) return console.error(err);
      console.log('Snapshot File: '+outputname);
      console.log("Update: snapshotFilename set");
    });
    callback(outputname);
  });
};


module.exports.getCreationtime = function(file, callback) {
  ffmpeg(file).ffprobe(function(err, data) {
    console.log(JSON.stringify(data));
    var creationtime;
    if (data.streams[0].tags.creation_time) {
      creationtime = data.streams[0].tags.creation_time.toString();
      console.log("creation time: "+creationtime);
    }
    callback(creationtime);
  });
};


module.exports.edit = function(newVideo, callback) {
  var mainvid = "uploads/"+newVideo.filename;

  ffmpeg(mainvid).ffprobe(function(err, data) {
    console.log("edit trailer ...");
    var trailer = "mediasnippets/title1.mp4";
    var metadata = data.streams[0];
    var fps = metadata.r_frame_rate.split('/');
    fps = fps[0]/fps[1];
    var width = metadata.width;
    var height = metadata.height;
    var rotation = metadata.rotation;
    var sar = metadata.sample_aspect_ratio;
    console.log('dimensions: ' + width + 'x' + height + ', rotation:' + rotation + ', fps: ' + fps);
    if (rotation == "90" || rotation == "-90") {
      // swap vars height and width
      width = [height, height = width][0];
      console.log('correcting dimensions because of mainvids orientation: '+width+'x'+height);
    }
    // trailer angleichen
    ffmpeg(trailer)
    .fps(fps)
    .videoFilters(
      [
        // Scale trailer to dimensions of mainvid
        {
          filter: 'scale',
          options: 'iw*min('+width+'/iw\\,'+height+'/ih):ih*min('+width+'/iw\\,'+height+'/ih)'
        },
        {
          filter: 'pad',
          options: width+':'+height+':('+width+'-iw*min('+width+'/iw\\,'+height+'/ih))/2:('+height+'-ih*min('+width+'/iw\\,'+height+'/ih))/2'
        },
        {
          filter: 'setsar',
          options: sar
        }
      ])
    .save("temp/"+newVideo.videoId+"_trailer.mp4")
    .on('start', function(commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.percent + '% done');
    })
    .on('end', function() {
      console.log('trailer prepared for merging.');
//      console.log(end);
      editVideo(mainvid, "temp/"+newVideo.videoId+"_mainvid.mp4");
    });
  });
  var editVideo = function(mainvid, outputpath) {
    console.log('Normalize mainvid for merging');
    ffmpeg(mainvid)
    .save(outputpath)
    .on('end', function() {
      console.log('mainvid prepared for merging.');
      mergeFiles();
    });
  };

  var mergeFiles = function() {
    console.log('Start merging ...');
    var outputName = newVideo.videoId+"_"+newVideo.machinetitle+".mp4";
    var outputDest = "videofiles/"+outputName;
    ffmpeg()
    .input("temp/"+newVideo.videoId+"_trailer.mp4")
    .input("temp/"+newVideo.videoId+"_mainvid.mp4")
    .mergeToFile(outputDest, "temp/")
    .on('error', function(err) {
      callback(err.message);
    })
    .on('end', function() {
      console.log('Merging finished!');
      fs.unlink("temp/"+newVideo.videoId+"_trailer.mp4"), function(err){
        if(err) return console.log(err);
        console.log('Temp file deleted successfully: '+'temp/'+newVideo.videoId+'_trailer.mp4');
      }
      fs.unlink("temp/"+newVideo.videoId+"_mainvid.mp4"), function(err){
        if(err) return console.log(err);
        console.log('Temp file deleted successfully: '+'temp/'+newVideo.videoId+'_mainvid.mp4');
      }

      newVideo.update( {editedVideoFilename: outputName}, {safe: true} , function(err) {
        if (err) return console.error(err);
        console.log("Update: editedVideoFilename set to "+outputName);
      });

      callback();
    });
  };

};


module.exports.remove = function(videoId) {
  var requestedVideoId = videoId.params.id;
  models.Video.remove({ _id : requestedVideoId }, function(err) {
    if (err) return handleError(err);
    console.log(requestedVideoId +" deleted!");
  });
};


module.exports.uploadToYoutube = function(video, callback) {
  console.log(video);
  console.log(JSON.stringify(video));
  callback();
};
