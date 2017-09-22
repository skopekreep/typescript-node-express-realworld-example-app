
import { Router, Response, NextFunction, Request } from 'express';
import { IUserModel, User } from '../models/user-model';
import * as passport from 'passport';

const router: Router = Router();


/**
 * POST /api/users
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {

	const user: IUserModel = new User();

	user.username = req.body.user.username;
	user.email = req.body.user.email;
	user.setPassword(req.body.user.password);
	user.bio = '';
	user.image = '';

	return user.save()
		.then( () => {
			return res.json({user: user.formatAsUserJSON()});
		})
		.catch(next);

});


// ISSUE: How does this work with the trailing (req, res, next)?
/**
 * POST /api/users/login
 */
router.post('/login', (req: Request, res: Response, next: NextFunction) => {

	if (!req.body.user.email)  {
		return res.status(422).json( {errors: {email: "Can't be blank"}} );
	}

	if (!req.body.user.password)  {
		return res.status(422).json( {errors: {password: "Can't be blank"}} );
	}

	passport.authenticate('local', {session: false}, (err, user, info) => {
		if (err) { return next(err); }

		if (user) {
			user.token = user.generateJWT();
			return res.json({user: user.formatAsUserJSON()});

		} else {
			return res.status(422).json(info);
		}
	})(req, res, next);

});


export const UsersRoutes: Router = router;
