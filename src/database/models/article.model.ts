import { Document, Model, model, Schema } from 'mongoose';
import { IArticle } from '../../interfaces/article-interface';
import IUserModel, { User } from './user.model';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import slugify from "slugify";

export default interface IArticleModel extends IArticle, Document {
  toJSONFor(user: IUserModel): any;

  slugify(): string;

  updateFavoriteCount(): Promise<IArticleModel>;
}

const ArticleSchema = new Schema({
  slug          : {
    type     : Schema.Types.String,
    lowercase: true,
    unique   : true
  },
  title         : {
    type: Schema.Types.String
  },
  description   : {
    type: Schema.Types.String
  },
  body          : {
    type: Schema.Types.String
  },
  tagList       : [
    {
      type: Schema.Types.String
    }
  ],
  favoritesCount: {
    type   : Schema.Types.Number,
    default: 0
  },
  author        : {
    type: Schema.Types.ObjectId,
    ref : 'User'
  },
  comments      : [
    {
      type: Schema.Types.ObjectId,
      ref : 'Comment'
    }
  ],
}, {
  timestamps: true
});

ArticleSchema.methods.slugify = function () {
  this.slug = slugify(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

ArticleSchema.plugin(mongooseUniqueValidator, {message: 'is already taken'});

ArticleSchema.pre<IArticleModel>('validate', (function (next) {
  if (!this.slug) {
    this.slugify();
  }
  next();
}));

ArticleSchema.methods.updateFavoriteCount = function () {
  const article = this;
  return User.count({favorites: {$in: [article._id]}}).then(function (count) {
    article.favoritesCount = count;
    return article.save();
  });
};


ArticleSchema.methods.toJSONFor = function (user: IUserModel) {
  return {
    slug          : this.slug,
    title         : this.title,
    description   : this.description,
    body          : this.body,
    createdAt     : this.createdAt,
    updatedAt     : this.updatedAt,
    tagList       : this.tagList,
    favorited     : user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author        : this.author.toProfileJSONFor(user)
  };

};

export const Article: Model<IArticleModel> = model<IArticleModel>('Article', ArticleSchema);
