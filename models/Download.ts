import mongoose, { Schema, Model, Types } from "mongoose";

export interface IDownload {
  wallpaper: Types.ObjectId;
  resolution: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const DownloadSchema = new Schema<IDownload>({
  wallpaper: { type: Schema.Types.ObjectId, ref: "Wallpaper", required: true, index: true },
  resolution: { type: String, required: true },
  ip: String,
  userAgent: String
}, { timestamps: { createdAt: true, updatedAt: false } });

DownloadSchema.index({ createdAt: -1 });
export const Download: Model<IDownload> = mongoose.models.Download || mongoose.model<IDownload>("Download", DownloadSchema);