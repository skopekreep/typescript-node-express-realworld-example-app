
import { Request } from 'express';
import { IUserModel } from '../models/user-model';
import { IArticleModel } from '../models/article-model';


// Add jwt payload details to Express Request
export interface JWTRequest extends Request {
	payload: {
		id: string,
		username: string,
		exp: number,
		iat: number
	};
}


// Add profile details to JWT Request
export interface ProfileRequest extends JWTRequest {
	profile: IUserModel;
}


// Add article details to ProfileRequest
export interface ArticleRequest extends ProfileRequest {
	article: IArticleModel;
}
