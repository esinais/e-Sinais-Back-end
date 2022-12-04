const ffmpeg = require('fluent-ffmpeg');
const { EventEmitter } = require('events');
const gm = require('gm');
const path = require('path');
const fs = require('fs-extra');

const GIFEncoder = require('gifencoder')
const fss = require('fs');
const width = 480
const height = 270
const { createCanvas, loadImage } = require('canvas')

const defaultOptions = {
   frames: 10,
   size: '360x?',
   delay: 50
}

class GIF extends EventEmitter {
   randomString() {
      const randomNums = "0123456789";
      var randStr = "";
      for (var i = 0; i < 10; i++) {
         randStr += randomNums[Math.floor((Math.random() * 10))];
      }
      return randStr;
   }

   /**
    * Create a new gif from a source video.
    * @param {String} video Source video for the new gif.
    * @param {String} destination Destination of the new gif.
    * @param {Object} options Options
    * @param {Integer} options.frames The number of frames the gif will get from the source video.
    * @param {String} options.size The size of the new gif. IE: '480x?' '?' will follow the source video ratio.
    * @param {Integer} options.delay The delay between each frame in the new gif.
    */
   constructor(video, destination, nomeSinal, options) {
      if (!options) options = defaultOptions;
      super();
      //const tempFolder = path.join(destination.split('/').slice(0, -1).join('/'), 'temp-'+this.randomString());
      const tempFolder = path.join(destination.split('/').slice(0, -1).join('/'), 'temp');
      
      fs.mkdirSync(tempFolder);
         ffmpeg(video).screenshots({
            count: (options.frames || 10),
            filename: 'temp-%i',
            size: (options.size || '360x?'),
            folder: tempFolder
         }).on('end', () => {
            var newGif = gm();
            var gifFrames = [];
   
            for (var i of fs.readdirSync(tempFolder)) {
               if (i.endsWith('.png')) {
                  gifFrames.push(path.join(tempFolder, i));
                  newGif.in(path.join(tempFolder, i));
                  
               }
            }
            
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext('2d')
            const encoder = new GIFEncoder(width, height)
            encoder.createReadStream().pipe(fs.createWriteStream(destination+""+nomeSinal))
            encoder.start()
            encoder.setRepeat(0)
            encoder.setDelay(100)
            encoder.setQuality(10)
            

            const list = fs.readdirSync(tempFolder)
            
            list.forEach(async (f, i) => {
               const image = await loadImage(tempFolder+"/" + f)
               ctx.drawImage(image, 0, 0)
               encoder.addFrame(ctx)
   
               if (i === list.length - 1) {
                  encoder.finish()
               }
            })
            for (var i of gifFrames) {
               fs.removeSync(path.join(i));
            }
            fs.rmdirSync(tempFolder);
            fs.unlink(video)
            this.emit('end', {});
            
         })
         
      return this;
   }

}

module.exports = GIF;