import { Request, Response, Router } from 'express';
import { authentication } from '../utilities/authentication';
import { User } from '../database/models/user.model';
import { Article } from "../database/models/article.model";
import { Comment } from "../database/models/comment.model";

const router: Router = Router();

// Preload article objects on routes with ':article'
router.param('article', function (req: Request, res: Response, next, slug) {
  Article.findOne({slug: slug})
    .populate('author')
    .then(function (article) {
      if (!article) {
        return res.sendStatus(404);
      }

      req.article = article;

      return next();
    }).catch(next);
});

router.param('comment', function (req: Request, res: Response, next, id) {
  Comment.findById(id).then(function (comment) {
    if (!comment) {
      return res.sendStatus(404);
    }

    req.comment = comment;

    return next();
  }).catch(next);
});

router.get('/', authentication.optional, function (req: Request, res: Response, next) {
  const query: any = {};
  let limit        = 20;
  let offset       = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = parseInt(req.query.limit as string);
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = parseInt(req.query.offset as string);
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tagList = {"$in": [req.query.tag]};
  }

  Promise.all([
    req.query.author ? User.findOne({username: req.query.author as string}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited as string}) : null
  ]).then(function (results) {
    const author    = results[0];
    const favoriter = results[1];

    if (author) {
      query.author = author._id;
    }

    if (favoriter) {
      query._id = {$in: favoriter.favorites};
    } else if (req.query.favorited) {
      query._id = {$in: []};
    }

    return Promise.all([
      Article.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      Article.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function (results) {
      const articles      = results[0];
      const articlesCount = results[1];
      const user          = results[2];

      return res.json({
        articles     : articles.map(function (article) {
          return article.toJSONFor(user);
        }),
        articlesCount: articlesCount
      });
    });
  }).catch(next);
});

router.get('/feed', authentication.required, function (req: Request, res: Response, next) {
  let limit  = 20;
  let offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = parseInt(req.query.limit as string);
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = parseInt(req.query.offset as string);
  }

  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    Promise.all([
      Article.find({author: {$in: user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
      Article.count({author: {$in: user.following}})
    ]).then(function (results) {
      const articles      = results[0];
      const articlesCount = results[1];

      return res.json({
        articles     : articles.map(function (article) {
          return article.toJSONFor(user);
        }),
        articlesCount: articlesCount
      });
    }).catch(next);
  });
});

router.post('/', authentication.required, function (req: Request, res: Response, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    const article = new Article(req.body.article);

    article.author = user;

    return article.save().then(function () {
      console.log(article.author);
      return res.json({article: article.toJSONFor(user)});
    });
  }).catch(next);
});

// return a article
router.get('/:article', authentication.optional, function (req: Request, res: Response, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate('author').execPopulate()
  ]).then(function (results) {
    const user = results[0];

    return res.json({article: req.article.toJSONFor(user)});
  }).catch(next);
});

// update article
router.put('/:article', authentication.required, function (req: Request, res: Response, next) {
  User.findById(req.payload.id).then(function (user) {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== 'undefined') {
        req.article.title = req.body.article.title;
      }

      if (typeof req.body.article.description !== 'undefined') {
        req.article.description = req.body.article.description;
      }

      if (typeof req.body.article.body !== 'undefined') {
        req.article.body = req.body.article.body;
      }

      if (typeof req.body.article.tagList !== 'undefined') {
        req.article.tagList = req.body.article.tagList
      }

      req.article.save().then(function (article) {
        return res.json({article: article.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete article
router.delete('/:article', authentication.required, function (req: Request, res: Response, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    if (req.article.author._id.toString() === req.payload.id.toString()) {
      return req.article.remove().then(function () {
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

// Favorite an article
router.post('/:article/favorite', authentication.required, function (req: Request, res: Response, next) {
  const articleId = req.article._id;

  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    return user.favorite(articleId).then(function () {
      return req.article.updateFavoriteCount().then(function (article) {
        return res.json({article: article.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// Unfavorite an article
router.delete('/:article/favorite', authentication.required, function (req: Request, res: Response, next) {
  const articleId = req.article._id;

  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    return user.unfavorite(articleId).then(function () {
      return req.article.updateFavoriteCount().then(function (article) {
        return res.json({article: article.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// return an article's comments
router.get('/:article/comments', authentication.optional, function (req: Request, res: Response, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
    return req.article.populate({
      path    : 'comments',
      populate: {
        path: 'author'
      },
      options : {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function (article) {
      return res.json({
        comments: req.article.comments.map(function (comment) {
          return comment.toJSONFor(user);
        })
      });
    });
  }).catch(next);
});

// create a new comment
router.post('/:article/comments', authentication.required, function (req: Request, res: Response, next) {
  User.findById(req.payload.id)
    // @ts-ignore
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      const comment     = new Comment(req.body.comment);
      comment.article = req.article;
      comment.author  = user;

      return comment.save().then(function () {
        req.article.comments.push(comment);

        return req.article.save().then(function (article) {
          res.json({comment: comment.toJSONFor(user)});
        });
      });
    }).catch(next);
});

router.delete('/:article/comments/:comment', authentication.required, function (req: Request, res: Response, next) {
  if (req.comment.author.toString() === req.payload.id.toString()) {
    // @ts-ignore
    req.article.comments.remove(req.comment._id);
    req.article.save()
      .then(() => Comment.find({_id: req.comment._id}).remove().exec())
      .then(function () {
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});


export const ArticlesRoutes: Router = router;
