import {MessageResponse} from 'hybrid-types/MessageTypes';
import request from 'supertest';
import {Application} from 'express';
import {Rating} from 'hybrid-types/DBTypes';

const postRating = (
  url: string | Application,
  mediaId: number,
  token: string,
  rating: number,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/api/v1/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .send({rating_value: rating, media_id: mediaId})
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).toBe('Rating added');
          resolve(message);
        }
      });
  });
};

const getRatings = (
  url: string | Application,
  mediaId: number,
): Promise<Rating[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/ratings/bymedia/${mediaId}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const result = response.body;
          expect(Array.isArray(result)).toBe(true);
          result.forEach((rating: Rating) => {
            expect(rating.rating_id).toBeGreaterThan(0);
            expect(rating.media_id).toBe(mediaId);
            expect(rating.user_id).toBeGreaterThan(0);
            expect(rating.rating_value).toBeGreaterThanOrEqual(1);
            expect(rating.rating_value).toBeLessThanOrEqual(5);
            expect(rating.created_at).not.toBe('');
          });
          resolve(result);
        }
      });
  });
};

const deleteRating = (
  url: string | Application,
  mediaId: number,
  token: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/ratings/${mediaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).toBe('Rating deleted');
          resolve(message);
        }
      });
  });
};

const getNotFoundRating = (
  url: string | Application,
  mediaId: number,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get(`/api/v1/ratings/${mediaId}`)
      .expect(404, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).not.toBe('');
          resolve(message);
        }
      });
  });
};

const postInvalidRating = (
  url: string | Application,
  mediaId: number,
  token: string,
  invalidRating: number,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post(`/api/v1/ratings/${mediaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({rating_value: invalidRating}) // Rating outside valid range (1-5)
      .expect(400, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).not.toBe('');
          resolve(message);
        }
      });
  });
};

const deleteInvalidRating = (
  url: string | Application,
  mediaId: string,
  token: string,
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete(`/api/v1/ratings/${mediaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const message: MessageResponse = response.body;
          expect(message.message).not.toBe('');
          resolve(message);
        }
      });
  });
};

export {
  postRating,
  getRatings,
  deleteRating,
  getNotFoundRating,
  postInvalidRating,
  deleteInvalidRating,
};
