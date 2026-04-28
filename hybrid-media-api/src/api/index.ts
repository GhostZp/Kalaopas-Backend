import express, {Request, Response} from 'express';

import mediaRoute from './routes/mediaRoute';
import likeRoute from './routes/likeRoute';
import {MessageResponse} from 'hybrid-types/MessageTypes';

const router = express.Router();

router.get('/', (req: Request, res: Response<MessageResponse>) => {
  res.json({
    message: 'media api v1',
  });
});

router.use('/media', mediaRoute);
router.use('/likes', likeRoute);

export default router;
