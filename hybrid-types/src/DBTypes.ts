type UserLevel = {
  level_id: number;
  level_name: 'Admin' | 'User' | 'Guest';
};

type User = {
  user_id: number;
  username: string;
  password: string;
  email: string;
  user_level_id: number;
  created_at: Date | string;
};

type MediaItem = {
  media_id: number;
  user_id: number;
  filename: string;
  filesize: number;
  media_type: string;
  fish_name: string;
  description?: string;
  source: string;
  recipe: string | null;
  sustainability: 'green' | 'yellow' | 'red';
  thumbnail: string;
  screenshots: string[] | null;
  created_at: string;
}

type Like = {
  like_id: number;
  media_id: number;
  user_id: number;
  created_at: Date;
};

type UploadResult = {
  message: string;
  data?: {
    image: string;
  };
};

type MostLikedMedia = Pick<
  MediaItem,
  | 'media_id'
  | 'filename'
  | 'filesize'
  | 'media_type'
  | 'fish_name'
  | 'description'
  | 'created_at'
> &
  Pick<User, 'user_id' | 'username' | 'email' | 'created_at'> & {
    likes_count: bigint;
  };

// type gymnastics to get rid of user_level_id from User type and replace it with level_name from UserLevel type
type UserWithLevel = Omit<User, 'user_level_id'> &
  Pick<UserLevel, 'level_name'>;

type UserWithNoPassword = Omit<UserWithLevel, 'password'>;

type TokenContent = Pick<User, 'user_id'> & Pick<UserLevel, 'level_name'>;

type MediaItemWithOwner = MediaItem & Pick<User, 'username'>;

// for upload server
type FileInfo = {
  filename: string;
  user_id: number;
};

export type {
  UserLevel,
  User,
  MediaItem,
  Like,
  UploadResult,
  MostLikedMedia,
  UserWithLevel,
  UserWithNoPassword,
  TokenContent,
  MediaItemWithOwner,
  FileInfo,
};
