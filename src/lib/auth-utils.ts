import { User } from 'firebase/auth';
import { AppUser, Role } from '@/lib/types';

/**
 * A utility function that returns the user's role.
 * @param fbUser The Firebase User object, which may be null.
 * @param appUser The application-specific user profile, which may be null.
 * @returns The user's role, or null if the user is not authenticated.
 */
export function getRole(fbUser: User | null, appUser: AppUser | null): Role | null {
  if (!fbUser || !appUser) {
    return null;
  }
  return appUser.role;
}
