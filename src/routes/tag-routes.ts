import { Article } from '../database/models/article.model';
import { NextFunction, Request, Response, Router } from 'express';


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
