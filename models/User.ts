import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  username: string;
  passwordHash: string;
  role: "admin" | "editor";
  failedAttempts: number;
  lockedUntil?: Date;
  lastLogin?: Date;
  totpSecretEnc: string;
  recoveryCodeHashes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "editor"], default: "admin" },
  failedAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  lastLogin: Date,
  totpSecretEnc: { type: String, required: true },
  recoveryCodeHashes: { type: [String], default: [] }
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);