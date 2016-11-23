var mongoose    =   require('mongoose');
var shortid     =   require('shortid');

/* Video entries */
var videoSchema = mongoose.Schema({
  videoId: { type: String, unique: true, 'default': shortid.generate},
  title: String,
  description: String,
  wikipage: String,
  creationtime: String,
  filename: String,
  filenameEdited: String,
  editingDone: Boolean,
  originalFilename: String,
  editedVideoFilename: String,
  snapshotFilename: String,
  published: Boolean,
  uploadToYoutube: Boolean,
  youtubelink: String,
  uploadDate: { type: Date, default: Date.now }
});

videoSchema.virtual('machinetitle').get(function(){
  return this.title.replace(/\W/g, '_');
});


var Video = mongoose.model('Video', videoSchema);

module.exports.Video = Video;
