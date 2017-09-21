
import { Router, NextFunction, Response } from 'express';
import { authentication } from '../utilities/authentication';
import { ProfileRequest } from '../interfaces/requests-interface';
import { Article, IArticleModel } from '../models/article-model';
import { IUserModel, User } from '../models/user-model';
import { IQuery } from '../interfaces/article-interface';
import { Schema } from 'mongoose';

const router: Router = Router();
const Promise = require('bluebird');  // FIXME: how to handle this in Typescript?


/**
 * GET /api/articles
 */
router.get('/', authentication.optional, (req: ProfileRequest, res: Response, next: NextFunction) => {

	//  Try to determine the user making the request
	let thisUser: IUserModel;

	// If authentication was performed was successful look up the profile relative to authenticated user
	if (req.payload) {
		User
			.findById(req.payload.id)
			.then( (user: IUserModel) => {
				return thisUser = req.profile.formatAsProfileJSON(user);
			})
			.catch();

		// If authentication was NOT performed or successful look up profile relative to that same user (following = false)
	} else {
		thisUser = req.profile;
	}

	// Parse URL query strings and create a query object
	const limit: number = req.query.limit ? Number(req.query.limit) : 20;
	const offset: number = req.query.offset ? Number(req.query.offset) : 0;

	const query = <IQuery> {};  // ISSUE: how to resolve?

	// Handle single tag or multiple tags in query (...&tag=git&tag=node...)
	if (typeof req.query.tag !== 'undefined') {
		if (Array.isArray(req.query.tag)) {
			query.tagList = {$in: req.query.tag};
		} else {
			query.tagList = {$in: [req.query.tag]};
		}
	}

	Promise
		.all([
			req.query.author ? User.findOne({username: req.query.author}) : 'noAuthor',
			req.query.favorited
				? User
						.find({username: req.query.favorited})
						.then(users => {
							let favoritedArticles: [Schema.Types.ObjectId];
							users.forEach((user, userIndex) => {
								user.favorites.forEach((favorite, favoriteIndex) => {
									if (userIndex === 0 && favoriteIndex === 0) {
										favoritedArticles = [favorite];
									} else {
										favoritedArticles.push(favorite);
									}
								});
							});
							return favoritedArticles;
						})
				: 'noFavorites'
		])
		.then( results => {
			const author = results[0];
			const favoritedArticleIds = results[1];

			// Return no articles for unknown author, but ignore author filter if none was provided
			if (author !== 'noAuthor') {
				query.author = author;
			}

			/* Restrict the query results to only article IDs that are
				favorited by the username(s) specified in the query string.

				Note: Choosing to interpret multiple usernames as an 'or' operation,
				meaning that articles favorited by ANY of the users will be returned,
				as opposed to an 'and' operation wherein only articles favorited by
			 	ALL usernames would be returned.
			*/
			if (favoritedArticleIds !== 'noFavorites') {
				query._id = {$in: favoritedArticleIds};
			}


			// Define promises
			const p1 = thisUser;

			const p2 = Article.count(query).exec();
			/* ISSUE: Should count be MIN(count, limit)? or should it count all results,
				even if not displayed due to limit or offset query string parameter
			*/

			const p3 =
				Article
					.find(query)
					.limit(limit)
					.skip(offset)		// FIXME: does order matter?
					.populate('author')
					.exec();

			// Resolve and use promise results
			Promise
				.all([p1, p2, p3])
				.then(results => {
					const user: IUserModel = results[0];
					const articlesCount: number = results[1];
					const articles = results[2];

					res.json(
						{articles: articles.map((article: IArticleModel) => {
							return article.formatAsArticleJSON(user);
						}),
							articlesCount});
				})
				.catch(next);
		});
});


// TODO: Remaining routes
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
