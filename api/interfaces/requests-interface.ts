
import { Request } from 'express';
import { IUserModel } from '../models/user-model';


// Add jwt payload details to Express Request
export interface JWTRequest extends Request {
	payload: {
		id: string,
		username: string,
		exp: number,
		iat: number
	};
}


// Add profile details to Express Request
export interface ProfileRequest extends JWTRequest {
	profile: IUserModel;
}
