
import { Router } from 'express';
import { TagRoutes } from './tag-routes';
import { UserRoutes } from './user-routes';
import { UsersRoutes } from './users-routes';
import { ProfilesRoutes } from './profiles-routes';
import { ArticlesRoutes } from './articles-routes';


const router: Router = Router();


router.use('/tags', TagRoutes);
router.use('/user', UserRoutes);
router.use('/users', UsersRoutes);
router.use('/profiles', ProfilesRoutes);
router.use('/articles', ArticlesRoutes);


export const MainRouter: Router = router;
