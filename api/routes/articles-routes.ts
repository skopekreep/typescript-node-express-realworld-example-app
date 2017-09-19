
import { Router, NextFunction, Response } from 'express';
import { authentication } from '../utilities/authentication';
import { ProfileRequest } from '../interfaces/requests-interface';
import { Article, IArticleModel } from '../models/article-model';
import { IUserModel, User } from '../models/user-model';
// import * as Promise from 'bluebird';

const router: Router = Router();
const Promise = require('bluebird');


/**
 * GET /api/articles
 */
router.get('/', authentication.optional, (req: ProfileRequest, res: Response, next: NextFunction) => {

	// Handle all URL query parameters
	const limit: number = req.query.limit ? Number(req.query.limit) : 20;
	const offset: number = req.query.offset ? Number(req.query.offset) : 0;


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


	// Define promises
	const p1 = thisUser;

	const p2 = Article.count( {});

	const p3 = Article.find().limit(limit).skip(offset).populate('author').catch();

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


// PREVIOUS ATTEMPT:
// router.get('/', authentication.optional, (req: ProfileRequest, res: Response, next: NextFunction) => {
//
// 	let articlesCount = 0;
// 	let thisUser: IUserModel;
//
// 	// If authentication was performed was successful look up the profile relative to authenticated user
// 	if (req.payload) {
// 		User
// 			.findById(req.payload.id)
// 			.then( (user: IUserModel) => {
// 				return thisUser = req.profile.formatAsProfileJSON(user);
// 			})
// 			.catch();
//
// 		// If authentication was NOT performed or successful look up profile relative to that same user (following = false)
// 	} else {
// 		thisUser = req.profile;
// 	}
//
// 	Article
// 		.count( (err, count) => {
// 			articlesCount = count;
// 		})
// 		.find()
// 		.sort({updatedAt: 'desc'})
// 		.then( (articles: IArticleModel[]) => {
// 			res.json({articles: articles.map(article => {
// 				console.log(article);
// 				return article.formatAsArticleJSON(thisUser);
// 				}),	articlesCount
// 			});
// 		})
// 		.catch(next);
// });


// WORKING:
// interface IQuery {
// 		tagList: {$in: any[]};
// 		author: string;
// 		_id: {$in: any[]};
// 		limit: number;
// 		offset: number;
// 	}
// let query: IQuery;
// 	let limit = 20;
// 	let offset = 0;
//
// 	if (typeof req.query.limit !== 'undefined') {
// 		limit = req.query.limit;
// 	}
//
// 	if (typeof req.query.offset !== 'undefined') {
// 		offset = req.query.offset;
// 	}
//
// 	if ( typeof req.query.tag !== 'undefined' ) {
// 		query.tagList = {$in : [req.query.tag]};
// 	}
//
// 	Promise.all([
// 		req.query.author ? User.findOne({username: req.query.author}) : null,
// 		req.query.favorited ? User.findOne({username: req.query.favorited}) : null
// 	]).then(function(results){
// 		const author = results[0];
// 		const favoriter = results[1];
//
// 		if (author) {
// 			query.author = author._id;
// 		}
//
// 		if (favoriter) {
// 			query._id = {$in: favoriter.favorites};
// 		} else if (req.query.favorited) {
// 			query._id = {$in: []};
// 		}
//
// 		Promise.all([
// 			Article.find(query)
// 				.limit(Number(limit))
// 				.skip(Number(offset))
// 				.sort({createdAt: 'desc'})
// 				.populate('author')
// 				.exec(),
// 			Article.count(query).exec(),
// 			req.payload ? User.findById(req.payload.id) : null,
// 		]).then(function(results){
// 			const articles = results[0];
// 			const articlesCount = results[1];
// 			const user = results[2];
//
// 			return res.json({
// 				articles: articles.map(function(article) {
// 					return article.formatAsArticleJSON(user);
// 				}),
// 				articlesCount
// 			});
// 		});
// 	}).catch(next);


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
