
import { Request } from 'express';
import * as jwt from 'express-jwt';


export const jwtSecret = process.env.NODE_ENV === 'production'  ?  process.env.SECRET : 'secret';


function getTokenFromHeader(req: Request): string | null {

	const headerAuth: string | string[] = req.headers.authorization;

	if (headerAuth !== undefined  &&  headerAuth !== null) {

		if (Array.isArray(headerAuth)) {
			return splitToken(headerAuth[0]);
		} else {
			return splitToken(headerAuth);
		}

	} else {

		return null;
	}
}


function splitToken(authString: string) {

	if (authString.split(' ')[0] === 'Token') {
		return authString.split(' ')[1];

	} else {
		return null;
	}
}


const	auth = {
		required: jwt({
			credentialsRequired: true,
			secret: jwtSecret,
			getToken: getTokenFromHeader,
			userProperty: 'payload'}),

		optional: jwt({
			credentialsRequired: false,
			secret: jwtSecret,
			getToken: getTokenFromHeader,
			userProperty: 'payload'})
};


// TODO: What was this for?
	// function isRevokedCallback() {
	//
	// }


export const authentication = auth;
