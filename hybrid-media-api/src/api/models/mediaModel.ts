import {ERROR_MESSAGES} from '../../utils/errorMessages';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {MediaItem, UserLevel, MediaItemWithOwner} from 'hybrid-types/DBTypes';
import promisePool from '../../lib/db';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {fetchData} from '../../lib/functions';

const uploadPath = process.env.UPLOAD_URL;

const BASE_MEDIA_QUERY = `
  SELECT
    m.media_id,
    m.user_id,
    m.filesize,
    m.media_type,
    m.fish_name,
    m.description,
    m.source,
    m.recipe,
    m.sustainability,
    m.created_at,

    CONCAT(vars.base_url, m.filename) AS filename,

    CASE
      WHEN m.media_type LIKE '%image%'
      THEN CONCAT(vars.base_url, m.filename, '-thumb.png')
      ELSE CONCAT(vars.base_url, m.filename, '-animation.gif')
    END AS thumbnail,

    CASE
      WHEN m.media_type NOT LIKE '%image%'
      THEN JSON_ARRAY(
        CONCAT(vars.base_url, m.filename, '-thumb-1.png'),
        CONCAT(vars.base_url, m.filename, '-thumb-2.png'),
        CONCAT(vars.base_url, m.filename, '-thumb-3.png'),
        CONCAT(vars.base_url, m.filename, '-thumb-4.png'),
        CONCAT(vars.base_url, m.filename, '-thumb-5.png')
      )
      ELSE NULL
    END AS screenshots,

    u.username

  FROM MediaItems m
  JOIN Users u ON m.user_id = u.user_id
  CROSS JOIN (SELECT ? AS base_url) AS vars
`;

const fetchAllMedia = async (
  page: number | undefined = undefined,
  limit: number | undefined = undefined,
): Promise<MediaItemWithOwner[]> => {
  const offset = ((page || 1) - 1) * (limit || 10);
  const sql = `
  ${BASE_MEDIA_QUERY}
  ORDER BY m.fish_name ASC
  ${limit ? 'LIMIT ? OFFSET ?' : ''}
`;
  const params = limit ? [uploadPath, limit, offset] : [uploadPath];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItemWithOwner[]
  >(stmt);
  return rows;
};

const fetchMediaBySearch = async (
  search: string,
): Promise<MediaItemWithOwner[]> => {
  const sql = `
    ${BASE_MEDIA_QUERY}
    WHERE m.fish_name LIKE ?
    ORDER BY
      CASE
        WHEN m.fish_name LIKE ? THEN 0
        ELSE 1
      END,
      m.fish_name ASC
  `;

  const params = [uploadPath, `${search}%`, `%${search}%`];

  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItemWithOwner[]
  >(stmt);

  return rows;
};

const fetchMediaById = async (id: number): Promise<MediaItemWithOwner> => {
  const sql = `${BASE_MEDIA_QUERY}
              WHERE media_id=?`;
  const params = [uploadPath, id];
  const stmt = promisePool.format(sql, params);
  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItemWithOwner[]
  >(stmt);
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }
  return rows[0];
};

const postMedia = async (
  media: Omit<
    MediaItem,
    'media_id' | 'created_at' | 'thumbnail' | 'screenshots'
  >,
): Promise<MediaItem> => {
  const {
    user_id,
    filename,
    filesize,
    media_type,
    fish_name,
    description,
    source,
    recipe,
    sustainability,
  } = media;

  const sql = `
    INSERT INTO MediaItems
    (user_id, filename, filesize, media_type, fish_name, description, source, recipe, sustainability)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    user_id,
    filename,
    filesize,
    media_type,
    fish_name,
    description,
    source,
    recipe,
    sustainability,
  ];

  const stmt = promisePool.format(sql, params);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_CREATED, 500);
  }

  return await fetchMediaById(result.insertId);
};

const putMedia = async (
  media: Partial<
    Pick<
      MediaItem,
      'fish_name' | 'description' | 'source' | 'recipe' | 'sustainability'
    >
  >,
  id: number,
  user_id: number,
  user_level: UserLevel['level_name'],
): Promise<MediaItem> => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(media)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_UPDATED, 400);
  }

  const sql =
    user_level === 'Admin'
      ? `UPDATE MediaItems SET ${fields.join(', ')} WHERE media_id = ?`
      : `UPDATE MediaItems SET ${fields.join(', ')} WHERE media_id = ? AND user_id = ?`;

  const params =
    user_level === 'Admin' ? [...values, id] : [...values, id, user_id];

  const stmt = promisePool.format(sql, params);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_UPDATED, 404);
  }

  return await fetchMediaById(id);
};

const checkOwnership = async (
  media_id: number,
  user_id: number,
): Promise<boolean> => {
  const sql = 'SELECT * FROM MediaItems WHERE media_id = ? AND user_id = ?';
  const params = [media_id, user_id];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<RowDataPacket[]>(stmt);
  return rows.length > 0;
};

const deleteMedia = async (
  media_id: number,
  user_id: number,
  token: string,
  level_name: UserLevel['level_name'],
): Promise<MessageResponse> => {
  const media = await fetchMediaById(media_id);

  if (!media) {
    return {message: 'Media not found'};
  }

  const isOwner = await checkOwnership(media_id, user_id);
  if (!isOwner && level_name !== 'Admin') {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_DELETED, 403);
  }

  media.filename = media?.filename.replace(
    process.env.UPLOAD_URL as string,
    '',
  );

  const connection = await promisePool.getConnection();

  await connection.beginTransaction();

  await connection.execute('DELETE FROM Likes WHERE media_id = ?;', [media_id]);

  const sql =
    level_name === 'Admin'
      ? connection.format('DELETE FROM MediaItems WHERE media_id = ?', [
          media_id,
        ])
      : connection.format(
          'DELETE FROM MediaItems WHERE media_id = ? AND user_id = ?',
          [media_id, user_id],
        );

  const [result] = await connection.execute<ResultSetHeader>(sql);

  if (result.affectedRows === 0) {
    return {message: 'Media not deleted'};
  }

  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  try {
    const deleteResult = await fetchData<MessageResponse>(
      `${process.env.UPLOAD_SERVER}/delete/${media.filename}`,
      options,
    );

    console.log('deleteResult', deleteResult);
  } catch (e) {
    console.error('deleteMedia file delete error:', (e as Error).message);
  }

  await connection.commit();

  return {
    message: 'Media item deleted',
  };
};

const fetchMediaByUserId = async (
  user_id: number,
): Promise<MediaItemWithOwner[]> => {
  const sql = `
  ${BASE_MEDIA_QUERY}
  WHERE user_id = ?
  ORDER BY m.fish_name ASC
`;
  const params = [uploadPath, user_id];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItemWithOwner[]
  >(stmt); // <-- change here
  return rows;
};

const fetchMostLikedMedia = async (): Promise<MediaItemWithOwner> => {
  // you could also use a view for this
  const sql = `${BASE_MEDIA_QUERY}
     WHERE media_id = (
       SELECT media_id FROM Likes
       GROUP BY media_id
       ORDER BY COUNT(*) DESC
       LIMIT 1
     )`;
  const params = [uploadPath];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItemWithOwner[] & {likes_count: number}
  >(stmt);

  if (!rows.length) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND_LIKED, 404);
  }
  return rows[0];
};

export {
  fetchAllMedia,
  fetchMediaBySearch,
  fetchMediaById,
  postMedia,
  deleteMedia,
  fetchMostLikedMedia,
  fetchMediaByUserId,
  putMedia,
};
