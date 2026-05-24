import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  imagePath?: string;
  status: 'draft' | 'published';
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imagePath: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Article || model<IArticle>('Article', ArticleSchema);
