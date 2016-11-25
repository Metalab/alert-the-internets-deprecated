var express     =   require('express');
var ejs         =   require('ejs');                // templating engine
var mongoose    =   require('mongoose');
var dbi         =   require('./dbmanager.js');     // database interaction
var models      =   require('./models/models.js'); // db model definitions
var multer      =   require('multer');             // for file upload
var upload      =   multer({ dest: './uploads/'});
var ffmpeg      =   require('fluent-ffmpeg');
var video       =   require('./video.js');
var app = express();


app.set('view engine', 'ejs');

app.use('/static', express.static(__dirname + '/public'));
app.use('/videofiles', express.static(__dirname + '/videofiles'));
app.use('/snapshots', express.static(__dirname + '/snapshots'));


app.use(multer({ dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename.replace(/\W/g, '_');
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...');
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path);
  }
}));

app.get('/',function(req,res) {
  res.render('upload');
});

app.get('/videos',function(req,res) {
  var videolist =
  models.Video.
    find({ editingDone: true }).
    sort({ uploadDate: -1 }).
//    select('title description date filename').
    exec( function (err, videos) {
      if (err) return console.error(err);
//      console.log(JSON.stringify(videos));
      res.render('entry-list', {
        videos: videos
      });
    });
});


app.get('/videos/:id/delete',function(req,res){
//  models.Video.
//    find({ _id: id });
  video.remove(req);
  res.send('Deleted!');
});


app.post('/api/upload',function(req,res){
  upload(req,res,function(err) {
    if(err) {
      return res.end("Error uploading file.");
    }
    if (!req.files.video) {
      res.end("No File added.");
    }
    if (!req.body.title) {
      res.end("No title added.");
    }
    //    console.log(JSON.stringify(req.files));
    var newVideo = new models.Video({
      title: req.body.title,
      description: req.body.description,
      wikipage: req.body.wikipage,
      filename: req.files.video.name,
      originalFilename: req.files.video.originalname,
    });
    newVideo.save(function (err, newVideo) {
      if (err) return console.error(err);
      video.edit(newVideo, function(err) {
        if (err) return console.error(err);
//        console.log(JSON.stringify(newVideo));
        newVideo.update( {editingDone: true}, {safe: true} , function(err) {
          if (err) return console.error(err);
          console.log("Update: editingDone set true");
          video.uploadToYoutube(function(err, newVideo) {
            if (err) return console.error(err);
            console.log("Video uploaded to YT!");
          });
        });
//        console.log(JSON.stringify(newVideo));
      });
      video.snapshot(newVideo, function(snapshotFilename) {
        // TBD: send success message to user
      });
      video.getCreationtime("uploads/"+newVideo.filename, function(creationtime) {
        if (creationtime) {
          newVideo.update( {creationtime: creationtime}, {safe: true} , function(err) {
            if (err) return console.error(err);
            console.log("creationtime - updated!");
          });
        }
      });
//        var  = video.snapshot("uploads/"+req.files.video.name, Date.now()+'_'+req.body.title);

    });

    res.end("File is uploaded");
  });

  //console.log(dbi);
  // add form input into db
//  dbi.addEntry(req.body.title, req.body.description, req.files.video.name);
});

/*
Video.find(function(err, videos) {
  if (err) return console.error(err);
  console.log(JSON.stringify(videos));
});
*/

app.listen(3500,function(){
  console.log("Working on port 3500");
});
