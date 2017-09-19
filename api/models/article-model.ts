
import { model, Model, Schema, Document } from 'mongoose';
import { IArticle } from '../interfaces/article-interface';
import { IUserModel, User } from './user-model';


export interface IArticleModel extends IArticle, Document {
	formatAsArticleJSON(user);
}


const ArticleSchema = new Schema({
	slug: {type: String, lowercase: true, unique: true},
	title: String,
	description: String,
	body: String,
	tagList: [String],
	favoritesCount: {type: Number, default: 0},
	author: {type: Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});


ArticleSchema.methods.formatAsArticleJSON = function(user: IUserModel) {

	return {
		slug: this.slug,
		title: this.title,
		description: this.description,
		body: this.body,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		tagList: this.tagList,
		favorited: user ? user.isFavorite(this._id) : false,
		favoritesCount: this.favoritesCount,
		author: this.author.formatAsProfileJSON(user)
	};

};


export const Article: Model<IArticleModel> = model<IArticleModel>('Article', ArticleSchema);
