const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');
const gifFrames = require('gif-frames');

const gifFramesOptions = {
  frames: 'all' || 1,
  cumulative: true,
  outputType: "jpg",
  quality: 1
};

const encoderOptions = {
  width: 100,
  height: 100,
  isRepeated: true
};

/**
 * @param {Canvas.CanvasRenderingContext2D} ctx canvas context
 * @param {number} fw full width
 * @param {number} fh full height
 * @param {Canvas} ACanvas full height
 */
async function defaultTodo(ctx, fw, fh, ACanvas) {
  return new Promise((res, rej) => {
    res(09);
  });
}

module.exports = class gifCreator {
  /**
   * @param {string} _gif A realtive path or url or in momry data
   * @param {encoderOptions} encoderOptions 
   * @param {gifFramesOptions} gifFramesOptions 
   */
  constructor(_gif, encoderOptions, gifFramesOptions) {
    this.gif = _gif;
    this.gifFramesOptions = gifFramesOptions || {};
    this.encoderOptions = encoderOptions || {};
    this.frames = [];
    this.encoder = new GIFEncoder(encoderOptions.width, encoderOptions.height);
    this.encoder.start();
    this.encoder.setRepeat((encoderOptions.isRepeated) ? 0 : -1);
  }
  /**
   * @returns {Promise<any[]|Error>}
   */
  async getFrames() {
    return new Promise(async (res, rej) => {
      try {
        this.frames = await gifFrames({
          url: this.gif,
          frames: this.gifFramesOptions.frames || 'all',
          cumulative: this.gifFramesOptions.cumulative || true,
          outputType: this.gifFramesOptions.outputType || "jpg"
        });
        res(this.frames);
      } catch (error) {
        rej(error)
      }
    });
  }
  /**
   * @param {number|number[]|string} index 
   * @param {defaultTodo} todo 
   */
  async editFrame(index, todo) {
    return new Promise(async (res, rej) => {
      try {
        for await (let frame of this.frames) {
          let canvas = Canvas.createCanvas(1440, 810);
          let ctx = canvas.getContext('2d');
          let b = new Canvas.Image()
          b.onload = () => {
            ctx.drawImage(b, 0, 0, canvas.width, canvas.height);
          }
          b.src = frame.getImage()._obj
          
          if (index == "all" || frame.frameIndex == index || index.includes(frame.frameIndex)) {
            await todo(ctx, this.encoderOptions.width, this.encoderOptions.height, Canvas);
          };

          this.encoder.setDelay(frame.delay);  
          this.encoder.addFrame(ctx);
          if (frame.frameIndex == this.frames.length-1) {
            res(null);
          }
        }
      } catch (error) {
        rej(error);
      }
    });
  }

  async out() {
    return new Promise(async (res, rej) => {
      this.encoder.finish();
      res(this.encoder.out.getData());
    });
  }

  async init() {
    return new Promise(async (res) => {
      await this.getFrames();
      res(this.frames);
    });
  }
} 
