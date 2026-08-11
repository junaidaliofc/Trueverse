/**
 * Social reputation helpers.
 * Follow / appreciate / comment never mutate trust.
 */

export type FollowRelation = {
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type ActivityComment = {
  id: string;
  activity_id: string;
  author_id: string;
  author_name: string;
  author_trueverse_id: string;
  body: string;
  created_at: string;
};

export function isFollowing(
  followingIds: string[],
  targetProfileId: string
): boolean {
  return followingIds.includes(targetProfileId);
}

export function toggleFollowList(followingIds: string[], targetProfileId: string) {
  if (followingIds.includes(targetProfileId)) {
    return followingIds.filter((id) => id !== targetProfileId);
  }
  return [...followingIds, targetProfileId];
}
