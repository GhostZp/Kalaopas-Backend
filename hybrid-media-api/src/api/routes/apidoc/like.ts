/**
 * @api {get} /likes Get All Likes
 * @apiName GetAllLikes
 * @apiGroup Like
 *
 * @apiSuccess {Object[]} likes Array of like objects
 * @apiSuccess {Number} likes.like_id Like's unique ID
 * @apiSuccess {Number} likes.media_id ID of the liked media
 * @apiSuccess {Number} likes.user_id ID of the user who liked
 * @apiSuccess {String} likes.created_at Timestamp when the like was created
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "like_id": 1,
 *         "media_id": 1,
 *         "user_id": 1,
 *         "created_at": "2024-01-26T09:38:08.000Z"
 *       }
 *     ]
 *
 * @apiError LikesNotFound No likes found
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "No likes found"
 *     }
 */

/**
 * @api {post} /likes Like Media
 * @apiName PostLike
 * @apiGroup Like
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} media_id ID of the media to like (min: 1)
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Like added"
 *     }
 *
 * @apiError ValidationError Invalid input parameters
 * @apiError AlreadyLiked User has already liked this media
 * @apiError Unauthorized Authentication required
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Like already exists"
 *     }
 */

/**
 * @api {get} /likes/bymedia/:media_id Get Likes by Media ID
 * @apiName GetLikesByMediaId
 * @apiGroup Like
 *
 * @apiParam {Number} media_id Media's ID (min: 1)
 *
 * @apiSuccess {Object[]} likes Array of like objects
 * @apiSuccess {Number} likes.like_id Like's unique ID
 * @apiSuccess {Number} likes.media_id ID of the liked media
 * @apiSuccess {Number} likes.user_id ID of the user who liked
 * @apiSuccess {String} likes.created_at Timestamp when the like was created
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "like_id": 1,
 *         "media_id": 1,
 *         "user_id": 1,
 *         "created_at": "2024-01-26T09:38:08.000Z"
 *       }
 *     ]
 *
 * @apiError LikesNotFound No likes found for this media
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "No likes found"
 *     }
 */

/**
 * @api {get} /likes/bymedia/user/:media_id Check User Like
 * @apiName CheckUserLike
 * @apiGroup Like
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} media_id Media's ID (min: 1)
 *
 * @apiSuccess {Number} like_id Like's unique ID
 * @apiSuccess {Number} media_id ID of the liked media
 * @apiSuccess {Number} user_id ID of the user who liked
 * @apiSuccess {String} created_at Timestamp when the like was created
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "like_id": 1,
 *       "media_id": 1,
 *       "user_id": 1,
 *       "created_at": "2024-01-26T09:38:08.000Z"
 *     }
 *
 * @apiError NotLiked User hasn't liked this media
 * @apiError Unauthorized Authentication required
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Like not found"
 *     }
 */

/**
 * @api {get} /likes/byuser/:id Get Liked Media by User ID or Token
 * @apiName GetLikedMediaByUserIdOrToken
 * @apiGroup Like
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} [id] Optional User's ID (min: 1). If not provided, user ID from the authentication token will be used
 *
 * @apiSuccess {Object[]} media Array of media objects liked by the user
 * @apiSuccess {Number} media.media_id Media item's unique ID
 * @apiSuccess {Number} media.user_id ID of the user who uploaded the media
 * @apiSuccess {Number} media.filesize Size of the media file
 * @apiSuccess {String} media.media_type MIME type of the media
 * @apiSuccess {String} media.fish_name Name of the fish
 * @apiSuccess {String} media.description Description of the media item
 * @apiSuccess {String} media.source Source of the recipe or media
 * @apiSuccess {String} media.recipe Recipe text
 * @apiSuccess {String} media.sustainability Sustainability rating
 * @apiSuccess {String} media.created_at Timestamp when the media item was created
 * @apiSuccess {String} media.filename Absolute URL of the media file
 * @apiSuccess {String} media.thumbnail Absolute URL of the media thumbnail
 * @apiSuccess {String[]} media.screenshots Array of screenshot URLs for non-image media
 * @apiSuccess {String} media.username Username of the media owner
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "media_id": 1,
 *         "user_id": 1,
 *         "filesize": 123456,
 *         "media_type": "image/png",
 *         "fish_name": "Salmon",
 *         "description": "Delicious salmon",
 *         "source": "Family recipe",
 *         "recipe": "Bake at 180C",
 *         "sustainability": "green",
 *         "created_at": "2024-01-26T09:38:08.000Z",
 *         "filename": "https://example.com/uploads/media.png",
 *         "thumbnail": "https://example.com/uploads/media-thumb.png",
 *         "screenshots": null,
 *         "username": "user1"
 *       }
 *     ]
 *
 * @apiError LikesNotFound No liked media found for this user
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "No likes found"
 *     }
 */

/**
 * @api {get} /likes/count/:id Get Like Count by Media ID
 * @apiName GetLikeCountByMediaId
 * @apiGroup Like
 *
 * @apiParam {Number} id Media's ID (min: 1)
 *
 * @apiSuccess {Number} count Number of likes for the media
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "count": 5
 *     }
 *
 * @apiError MediaNotFound Media not found
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "No likes found"
 *     }
 */

/**
 * @api {delete} /likes/:id Delete Like
 * @apiName DeleteLike
 * @apiGroup Like
 *
 * @apiHeader {String} Authorization Bearer token for authentication
 *
 * @apiParam {Number} id Like's ID (min: 1)
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Like deleted"
 *     }
 *
 * @apiError LikeNotFound Like not found
 * @apiError Unauthorized Not authorized to delete this like
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Like not deleted"
 *     }
 */
