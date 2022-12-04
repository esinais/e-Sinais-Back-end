# GIFIER
Create a gif from a video.
(Its more like a gif slideshow)

## Installation
```bash
npm install gifier
```

## Getting started
```javascript
const Gifier = require('gifier'); //Require gifier
```

## Creating gifs
```javascript
var newGif = new Gifier("/dir/to/source/video", "/dir/to/new/gif", {
   frames: 10,    //Number of frames to get from the video. The frames will be evenly distributed.
   size: '480x?', //Size of the new gif, '?' follows the video ratio.
   delay: 25      //Delay between the frames in ms.
})

//Event 'end' is fired when the gif is created.
newGif.on('end', ()=>{
   //Gif has been created.
})
```

## Algorithm
```
=> Create temporary folder in destination location.
=> Get the source video and create frames.
   -> Frames are evenly distributed depending on the count.
   -> IE: 4 frames will create frames in 25%, 50%, 75%, 100%
=> Create frames and store them in the temp folder.
=> Create GIF from frames to the destination.
=> Delete frames and temp folder.
```