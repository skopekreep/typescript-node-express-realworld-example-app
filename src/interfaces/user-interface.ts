import User from "../database/models/user.model";

export interface IUser {
  email: string;
  username: string;
  bio?: string;
  image?: string;
  following: User[];
}


export interface IProfile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}
