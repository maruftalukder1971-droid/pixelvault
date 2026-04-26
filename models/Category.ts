import mongoose, { Schema, Model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  color: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  color: { type: String, required: true, default: "#a78bfa" }
}, { timestamps: true });

export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);