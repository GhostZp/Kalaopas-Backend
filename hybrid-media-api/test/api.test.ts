import dotenv from 'dotenv';
dotenv.config();
import {Like, MediaItem, User, UserWithNoPassword} from 'hybrid-types/DBTypes';
import {
  uploadMediaFile,
  getMediaItems,
  getMediaItem,
  postMediaItem,
  putMediaItem,
  getMediaItemsWithPagination,
  getMostLikedMedia,
  getMediaByUser,
  getMediaByToken,
  getMediaByTag,
  deleteMediaItem,
} from './testMediaItem';
import randomstring from 'randomstring';
import {UploadResponse} from 'hybrid-types/MessageTypes';
import {loginUser, registerUser, deleteUser} from './testUser';
import app from '../src/app';
// const app = 'http://localhost:3000';
import {postTag, getTags, deleteTag} from './testTag';
import {
  postLike,
  getLikes,
  deleteLike,
  getLikesByUser,
  getLikedMediaByUser,
} from './testLike';
import {postComment, getComments, deleteComment} from './testComment';
import {postRating, getRatings, deleteRating} from './testRating';

if (!process.env.AUTH_SERVER || !process.env.UPLOAD_SERVER) {
  throw new Error('Missing environment variables for API tests');
}
const authApi = process.env.AUTH_SERVER;
const uploadApi = process.env.UPLOAD_SERVER;

describe('Media API Success Cases', () => {
  // test create user
  let token: string;
  let user: UserWithNoPassword;
  const testUser: Partial<User> = {
    username: 'Test_User_' + randomstring.generate(7),
    email: randomstring.generate(9).toLowerCase() + '@user.fi',
    password: 'asdfQEWR1234',
  };
  it('should create a new user', async () => {
    await registerUser(authApi, '/users', testUser);
  });

  // test login
  it('should return a user object and bearer token on valid credentials', async () => {
    const response = await loginUser(authApi, '/auth/login', {
      username: testUser.username!,
      password: testUser.password!,
    });
    token = response.token;
    user = response.user;
  });

  // test upload media file
  let uploadResponse: UploadResponse;
  it('should upload a media file', async () => {
    const mediaFile = './test/testfiles/testPic.jpeg';
    uploadResponse = await uploadMediaFile(
      uploadApi,
      '/upload',
      mediaFile,
      token,
    );
  });

  // post media item
  let testMediaItem: MediaItem;
  it('should post a media item', async () => {
    if (uploadResponse.data) {
      const mediaItem: Partial<MediaItem> = {
        fish_name: 'Test Pic',
        description: 'A test picture',
        filename: uploadResponse.data.filename,
        media_type: uploadResponse.data.media_type,
        filesize: uploadResponse.data.filesize,
      };

      testMediaItem = await postMediaItem(
        app,
        '/api/v1/media',
        token,
        mediaItem,
      );
    }
  });

  // test succesful media routes
  it('Should get array of media items', async () => {
    await getMediaItems(app);
  });

  it('Should get media item by id', async () => {
    const mediaItem = await getMediaItem(app, testMediaItem.media_id);
    expect(mediaItem.media_id).toBe(testMediaItem.media_id);
  });

  it('Should get media items with pagination', async () => {
    const mediaItems = await getMediaItemsWithPagination(app, 1, 5);
    expect(mediaItems.length).toBeLessThanOrEqual(5);
  });

  it('Should get most liked media', async () => {
    const mediaItem = await getMostLikedMedia(app);
    expect(mediaItem.media_id).toBeGreaterThan(0);
  });

  it('Should get media by user', async () => {
    const mediaItems = await getMediaByUser(app, user.user_id);
    mediaItems.forEach((item) => {
      expect(item.user_id).toBe(user.user_id);
    });
  });

  it('Should get media by token', async () => {
    const mediaItems = await getMediaByToken(app, token);
    expect(Array.isArray(mediaItems)).toBe(true);
  });

  // test update operations
  it('Should update media item', async () => {
    const updatedItem = {
      fish_name: 'Updated Test Fish Name',
      description: 'Updated test description',
      filename: testMediaItem.filename,
      media_type: testMediaItem.media_type,
      filesize: testMediaItem.filesize,
      user_id: testMediaItem.user_id,
    };
    await putMediaItem(app, testMediaItem.media_id, token, updatedItem);
  });

  // test tag operations
  it('Should add a tag to media item', async () => {
    await postTag(app, testMediaItem.media_id, token, 'test-tag');
  });

  it('Should get media items by tag', async () => {
    const mediaItems = await getMediaByTag(app, 'test-tag');
    expect(Array.isArray(mediaItems)).toBe(true);
  });

  it('Should get tags by media id', async () => {
    const tags = await getTags(app, testMediaItem.media_id);
    expect(Array.isArray(tags)).toBe(true);
  });

  // test like operations
  it('Should add a like to media item', async () => {
    await postLike(app, testMediaItem.media_id, token);
  });

  it('Should get likes count by media id', async () => {
    await getLikes(app, testMediaItem.media_id);
  });

  let like: Like;
  it('Should get likes by user id', async () => {
    like = await getLikesByUser(app, testMediaItem.media_id, token);
  });

  it('Should get liked media items by token', async () => {
    const mediaItems = await getLikedMediaByUser(app, token);
    expect(mediaItems.length).toBeGreaterThan(0);
    expect(mediaItems[0].media_id).toBe(testMediaItem.media_id);
  });

  // test comment operations
  it('Should add a comment to media item', async () => {
    await postComment(app, testMediaItem.media_id, token, 'Test comment');
  });

  it('Should get comments by media id', async () => {
    const comments = await getComments(app, testMediaItem.media_id);
    expect(Array.isArray(comments)).toBe(true);
  });

  // test rating operations
  it('Should add a rating to media item', async () => {
    await postRating(app, testMediaItem.media_id, token, 4);
  });

  it('Should get ratings for media item', async () => {
    await getRatings(app, testMediaItem.media_id);
  });

  // test delete operations (moved to end)
  it('Should delete a rating', async () => {
    await deleteRating(app, testMediaItem.media_id, token);
  });

  it('Should delete a comment', async () => {
    const comments = await getComments(app, testMediaItem.media_id);
    await deleteComment(app, comments[0].comment_id, token);
  });

  it('Should delete a like', async () => {
    await deleteLike(app, like.like_id, token);
  });

  it('Should delete a tag from media item', async () => {
    await deleteTag(app, testMediaItem.media_id, 'test-tag', token);
  });

  it('Should delete media item', async () => {
    await deleteMediaItem(app, testMediaItem.media_id, token);
  });

  it('Should delete user', async () => {
    await deleteUser(authApi, token);
  });
});
