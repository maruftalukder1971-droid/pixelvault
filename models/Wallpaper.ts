import mongoose, { Schema, Model, Types } from "mongoose";

export interface IWallpaper {
  title: string;
  slug: string;
  category: Types.ObjectId;
  tags: string[];
  cloudinaryId: string;
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
  downloads: number;
  views: number;
  likes: number; // ✅ ADD THIS
  featured: boolean;
  createdAt: Date;
}


const WallpaperSchema = new Schema<IWallpaper>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: { type: [String], default: [], index: true },
    cloudinaryId: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true, index: true },
    height: { type: Number, required: true },
    size: { type: Number, required: true },
    format: { type: String, default: "jpg" },
    downloads: { type: Number, default: 0, index: true },
    views: { type: Number, default: 0 },

    // ✅ FIXED FIELD
    likes: { type: Number, default: 0 },

    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

WallpaperSchema.index({ title: "text", tags: "text" });
WallpaperSchema.index({ createdAt: -1 });

export const Wallpaper: Model<IWallpaper> =
  mongoose.models.Wallpaper ||
  mongoose.model<IWallpaper>("Wallpaper", WallpaperSchema);
