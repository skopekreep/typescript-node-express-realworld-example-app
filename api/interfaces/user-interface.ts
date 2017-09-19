
export interface IUser {
	email: string;
	username: string;
	bio?: string;
	image?: string;
}


export interface IProfile {
	username: string;
	bio: string;
	image: string;
	following: boolean;
}
