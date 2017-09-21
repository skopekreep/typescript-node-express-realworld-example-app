
import { IUserModel } from '../models/user-model';


export interface IArticle {
	slug: string;
	title: string;
	description: string;
	body: string;
	tagList: [string];
	createdAt: Date;
	updatedAt: Date;
	favorited: boolean;
	favoritesCount: number;
	author: IUserModel;
}


export interface IQuery {
	tagList: {$in: any[]};
	author: string;
	_id: {$in: any[]};
}
