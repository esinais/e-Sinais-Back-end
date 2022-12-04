const GIF = require('./index.js');

var newGif = new GIF("E:/Libraries/Videos/Captures/2017-02-10-18-27-21.mkv", "E:/Libraries/Desktop/asdasd.gif", {
   frames: 4,
   delay: 1000
}).on('end', ()=>{
   console.log('END');
});