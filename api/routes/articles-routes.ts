
import { Router, Response, NextFunction } from 'express';
import { authentication } from '../models/authentication';
import { JWTRequest } from '../interfaces/requests-interface';
import { Article, IArticleModel } from '../models/article-model';


const router: Router = Router();


/**
 * // GET /api/articles
 */
router.get('/', authentication.optional, (req: JWTRequest, res: Response, next: NextFunction) => {

		Article
			.findOne()
			.then( (article: IArticleModel) => {
					// res.status(200).json({article: article.toArticleJSON()});
				res.json({message: 'working on this...'});
				}
			)
			.catch(next);

	// .findById(req.payload.id)
	// 		.then((user: IUserModel) => {
	// 				res.status(200).json({user: user.formatAsUserJSON()});
	// 			}
	// 		)
	// 		.catch(next);
	//
	}
);

// TODO: Remining routes
// GET /api/articles/feed
// GET /api/articles/:slug
// POST /api/articles
// PUT /api/articles/:slug
// DELETE /api/articles/:slug
// POST /api/articles/:slug/comments
// GET /api/articles/:slug/comments
// DELETE /api/articles/:slug/comments/:id
// POST /api/articles/:slug/favorite
// DELETE /api/articles/:slug/favorite


export const ArticlesRoutes: Router = router;
