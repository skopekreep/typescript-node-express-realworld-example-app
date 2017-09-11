
import { NextFunction, Request, Response, Router } from 'express';
import { IUserModel, User } from '../models/user-model';
import { authentication } from '../models/authentication';
import { ProfileRequest } from '../interfaces/requests-interface';

const router: Router = Router();


/**
 * PARAM :username
 */

router.param('username', (req: ProfileRequest, res: Response, next: NextFunction, username: string) => {

	User
		.findOne({username})
		.then( (user: IUserModel) => {
			req.profile = user;
			return next();
		})
		.catch(next);
});


/**
 * GET /api/profiles/:username
 */
router.get('/:username', authentication.optional,	(req: ProfileRequest, res: Response, next: NextFunction) => {

	// If authentication was performed and successful look up the profile relative to authenticated user
	if (req.payload) {
		User
			.findById(req.payload.id)
			.then( (user: IUserModel) => {
				 res.status(200).json({profile: req.profile.formatAsProfileJSON(user)});
			})
			.catch(next);

	// If authentication was NOT performed or successful look up profile relative to that same user (following = false)
	} else {
		// User
		// 	.findOne({username: req.params.username})
		// 	.then( (user: IUserModel) => {
		// 		res.status(200).json({profile: user.formatAsProfileJSON(user)});
		// 	})
		// 	.catch(next);
		res.status(200).json({profile: req.profile.formatAsProfileJSON(req.profile)});
	}
	// ISSUE: why have to repeat query? Why route-level variable not accessible here?
});


/**
 * POST /api/profiles/:username/follow
 */
router.post('/:username/follow', authentication.required,	(req: ProfileRequest, res: Response, next: NextFunction) => {

	const profileId = req.profile._id;

	User
		.findById(req.payload.id)
		.then((user: IUserModel) => {
			user.follow(profileId);
			return user.save().then(() => {
				return res.json({profile: req.profile.formatAsProfileJSON(user)});
			});
		})
		.catch(next);
});


/**
 * DELETE /api/profiles/:username/follow
 */
router.delete('/:username/follow', authentication.required,	(req: ProfileRequest, res: Response, next: NextFunction) => {

	const profileId = req.profile._id;

	User
		.findById(req.payload.id)
		.then((user: IUserModel) => {
			user.unfollow(profileId);
			return user.save().then(() => {
				return res.json({profile: req.profile.formatAsProfileJSON(user)});
			});
		})
		.catch(next);
});
// TODO: DELETE route working on first try


export const ProfilesRoutes: Router = router;
