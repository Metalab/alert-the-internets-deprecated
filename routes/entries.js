var express = require('express');
var router = express.Router();

var Entry = require('./../models/entries.js');

router.get('/', function(req,res){
  Entry.find({}).exec( function(err, entries){
      res.render('videos/index', {entries: entries} )
  });
});
