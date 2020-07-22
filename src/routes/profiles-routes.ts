import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';
import { authentication } from '../utilities/authentication';

const router: Router = Router();


/**
 * PARAM :username
 */

router.param('username', (req: Request, res: Response, next: NextFunction, username: string) => {

  User
    .findOne({username})
    .then((user: IUserModel) => {
      req.profile = user;
      return next();
    })
    .catch(next);
});


/**
 * GET /api/profiles/:username
 */
router.get('/:username', authentication.optional, (req: Request, res: Response, next: NextFunction) => {

  // If authentication was performed and was successful look up the profile relative to authenticated user
  if (req.payload) {
    User
      .findById(req.payload.id)
      .then((user: IUserModel) => {
        res.status(200).json({profile: req.profile.toProfileJSONFor(user)});
      })
      .catch(next);

    // If authentication was NOT performed or successful look up profile relative to that same user (following = false)
  } else {
    res.status(200).json({profile: req.profile.toProfileJSONFor(req.profile)});
  }

});


/**
 * POST /api/profiles/:username/follow
 */
router.post('/:username/follow', authentication.required, (req: Request, res: Response, next: NextFunction) => {

  const profileId = req.profile._id;

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      return user.follow(profileId).then(() => {
        return res.json({profile: req.profile.toProfileJSONFor(user)});
      });
    })
    .catch(next);
});


/**
 * DELETE /api/profiles/:username/follow
 */
router.delete('/:username/follow', authentication.required, (req: Request, res: Response, next: NextFunction) => {

  const profileId = req.profile._id;

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      return user.unfollow(profileId).then(() => {
        return res.json({profile: req.profile.toProfileJSONFor(user)});
      });
    })
    .catch(next);
});


export const ProfilesRoutes: Router = router;
