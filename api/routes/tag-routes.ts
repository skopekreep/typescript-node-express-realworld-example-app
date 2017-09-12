
import { Article } from '../models/article-model';
import { Router, Request, Response, NextFunction } from 'express';


const router: Router = Router();


// FIXME: Rewrite to pull from Articles...
router.get('/', (req: Request, res: Response, next: NextFunction) => {

	Article
		.find()
		.distinct('tagList')
		.then((tagsArray: [string]) => {
			return res.json({tags: tagsArray});
		})
		.catch(next);

});


export const TagRoutes: Router = router;
