import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";

export const compressedBuffer = async (pngBuffer: Buffer) =>
  await imagemin.buffer(pngBuffer, {
    plugins: [
      imageminPngquant({
        quality: [0.5, 0.7]
      })
    ]
  });
