
import * as mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
	tags: [String]
});

export const Tag = mongoose.model('Tag', tagSchema );
