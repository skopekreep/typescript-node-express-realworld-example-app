
import { model, Model, Schema, Document } from 'mongoose';
import { IArticle } from '../interfaces/article-interface';
import { IUserModel } from './user-model';
// import * as mongoose from 'mongoose';
// const User = mongoose.model('User');


export interface IArticleModel extends IArticle, Document {
	toArticleJSON(user);
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


ArticleSchema.methods.toArticleJSON = function(user: IUserModel) {
	return {
		slug: this.slug,
		title: this.title,
		description: this.description,
		body: this.body,
		tagList: this.tagList,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
		favorited: user ? user.isFavorite(this._id) : false,
		favoritesCount: this.favoritesCount,
		author: this.author
	};
};
// TODO: taglist
// TODO fix author

export const Article: Model<IArticleModel> = model<IArticleModel>('Article', ArticleSchema);
