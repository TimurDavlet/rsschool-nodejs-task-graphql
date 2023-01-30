import * as DataLoader from 'dataloader';
import DB from '../utils/DB/DB';
import { MemberTypeEntity } from '../utils/DB/entities/DBMemberTypes';
import { PostEntity } from '../utils/DB/entities/DBPosts';
import { ProfileEntity } from '../utils/DB/entities/DBProfiles';
import { UserEntity } from '../utils/DB/entities/DBUsers';
import { ErrorMessages } from '../utils/response';

export class DataLoaders {
    users: DataLoader<any, UserEntity>;
    posts: DataLoader<any, PostEntity>;
    profiles: DataLoader<any, ProfileEntity>;
    memberTypes: DataLoader<any, MemberTypeEntity>;
  
    constructor(db: DB) {
      this.users = new DataLoader(async (keys) => {
        const results = await db.users.findMany({
            key: 'id',
            equalsAnyOf: keys as string[]
        });

        return keys.map(key =>
          results.find((item) => item.id == key)
          || new Error(`${ErrorMessages.USER_ERROR} [${key}]`)
        );
      });

      this.posts = new DataLoader(async (keys) => {
        const results = await db.posts.findMany({
            key: 'id',
            equalsAnyOf: keys as any[]
        });

        return keys.map(key =>
          results.find((item) => item.id == key)
          || new Error(`${ErrorMessages.POST_ERROR} [${key}]`)
        );
      });

      this.profiles = new DataLoader(async (keys) => {
        const results = await db.profiles.findMany({
            key: 'id',
            equalsAnyOf: keys as any[]
        });
        
        return keys.map(key =>
          results.find((item) => item.id == key)
          || new Error(`${ErrorMessages.PROFILE_ERROR} [${key}]`)
        );
      });

      this.memberTypes = new DataLoader(async (keys) => {
        const results = await db.memberTypes.findMany({
            key: 'id',
            equalsAnyOf: keys as any[]
        });

        return keys.map(key =>
          results.find((item) => item.id == key)
          || new Error(`${ErrorMessages.MEMBER_TYPE_ERROR} [${key}]`)
        );
      });
    }
  
    public clearCache() {
      this.users.clearAll();
      this.posts.clearAll();
      this.profiles.clearAll();
      this.memberTypes.clearAll();
    }
  }