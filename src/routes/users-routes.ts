import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';
import passport from 'passport';
import { authentication } from "../utilities/authentication";

const router: Router = Router();

/**
 * GET /api/user
 */
router.get('/user', authentication.required, (req: Request, res: Response, next: NextFunction) => {

    User
      .findById(req.payload.id)
      .then((user: IUserModel) => {
          res.status(200).json({user: user.toAuthJSON()});
        }
      )
      .catch(next);

  }
);


/**
 * PUT /api/user
 */
router.put('/user', authentication.required, (req: Request, res: Response, next: NextFunction) => {

    User
      .findById(req.payload.id)
      .then((user: IUserModel) => {

        if (!user) {
          return res.sendStatus(401);
        }

        // Update only fields that have values:
        // ISSUE: DRY out code?
        if (typeof req.body.user.email !== 'undefined') {
          user.email = req.body.user.email;
        }
        if (typeof req.body.user.username !== 'undefined') {
          user.username = req.body.user.username;
        }
        if (typeof req.body.user.password !== 'undefined') {
          user.setPassword(req.body.user.password);
        }
        if (typeof req.body.user.image !== 'undefined') {
          user.image = req.body.user.image;
        }
        if (typeof req.body.user.bio !== 'undefined') {
          user.bio = req.body.user.bio;
        }

        return user.save().then(() => {
          return res.json({user: user.toAuthJSON()});
        });
      })
      .catch(next);
  }
);


/**
 * POST /api/users
 */
router.post('/users', (req: Request, res: Response, next: NextFunction) => {

  const user: IUserModel = new User();

  user.username = req.body.user.username;
  user.email    = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.bio   = '';
  user.image = '';

  return user.save()
    .then(() => {
      return res.json({user: user.toAuthJSON()});
    })
    .catch(next);

});


// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/users/login', (req: Request, res: Response, next: NextFunction) => {

  if (!req.body.user.email) {
    return res.status(422).json({errors: {email: "Can't be blank"}});
  }

  if (!req.body.user.password) {
    return res.status(422).json({errors: {password: "Can't be blank"}});
  }

  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});

    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);

});


export const UsersRoutes: Router = router;
