var mongoose    =   require('mongoose');
var shortid     =   require('shortid');

/* Video entries */
var videoSchema = mongoose.Schema({
  videoId: { type: String, unique: true, default: shortid.generate},
  uploadDate: { type: Date, default: Date.now },
  published: Boolean,

  // data provided by the user via the upload form
  title: String,
  description: String,
  wikipage: String,

  // data sent by the client via POST request
  clientFilename: String,
  clientMimeType: String,

  // video storage on the server
  sourceFilename: String, // filename of input file after upload
  filename: String,
  videoProcessingFinished: Boolean,
  snapshotFilename: String,

  // metadata extracted via ffmpeg
  creationTime: String,

  // data concerning youtube upload
  uploadToYoutube: Boolean,
  uploadToYoutubeDone: Boolean,
  youtubeLink: String
});

videoSchema.virtual('machinetitle').get(function(){
  return this.title.replace(/\W/g, '_');
});

videoSchema.virtual('sourcePath').get(function(){
  return "uploads/" + this.sourceFilename;
})

videoSchema.virtual('snapshotPath').get(function(){
  return "snapshots/" + this.snapshotFilename;
})

videoSchema.virtual('videoPath').get(function(){
  return "videofiles/" + this.filename;
})
var Video = mongoose.model('Video', videoSchema);

module.exports.Video = Video;
