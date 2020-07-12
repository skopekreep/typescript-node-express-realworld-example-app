import Article from "../database/models/article.model";
import Comment from "../database/models/comment.model";
import User from "../database/models/user.model";

declare module "express" {

  export interface Request {
    article?: Article;
    comment?: Comment;
    profile?: User;
    payload?: {
      id: string,
      username: string,
      exp: number,
      iat: number
    };
  }
}
