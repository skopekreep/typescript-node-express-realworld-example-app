
import { IUserModel, User } from '../models/user-model';
import { authentication } from '../models/authentication';
import { NextFunction,  Response, Router } from 'express';
import { JWTRequest } from '../interfaces/requests-interface';

const router: Router = Router();


/**
 * GET /api/user
 */
router.get('/', authentication.required, (req: JWTRequest, res: Response, next: NextFunction) => {

		User
			.findById(req.payload.id)
			.then((user: IUserModel) => {
					res.status(200).json({user: user.formatAsUserJSON()});
				}
			)
			.catch(next);

	}
);


/**
 * PUT /api/user
 */
router.put('/', authentication.required, (req: JWTRequest, res: Response, next: NextFunction) => {

		User
			.findById(req.payload.id)
			.then((user: IUserModel) => {

				if (!user) {
					return res.sendStatus(401);
				}

				// Update only fields that have values:
				// ISSUE: DRY out code?
				if (typeof req.body.user.email !== 'undefined' ) {
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

				return user.save().then( () => {
					return res.json({user: user.formatAsUserJSON()});
				});
			})
			.catch(next);
	}

);


export const UserRoutes: Router = router;
