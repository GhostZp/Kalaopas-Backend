import express from 'express';
import {
  mediaListGet,
  mediaGet,
  mediaPost,
  mediaPut,
  mediaDelete,
  mediaByUserGet,
  mediaListMostLikedGet,
} from '../controllers/mediaController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param, query} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(
    query('page').optional().isInt({min: 1}).toInt(),
    query('limit').optional().isInt({min: 1}).toInt(),
    validationErrors,
    mediaListGet,
  )
  .post(
    authenticate,

    body('fish_name')
      .trim()
      .notEmpty()
      .isString()
      .isLength({min: 3, max: 255})
      .escape(),

    body('description').optional().trim().isString().escape(),

    body('filename')
      .trim()
      .notEmpty()
      .isString()
      .matches(/^[\w.-]+$/)
      .escape(),

    body('media_type').trim().notEmpty().isMimeType(),

    body('filesize').notEmpty().isInt({min: 1}).toInt(),

    body('source').trim().notEmpty().isString().isLength({max: 255}).escape(),

    body('recipe')
      .optional({nullable: true})
      .trim()
      .isString()
      .isLength({max: 255})
      .escape(),

    body('sustainability').notEmpty().isIn(['green', 'yellow', 'red']),

    validationErrors,
    mediaPost,
  );

router.route('/mostliked').get(mediaListMostLikedGet);

router
  .route('/byuser/:id')
  .get(param('id').isInt({min: 1}).toInt(), validationErrors, mediaByUserGet);

router.route('/bytoken').get(authenticate, mediaByUserGet);

router
  .route('/:id')
  .get(param('id').isInt({min: 1}).toInt(), validationErrors, mediaGet)
  .put(
    authenticate,
    param('id').isInt({min: 1}).toInt(),

    body('fish_name')
      .optional()
      .trim()
      .isString()
      .isLength({min: 3, max: 255})
      .escape(),

    body('description').optional().trim().isString().escape(),

    // allow updating new fields too
    body('source').optional().trim().isString().isLength({max: 255}).escape(),

    body('recipe').optional().trim().isString().isLength({max: 255}).escape(),

    body('sustainability').optional().isIn(['green', 'yellow', 'red']),

    validationErrors,
    mediaPut,
  )
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    mediaDelete,
  );

export default router;
