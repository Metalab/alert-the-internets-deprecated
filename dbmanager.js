var mongoose    =   require('mongoose');

// connect to database
mongoose.connect('mongodb://localhost:27017/alertTheInternets');
var db = mongoose.connection;
db.on('error', function(msg) {
  console.log("DB connection failed:\n"+ msg);
});
db.once('open', function(){
  console.log("DB connection succeeded!");
});

/*
var videoSchema = mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  youtubelink: String,
  hidden: Boolean,
  date: { type: Date, default: Date.now }
});
*/


/*
var video = {
  create: function(title,description,filename,youtubelink) {
    new Video({
      title: title,
      description: description,
      filename: filename,
      youtubelink: youtubelink,
    });
  },
  save: function(err, video.create) {
    if (err) return console.error(err);
  }
};
*/

/*
Video.find(function(err, videos) {
  if (err) return console.error(err);
  console.log(videos);
});
*/
