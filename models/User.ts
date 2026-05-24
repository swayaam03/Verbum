import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISavedNews {
  title: string;
  author?: string;
  source?: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt?: string;
  savedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  savedArticles: mongoose.Types.ObjectId[];
  savedNews: ISavedNews[];
  preferences?: {
    darkMode?: boolean;
    emailNotifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SavedNewsSchema = new Schema<ISavedNews>({
  title: { type: String, required: true },
  author: { type: String },
  source: { type: String },
  description: { type: String },
  url: { type: String, required: true },
  urlToImage: { type: String },
  publishedAt: { type: String },
  savedAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    socialLinks: {
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    savedArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    savedNews: [SavedNewsSchema],
    preferences: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);
