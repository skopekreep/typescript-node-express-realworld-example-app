import User from "../database/models/user.model";
import Article from "../database/models/article.model";

export interface IComment {
  body: string;
  author: User;
  article: Article;
}
