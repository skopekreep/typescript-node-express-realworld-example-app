
import { Router } from 'express';
import { Tag } from '../models/tag-model';

const router: Router = Router();

router.get('/', getTags);

function getTags(req, res) {

	const projection = {tags: 1, _id: 0};

	Tag
		.find({}, projection)
		.exec((err: any, results) => {

			if (err) {
				console.log('Error finding tags');
				res.status(500).json(err);
			} else {
				console.log('Found ' + results.length + ' result(s)');
				res.status(200).json(results[0]);
			}
		});
}

export const TagRoutes: Router = router;
