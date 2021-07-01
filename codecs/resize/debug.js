// THIS IS NOT A NODE SCRIPT
// This is a d8 script. Please install jsvu[1] and install v8.
// Then run `npm run --silent benchmark`.
// [1]: https://github.com/GoogleChromeLabs/jsvu
// import initResizeWasm, { resize as wasmResize } from 'pkg/squoosh_resize';
// const { createCanvas, loadImage } = require('canvas')
// var sr = require('./pkg/squoosh_resize');

async function my_resize(
    data,
    opts,
  ) {
    const {initResizeWasm, resize} = await import("./pkg/squoosh_resize");

    let input = data;
  
    if (!resizeWasmReady) {
      resizeWasmReady = initResizeWasm();
    }
  
    if (optsIsHqxOpts(opts)) {
      input = await hqx(input, opts);
      // Regular resize to make up the difference
      opts = { ...opts, method: 'catrom' };
    }
  
    console.log(JSON.stringify(opts));
    console.log(new Uint8Array(input.data.buffer));
  
    await resizeWasmReady;
  
    console.log('wasm ready pass');
  
    if (opts.fitMethod === 'contain') {
      const { sx, sy, sw, sh } = getContainOffsets(
        data.width,
        data.height,
        opts.width,
        opts.height,
      );
      input = crop(
        input,
        Math.round(sx),
        Math.round(sy),
        Math.round(sw),
        Math.round(sh),
      );
    }
  
    console.log('pass fit method');
  
    const result = resize(
      new Uint8Array(input.data.buffer),
      input.width,
      input.height,
      opts.width,
      opts.height,
      resizeMethods.indexOf(opts.method),
      opts.premultiply,
      opts.linearRGB,
    );
  
    console.log('Resize Done');
  
    return new ImageData(
      new Uint8ClampedArray(result.buffer),
      opts.width,
      opts.height,
    );
  }
  

async function init() {
    // const { createCanvas, loadImage } = await import('./node_modules/canvas/index');
    // const canvas = createCanvas(200, 200);
    // const ctx = canvas.getContext('2d');
    const pandaUrl = "https://squoosh.app/c/icon-demo-large-photo-18da387a.jpg";
    // const image = await loadImage(pandaUrl);
    // await ctx.drawImage(image, 0, 0);
    
    // let imageData = ctx.getImageData();
    const pandaImgResponse = await fetch(pandaUrl);
    const pandaImgArray = new Uint8ClampedArray(pandaImgResponse.arrayBuffer);
    const imageData = new ImageData(pandaImgArray,3872,2592);
    const opts = {"enabled":true,"width":3872,"height":2592,"method":"lanczos3","fitMethod":"stretch","premultiply":false,"linearRGB":true}
    await resize(imageData,opts);
}
  init().catch(e => console.error(e.stack));