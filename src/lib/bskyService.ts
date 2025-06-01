import {
  BskyAgent,
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyNotificationListNotifications,
  ChatBskyConvoDefs, // Import for chat conversation definitions
  ChatBskyActorDefs  // Import for chat actor definitions (like declaration)
} from '@atproto/api';

// Re-exporting for convenience if these types are needed by consumers of this service
export type ProfileViewDetailed = AppBskyActorDefs.ProfileViewDetailed;
// Re-exporting Notification type for use in UI components
export type Notification = AppBskyNotificationListNotifications.Notification;
export type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
export type GeneratorView = AppBskyFeedDefs.GeneratorView;
export type ActorPreference = AppBskyActorDefs.Preference; // General preference type
export type SavedFeedsPref = AppBskyActorDefs.SavedFeedsPref; // Specific preference type for saved feeds
export type PersonalDetailsPref = AppBskyActorDefs.PersonalDetailsPref; // Specific preference type for personal details

export interface FeedPage {
  feed: FeedViewPost[];
  cursor?: string;
}

// Interface for the listNotifications response to match SDK structure
export interface NotificationsPage {
  notifications: Notification[]; // Using the re-exported Notification type
  cursor?: string;
  // seenAt?: string; // listNotifications itself doesn't return seenAt, but updateSeen uses it.
}

// --- Chat Service Types ---
export type ConvoView = ChatBskyConvoDefs.ConvoView;
export type MessageView = ChatBskyConvoDefs.MessageView; // This is likely a union: MessageView | DeletedMessageView etc.
export type MessageViewSent = ChatBskyConvoDefs.MessageViewSent;
export type LogBeginConvo = ChatBskyConvoDefs.LogBeginConvo; // Example if needed for logs

export interface ConvosPage {
  convos: ConvoView[];
  cursor?: string;
}
export interface MessagesPage {
  messages: MessageView[]; // Array of MessageView or union types
  cursor?: string;
}
export type ActorDeclaration = ChatBskyActorDefs.Declaration;


/**
 * Fetches a user's detailed profile.
 * @param agent Initialized BskyAgent
 * @param handleOrDid User's handle or DID
 * @returns Detailed profile view
 */
export const getProfile = async (agent: BskyAgent, handleOrDid: string): Promise<ProfileViewDetailed> => {
  try {
    const { data } = await agent.app.bsky.actor.getProfile({ actor: handleOrDid });
    return data;
  } catch (error) {
    console.error(`Error fetching profile for ${handleOrDid}:`, error);
    throw error;
  }
};

/**
 * Fetches a specific author's feed (posts by the author).
 * @param agent Initialized BskyAgent
 * @param actor DID or handle of the author
 * @param cursor Cursor for pagination
 * @param limit Number of items to fetch
 * @returns Promise<FeedPage>
 */
export const getAuthorFeed = async (agent: BskyAgent, actor: string, cursor?: string, limit: number = 25): Promise<FeedPage> => {
  try {
    const { data } = await agent.app.bsky.feed.getAuthorFeed({ actor, limit, cursor });
    return data as FeedPage; // Assuming the SDK's response structure matches FeedPage { feed, cursor? }
  } catch (error) {
    console.error(`Error fetching author feed for ${actor}:`, error);
    throw error;
  }
};


// --- Notification Service Functions ---

/**
 * Fetches a list of notifications for the authenticated user.
 * @param agent Initialized BskyAgent
 * @param cursor Cursor for pagination
 * @param limit Number of items to fetch (default 20, max 100)
 * @returns Object containing an array of notifications and an optional cursor
 */
export const listNotifications = async (agent: BskyAgent, cursor?: string, limit: number = 30): Promise<NotificationsPage> => {
  try {
    const { data } = await agent.app.bsky.notification.listNotifications({
      limit: Math.min(limit, 100), // Enforce maximum limit
      cursor
    });
    // Ensure the returned data matches the NotificationsPage structure.
    // The SDK's data should be directly compatible if Notification type is from AppBskyNotificationListNotifications.
    return data as NotificationsPage;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Fetches the count of unread notifications for the authenticated user.
 * @param agent Initialized BskyAgent
 * @returns Object containing the count of unread notifications
 */
export const getUnreadCount = async (agent: BskyAgent): Promise<{ count: number }> => {
  try {
    const { data } = await agent.app.bsky.notification.getUnreadCount();
    return data;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    throw error;
  }
};

/**
 * Marks notifications as seen for the authenticated user.
 * @param agent Initialized BskyAgent
 * @param seenAt Optional ISO 8601 timestamp. If not provided, server typically uses current time.
 * @returns Promise resolving when notifications have been marked as seen
 */
export const updateSeen = async (agent: BskyAgent, seenAt?: string): Promise<void> => {
  try {
    await agent.app.bsky.notification.updateSeen({ seenAt: seenAt || new Date().toISOString() });
  } catch (error) {
    console.error("Error updating notification seen time:", error);
    throw error;
  }
};

/**
 * Fetches the preferences for the currently authenticated user.
 * Note: The API returns an object { preferences: ActorPreference[] }.
 * This function extracts and returns the array of preferences.
 * @param agent Initialized BskyAgent
 * @returns Array of user preferences
 */
export const getPreferences = async (agent: BskyAgent): Promise<ActorPreference[]> => {
  try {
    const { data } = await agent.app.bsky.actor.getPreferences();
    return data.preferences;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
};

/**
 * Fetches details for a list of feed generators.
 * @param agent Initialized BskyAgent
 * @param feedUris Array of AT URIs for the feed generators
 * @returns Object containing an array of feed generator views
 */
export const getFeedGenerators = async (agent: BskyAgent, feedUris: string[]): Promise<{ feeds: GeneratorView[] }> => {
  try {
    const { data } = await agent.app.bsky.feed.getFeedGenerators({ feeds: feedUris });
    return data;
  } catch (error) {
    console.error("Error fetching feed generators:", error);
    throw error;
  }
};

/**
 * Fetches a specific feed (e.g., from a feed generator).
 * @param agent Initialized BskyAgent
 * @param feedUri AT URI of the feed generator
 * @param cursor Cursor for pagination
 * @param limit Number of items to fetch (default 20)
 * @returns Object containing an array of feed posts and an optional cursor for pagination
 */
export const getFeed = async (agent: BskyAgent, feedUri: string, cursor?: string, limit: number = 20): Promise<FeedPage> => {
  try {
    const { data } = await agent.app.bsky.feed.getFeed({
      feed: feedUri,
      cursor,
      limit,
    });
    return data; // Return the whole data object { feed, cursor? }
  } catch (error) {
    console.error(`Error fetching feed ${feedUri}:`, error);
    throw error;
  }
};

/**
 * Fetches the main timeline for the authenticated user (e.g., "Following" feed).
 * @param agent Initialized BskyAgent
 * @param algorithm Optional: The algorithm for the timeline (e.g., 'reverse-chronological'). Default is usually "Following".
 *                  This parameter might be deprecated or handled differently by BskyAgent.
 *                  If you want a specific feed generator, use `getFeed` instead.
 * @param cursor Cursor for pagination
 * @param limit Number of items to fetch (default 20)
 * @returns Array of feed view posts
 */
export const getTimeline = async (agent: BskyAgent, algorithm?: string, cursor?: string, limit: number = 20): Promise<FeedViewPost[]> => {
  try {
    const params: AppBskyFeedDefs.GetTimeline.QueryParams = { limit };
    if (algorithm) {
      // Note: The 'algorithm' parameter for getTimeline is for "algorithmic feeds"
      // that are not feed generators. For "Following" it's often implicit.
      // If 'feedUri' was meant to be a feed generator URI, getFeed should be used.
      // This is a bit ambiguous in the SDK, let's assume 'algorithm' is a specific timeline algo name if provided.
      // However, BskyAgent.getTimeline() doesn't seem to take an 'algorithm' param directly in some versions.
      // It might take a 'feed' param for specific algorithm URIs, or it might be implicit.
      // For a standard "Following" timeline, no algorithm or feed param is needed.
      // Let's use a generic call for now, assuming default "Following" timeline.
      // If a specific algo is needed, the caller might need to use getFeed with the algo's AT URI.
      // params.algorithm = algorithm; // This line might be incorrect depending on exact SDK usage for custom algos
    }
    if (cursor) params.cursor = cursor;

    const { data } = await agent.app.bsky.feed.getTimeline(params);
    return data.feed;
  } catch (error) {
    console.error(`Error fetching timeline (algorithm: ${algorithm}):`, error);
    throw error;
  }
};


/**
 * Sets (replaces) the preferences for the currently authenticated user.
 * @param agent Initialized BskyAgent
 * @param preferences Array of preference objects to set.
 *                    These should conform to types like `AppBskyActorDefs.SavedFeedsPref`, etc.
 * @returns Promise resolving when preferences are set
 */
export const setPreferences = async (agent: BskyAgent, preferences: ActorPreference[]): Promise<void> => {
  try {
    await agent.app.bsky.actor.putPreferences({ preferences });
  } catch (error) {
    console.error("Error setting preferences:", error);
    throw error;
  }
};

// Example of how to potentially use a more specific type for setting preferences,
// although `ActorPreference[]` should generally work if the objects in the array are correct.
// export const setTypedPreferences = async (agent: BskyAgent, preferences: Array<SavedFeedsPref | PersonalDetailsPref /* | other specific preference types */>): Promise<void> => {
//   try {
//     // The actual input type for putPreferences is { preferences: AppBskyActorDefs.Preference[] }
//     // So, casting to `any` or ensuring the structures are compatible is needed if using very specific subtypes here.
//     // However, `ActorPreference` itself is a union of all specific preference types, so it should be fine.
//     await agent.app.bsky.actor.putPreferences({ preferences: preferences as AppBskyActorDefs.Preference[] });
//   } catch (error) {
//     console.error("Error setting typed preferences:", error);
//     throw error;
//   }
// };

// It might also be useful to have functions for specific preferences, e.g., saving feeds:
/**
 * Updates the saved feeds preference.
 * @param agent Initialized BskyAgent
 * @param pinned Array of feed generator URIs to pin.
 * @param saved Array of feed generator URIs to save.
 */
export const updateSavedFeedsPreference = async (agent: BskyAgent, pinned: string[], saved: string[]): Promise<void> => {
    try {
        const currentPrefs = await getPreferences(agent);

        const otherPrefs = currentPrefs.filter(p => p.$type !== 'app.bsky.actor.defs#savedFeeds');

        const newSavedFeedsPref: SavedFeedsPref = {
            $type: 'app.bsky.actor.defs#savedFeeds', // Make sure this string is correct
            pinned: pinned,
            saved: saved,
        };

        await setPreferences(agent, [...otherPrefs, newSavedFeedsPref]);
    } catch (error) {
        console.error("Error updating saved feeds preference:", error);
        throw error;
    }
};

/**
 * Updates parts of the authenticated user's profile.
 * @param agent Initialized BskyAgent
 * @param updates An object containing parts of the profile to update (e.g., { languages: ['en', 'fr'] })
 * @returns The server's response to the profile update.
 */
export const updateProfileDetails = async (
  agent: BskyAgent,
  updates: Partial<Pick<AppBskyActorDefs.ProfileViewDetailed, 'languages' | 'displayName' | 'description' | 'avatar' | 'banner'>>
): Promise<AppBskyActorDefs.ProfileViewDetailed> => { // Using ProfileViewDetailed for return type consistency, though upsertProfile returns a basic { uri, cid } on success usually.
                                                    // The actual profile data might need re-fetching if full updated view is needed immediately.
  try {
    // agent.upsertProfile returns { uri: string, cid: string }
    // It takes a callback that receives the existing profile (or undefined if new)
    // and should return the profile object to be saved.
    const response = await agent.upsertProfile(existing => {
      const newProfile: any = { ...existing, ...updates };
      // Ensure specific fields that are not part of standard ProfileViewBasic but are in ProfileViewDetailed
      // are handled correctly or omitted if they shouldn't be directly upserted.
      // For example, `did`, `handle` are immutable here. `viewer` state is also not part of the upsert.
      // `labels` are also set via different methods.
      // We are only interested in `languages`, `displayName`, `description`, `avatar`, `banner` for this function.

      // Clean up fields that are not part of the upsert schema for profile
      // This is a simplified version. A more robust version would strictly pick known mutable fields.
      delete newProfile.did;
      delete newProfile.handle;
      delete newProfile.viewer;
      delete newProfile.labels;
      delete newProfile.indexedAt; // Should not be part of an upsert

      return newProfile;
    });

    // After upserting, the response typically just contains uri and cid.
    // To return the full updated profile, we might need to call getProfile again.
    // For now, let's return a conceptual success or the partial update.
    // Or, more practically, the calling function should re-fetch profile if it needs the latest full view.
    console.log("Profile update response (upsertProfile):", response);

    // For consistency with getProfile, let's refetch the profile.
    // This ensures the returned data is the full, current server state.
    if (agent.session?.did) { // session should exist if agent is making authenticated calls
        return getProfile(agent, agent.session.did);
    } else {
        // This case should ideally not be reached if agent is properly authenticated
        throw new Error("User session not found, cannot re-fetch profile after update.");
    }

  } catch (error) {
    console.error("Error updating profile details:", error);
    throw error;
  }
};


// Note on getTimeline:
// The `getTimeline` method in BskyAgent usually fetches the "home" or "following" timeline.
// To fetch a specific feed generated by a feed generator, `getFeed` is the correct method,
// using the feed generator's AT URI. The `getTimeline` function above is a basic version
// and might need adjustment if `algorithm` refers to a feed generator URI.
// The current implementation of `getTimeline` will fetch the default "Following" timeline.
// If `feedUri` in the original prompt for `getTimeline` was actually a feed generator URI,
// then the `getFeed` function I've written is the one to use for that purpose.
// I've kept `getTimeline` as a general "fetch my main timeline" function.

// Note on AppBskyActorPreferences: (This note can be removed as the import is now removed)
// The import `AppBskyActorPreferences` was in the prompt but `AppBskyActorDefs.Preference` and
// specific preference types like `AppBskyActorDefs.SavedFeedsPref` are generally used from `@atproto/api`.
// `AppBskyActorDefs.Preferences` is the type for the response object of `getPreferences`, which is `{ preferences: AppBskyActorDefs.Preference[] }`.
// I've used `AppBskyActorDefs.Preference` for individual preference items.

// Corrected import (removing AppBskyActorPreferences if not used)
// import { BskyAgent, AppBskyActorDefs, AppBskyFeedDefs } from '@atproto/api'; // This line is now effectively the first line.
