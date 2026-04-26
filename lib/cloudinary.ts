import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export type UploadResult = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

export async function uploadBuffer(buffer: Buffer, folder = "pixelvault"): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", quality: "auto:good" },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format
        });
      }
    ).end(buffer);
  });
}

export async function deleteAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function transformUrl(
  publicId: string,
  opts: { width?: number; quality?: "auto" | number; watermark?: boolean; download?: boolean; filename?: string; format?: string } = {}
) {
  const t: string[] = [];
  if (opts.format) {
    t.push(`f_${opts.format}`);
  } else {
    t.push("f_auto");
  }
  t.push(`q_${opts.quality ?? "auto"}`);
  if (opts.width) t.push(`w_${opts.width}`);
  if (opts.watermark) t.push("l_text:Arial_28_bold:pixelvault.com,co_white,o_55,g_south_east,x_30,y_30");
  if (opts.download) {
    const safeName = (opts.filename ?? "wallpaper").replace(/[^a-z0-9_-]+/gi, "_");
    t.push(`fl_attachment:${safeName}`);
  }
  return cloudinary.url(publicId, { transformation: [{ raw_transformation: t.join(",") }] });
}