import {
  BskyAgent,
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyNotificationListNotifications,
  AppBskyFeedGetPostThread,
  AppBskyGraphDefs,
  AppBskyActorSearchActors,
  ChatBskyConvoDefs,
  ChatBskyActorDefs,
  ComAtprotoRepoStrongRef,
  AppBskyFeedPost,
  AppBskyEmbedRecord,
  AppBskyEmbedImages,
  AppBskyEmbedExternal,
  AppBskyEmbedRecordWithMedia,
  RichText
} from '@atproto/api';

// Re-exporting types for convenience
export type ProfileViewDetailed = AppBskyActorDefs.ProfileViewDetailed;
export type ProfileViewBasic = AppBskyActorDefs.ProfileViewBasic;
export type Notification = AppBskyNotificationListNotifications.Notification;
export type FeedViewPost = AppBskyFeedDefs.FeedViewPost;
export type GeneratorView = AppBskyFeedDefs.GeneratorView;
export type ActorPreference = AppBskyActorDefs.Preference;
export type SavedFeedsPref = AppBskyActorDefs.SavedFeedsPref;
export type PersonalDetailsPref = AppBskyActorDefs.PersonalDetailsPref;
export type ThreadViewPost = AppBskyFeedDefs.ThreadViewPost;
export type PostView = AppBskyFeedDefs.PostView;

// Chat types
export type ConvoView = ChatBskyConvoDefs.ConvoView;
export type MessageView = ChatBskyConvoDefs.MessageView;
export type MessageViewSent = ChatBskyConvoDefs.MessageViewSent;
export type LogBeginConvo = ChatBskyConvoDefs.LogBeginConvo;
export type ActorDeclaration = ChatBskyActorDefs.Declaration;

// Interface definitions
export interface FeedPage {
  feed: FeedViewPost[];
  cursor?: string;
}

export interface NotificationsPage {
  notifications: Notification[];
  cursor?: string;
}

export interface ConvosPage {
  convos: ConvoView[];
  cursor?: string;
}

export interface MessagesPage {
  messages: MessageView[];
  cursor?: string;
}

export interface FollowsPage {
  follows: AppBskyGraphDefs.Follow[];
  cursor?: string;
}

export interface FollowersPage {
  followers: ProfileViewBasic[];
  cursor?: string;
}

export interface SearchResults {
  actors: ProfileViewBasic[];
  cursor?: string;
}

export interface PostThreadResponse {
  thread: ThreadViewPost;
}

// Agent management
export const getAgent = (): BskyAgent => {
  return new BskyAgent({
    service: 'https://bsky.social',
  });
};

// Profile functions
export const getProfile = async (agent: BskyAgent, handleOrDid: string): Promise<ProfileViewDetailed> => {
  try {
    const { data } = await agent.app.bsky.actor.getProfile({ actor: handleOrDid });
    return data;
  } catch (error) {
    console.error(`Error fetching profile for ${handleOrDid}:`, error);
    throw error;
  }
};

export const getProfiles = async (agent: BskyAgent, actors: string[]): Promise<ProfileViewDetailed[]> => {
  try {
    const { data } = await agent.app.bsky.actor.getProfiles({ actors });
    return data.profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

export const searchProfiles = async (agent: BskyAgent, query: string, cursor?: string, limit: number = 25): Promise<SearchResults> => {
  try {
    const { data } = await agent.app.bsky.actor.searchActors({
      term: query,
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      actors: data.actors,
      cursor: data.cursor
    };
  } catch (error) {
    console.error(`Error searching profiles for "${query}":`, error);
    throw error;
  }
};

// Feed functions
export const getTimeline = async (agent: BskyAgent, cursor?: string, limit: number = 20): Promise<FeedPage> => {
  try {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;

    const { data } = await agent.app.bsky.feed.getTimeline(params);
    return {
      feed: data.feed,
      cursor: data.cursor
    };
  } catch (error) {
    console.error('Error fetching timeline:', error);
    throw error;
  }
};

export const getAuthorFeed = async (agent: BskyAgent, actor: string, cursor?: string, limit: number = 25): Promise<FeedPage> => {
  try {
    const { data } = await agent.app.bsky.feed.getAuthorFeed({ 
      actor, 
      limit: Math.min(limit, 100), 
      cursor 
    });
    return {
      feed: data.feed,
      cursor: data.cursor
    };
  } catch (error) {
    console.error(`Error fetching author feed for ${actor}:`, error);
    throw error;
  }
};

export const getFeed = async (agent: BskyAgent, feedUri: string, cursor?: string, limit: number = 20): Promise<FeedPage> => {
  try {
    const { data } = await agent.app.bsky.feed.getFeed({
      feed: feedUri,
      cursor,
      limit: Math.min(limit, 100),
    });
    return {
      feed: data.feed,
      cursor: data.cursor
    };
  } catch (error) {
    console.error(`Error fetching feed ${feedUri}:`, error);
    throw error;
  }
};

export const getFeedGenerators = async (agent: BskyAgent, feedUris: string[]): Promise<{ feeds: GeneratorView[] }> => {
  try {
    const { data } = await agent.app.bsky.feed.getFeedGenerators({ feeds: feedUris });
    return data;
  } catch (error) {
    console.error("Error fetching feed generators:", error);
    throw error;
  }
};

export const getPostThread = async (agent: BskyAgent, uri: string, depth?: number): Promise<PostThreadResponse> => {
  try {
    const { data } = await agent.app.bsky.feed.getPostThread({
      uri,
      depth: depth || 6
    });
    return {
      thread: data.thread as ThreadViewPost
    };
  } catch (error) {
    console.error(`Error fetching post thread for ${uri}:`, error);
    throw error;
  }
};

// Post functions
export const createPost = async (
  agent: BskyAgent, 
  text: string, 
  options?: {
    reply?: { root: ComAtprotoRepoStrongRef.Main; parent: ComAtprotoRepoStrongRef.Main };
    images?: Blob[];
    external?: { uri: string; title: string; description: string };
    quote?: ComAtprotoRepoStrongRef.Main;
  }
): Promise<{ uri: string; cid: string }> => {
  try {
    const rt = new RichText({ text });
    await rt.detectFacets(agent);

    const record: AppBskyFeedPost.Record = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    // Handle reply
    if (options?.reply) {
      record.reply = options.reply;
    }

    // Handle images
    if (options?.images && options.images.length > 0) {
      const uploadedImages = [];
      for (const image of options.images) {
        const { data } = await agent.uploadBlob(image, { encoding: 'image/jpeg' });
        uploadedImages.push({
          alt: '',
          image: data.blob,
        });
      }
      record.embed = {
        $type: 'app.bsky.embed.images',
        images: uploadedImages,
      } as AppBskyEmbedImages.Main;
    }

    // Handle external link
    if (options?.external) {
      record.embed = {
        $type: 'app.bsky.embed.external',
        external: options.external,
      } as AppBskyEmbedExternal.Main;
    }

    // Handle quote post
    if (options?.quote) {
      if (record.embed) {
        // If we already have an embed (images or external), wrap it with the quote
        record.embed = {
          $type: 'app.bsky.embed.recordWithMedia',
          record: {
            $type: 'app.bsky.embed.record',
            record: options.quote,
          },
          media: record.embed,
        } as AppBskyEmbedRecordWithMedia.Main;
      } else {
        record.embed = {
          $type: 'app.bsky.embed.record',
          record: options.quote,
        } as AppBskyEmbedRecord.Main;
      }
    }

    const { data } = await agent.post(record);
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const deletePost = async (agent: BskyAgent, uri: string): Promise<void> => {
  try {
    await agent.deletePost(uri);
  } catch (error) {
    console.error(`Error deleting post ${uri}:`, error);
    throw error;
  }
};

export const likePost = async (agent: BskyAgent, uri: string, cid: string): Promise<{ uri: string; cid: string }> => {
  try {
    const { data } = await agent.like(uri, cid);
    return data;
  } catch (error) {
    console.error(`Error liking post ${uri}:`, error);
    throw error;
  }
};

export const unlikePost = async (agent: BskyAgent, likeUri: string): Promise<void> => {
  try {
    await agent.deleteLike(likeUri);
  } catch (error) {
    console.error(`Error unliking post ${likeUri}:`, error);
    throw error;
  }
};

export const repost = async (agent: BskyAgent, uri: string, cid: string): Promise<{ uri: string; cid: string }> => {
  try {
    const { data } = await agent.repost(uri, cid);
    return data;
  } catch (error) {
    console.error(`Error reposting ${uri}:`, error);
    throw error;
  }
};

export const unrepost = async (agent: BskyAgent, repostUri: string): Promise<void> => {
  try {
    await agent.deleteRepost(repostUri);
  } catch (error) {
    console.error(`Error unreposting ${repostUri}:`, error);
    throw error;
  }
};

// Follow functions
export const followUser = async (agent: BskyAgent, did: string): Promise<{ uri: string; cid: string }> => {
  try {
    const { data } = await agent.follow(did);
    return data;
  } catch (error) {
    console.error(`Error following user ${did}:`, error);
    throw error;
  }
};

export const unfollowUser = async (agent: BskyAgent, followUri: string): Promise<void> => {
  try {
    await agent.deleteFollow(followUri);
  } catch (error) {
    console.error(`Error unfollowing user ${followUri}:`, error);
    throw error;
  }
};

export const getFollows = async (agent: BskyAgent, actor: string, cursor?: string, limit: number = 50): Promise<FollowsPage> => {
  try {
    const { data } = await agent.app.bsky.graph.getFollows({
      actor,
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      follows: data.follows,
      cursor: data.cursor
    };
  } catch (error) {
    console.error(`Error fetching follows for ${actor}:`, error);
    throw error;
  }
};

export const getFollowers = async (agent: BskyAgent, actor: string, cursor?: string, limit: number = 50): Promise<FollowersPage> => {
  try {
    const { data } = await agent.app.bsky.graph.getFollowers({
      actor,
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      followers: data.followers,
      cursor: data.cursor
    };
  } catch (error) {
    console.error(`Error fetching followers for ${actor}:`, error);
    throw error;
  }
};

// Mute functions
export const mute = async (agent: BskyAgent, did: string): Promise<void> => {
  try {
    await agent.mute(did);
  } catch (error) {
    console.error(`Error muting user ${did}:`, error);
    throw error;
  }
};

export const unmute = async (agent: BskyAgent, did: string): Promise<void> => {
  try {
    await agent.unmute(did);
  } catch (error) {
    console.error(`Error unmuting user ${did}:`, error);
    throw error;
  }
};

export const getMutes = async (agent: BskyAgent, cursor?: string, limit: number = 50): Promise<{ mutes: ProfileViewBasic[]; cursor?: string }> => {
  try {
    const { data } = await agent.app.bsky.graph.getMutes({
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      mutes: data.mutes,
      cursor: data.cursor
    };
  } catch (error) {
    console.error('Error fetching mutes:', error);
    throw error;
  }
};

// Block functions
export const blockUser = async (agent: BskyAgent, did: string): Promise<{ uri: string; cid: string }> => {
  try {
    const { data } = await agent.app.bsky.graph.block.create(
      { repo: agent.session?.did! },
      { subject: did, createdAt: new Date().toISOString() }
    );
    return data;
  } catch (error) {
    console.error(`Error blocking user ${did}:`, error);
    throw error;
  }
};

export const unblockUser = async (agent: BskyAgent, blockUri: string): Promise<void> => {
  try {
    const uri = new URL(blockUri);
    const rkey = uri.pathname.split('/').pop()!;
    await agent.app.bsky.graph.block.delete({
      repo: agent.session?.did!,
      rkey
    });
  } catch (error) {
    console.error(`Error unblocking user ${blockUri}:`, error);
    throw error;
  }
};

export const getBlocks = async (agent: BskyAgent, cursor?: string, limit: number = 50): Promise<{ blocks: ProfileViewBasic[]; cursor?: string }> => {
  try {
    const { data } = await agent.app.bsky.graph.getBlocks({
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      blocks: data.blocks,
      cursor: data.cursor
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
};

// Notification functions
export const listNotifications = async (agent: BskyAgent, cursor?: string, limit: number = 30): Promise<NotificationsPage> => {
  try {
    const { data } = await agent.app.bsky.notification.listNotifications({
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      notifications: data.notifications,
      cursor: data.cursor
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getUnreadCount = async (agent: BskyAgent): Promise<{ count: number }> => {
  try {
    const { data } = await agent.app.bsky.notification.getUnreadCount();
    return data;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    throw error;
  }
};

export const markAsRead = async (agent: BskyAgent, seenAt?: string): Promise<void> => {
  try {
    await agent.app.bsky.notification.updateSeen({ 
      seenAt: seenAt || new Date().toISOString() 
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

export const updateSeen = markAsRead; // Alias for backward compatibility

// Preferences functions
export const getPreferences = async (agent: BskyAgent): Promise<ActorPreference[]> => {
  try {
    const { data } = await agent.app.bsky.actor.getPreferences();
    return data.preferences;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
};

export const setPreferences = async (agent: BskyAgent, preferences: ActorPreference[]): Promise<void> => {
  try {
    await agent.app.bsky.actor.putPreferences({ preferences });
  } catch (error) {
    console.error("Error setting preferences:", error);
    throw error;
  }
};

export const updateSavedFeedsPreference = async (agent: BskyAgent, pinned: string[], saved: string[]): Promise<void> => {
  try {
    const currentPrefs = await getPreferences(agent);
    const otherPrefs = currentPrefs.filter(p => p.$type !== 'app.bsky.actor.defs#savedFeeds');

    const newSavedFeedsPref: SavedFeedsPref = {
      $type: 'app.bsky.actor.defs#savedFeeds',
      pinned: pinned,
      saved: saved,
    };

    await setPreferences(agent, [...otherPrefs, newSavedFeedsPref]);
  } catch (error) {
    console.error("Error updating saved feeds preference:", error);
    throw error;
  }
};

// Chat functions
export const listConvos = async (agent: BskyAgent, cursor?: string, limit: number = 30): Promise<ConvosPage> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.listConvos({
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      convos: data.convos,
      cursor: data.cursor
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getConvo = async (agent: BskyAgent, convoId: string): Promise<ConvoView> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.getConvo({
      convoId
    });
    return data.convo;
  } catch (error) {
    console.error(`Error fetching conversation ${convoId}:`, error);
    throw error;
  }
};

export const getMessages = async (agent: BskyAgent, convoId: string, cursor?: string, limit: number = 30): Promise<MessagesPage> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.getMessages({
      convoId,
      limit: Math.min(limit, 100),
      cursor
    });
    return {
      messages: data.messages,
      cursor: data.cursor
    };
  } catch (error) {
    console.error(`Error fetching messages for conversation ${convoId}:`, error);
    throw error;
  }
};

export const sendMessage = async (agent: BskyAgent, convoId: string, text: string): Promise<MessageViewSent> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.sendMessage({
      convoId,
      message: {
        text,
        $type: 'chat.bsky.convo.defs#messageInput'
      }
    });
    return data;
  } catch (error) {
    console.error(`Error sending message to conversation ${convoId}:`, error);
    throw error;
  }
};

export const createConvo = async (agent: BskyAgent, members: string[]): Promise<ConvoView> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.createConvo({
      members
    });
    return data.convo;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const leaveConvo = async (agent: BskyAgent, convoId: string): Promise<void> => {
  try {
    await agent.api.chat.bsky.convo.leaveConvo({
      convoId
    });
  } catch (error) {
    console.error(`Error leaving conversation ${convoId}:`, error);
    throw error;
  }
};

export const muteConvo = async (agent: BskyAgent, convoId: string): Promise<ConvoView> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.muteConvo({
      convoId
    });
    return data.convo;
  } catch (error) {
    console.error(`Error muting conversation ${convoId}:`, error);
    throw error;
  }
};

export const unmuteConvo = async (agent: BskyAgent, convoId: string): Promise<ConvoView> => {
  try {
    const { data } = await agent.api.chat.bsky.convo.unmuteConvo({
      convoId
    });
    return data.convo;
  } catch (error) {
    console.error(`Error unmuting conversation ${convoId}:`, error);
    throw error;
  }
};

// Profile update functions
export const updateProfile = async (
  agent: BskyAgent,
  updates: Partial<{
    displayName?: string;
    description?: string;
    avatar?: Blob;
    banner?: Blob;
  }>
): Promise<{ uri: string; cid: string }> => {
  try {
    const response = await agent.upsertProfile(async (existing) => {
      const newProfile: any = { ...existing };

      if (updates.displayName !== undefined) {
        newProfile.displayName = updates.displayName;
      }

      if (updates.description !== undefined) {
        newProfile.description = updates.description;
      }

      if (updates.avatar) {
        const { data } = await agent.uploadBlob(updates.avatar, { encoding: 'image/jpeg' });
        newProfile.avatar = data.blob;
      }

      if (updates.banner) {
        const { data } = await agent.uploadBlob(updates.banner, { encoding: 'image/jpeg' });
        newProfile.banner = data.blob;
      }

      return newProfile;
    });
    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// List management functions
export const createList = async (
  agent: BskyAgent,
  name: string,
  purpose: 'app.bsky.graph.defs#modlist' | 'app.bsky.graph.defs#curatelist',
  description?: string
): Promise<{ uri: string; cid: string }> => {
  try {
    const { data } = await agent.app.bsky.graph.list.create(
      { repo: agent.session?.did! },
      {
        name,
        purpose,
        description: description || '',
        createdAt: new Date().toISOString(),
      }
    );
    return data;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

export const addToList = async (agent: BskyAgent, listUri: string, subjectDid: string): Promise<{ uri: string; cid: string }> => {
  try {
    const { data } = await agent.app.bsky.graph.listitem.create(
      { repo: agent.session?.did! },
      {
        subject: subjectDid,
        list: listUri,
        createdAt: new Date().toISOString(),
      }
    );
    return data;
  } catch (error) {
    console.error(`Error adding ${subjectDid} to list ${listUri}:`, error);
    throw error;
  }
};

export const removeFromList = async (agent: BskyAgent, listItemUri: string): Promise<void> => {
  try {
    const uri = new URL(listItemUri);
    const rkey = uri.pathname.split('/').pop()!;
    await agent.app.bsky.graph.listitem.delete({
      repo: agent.session?.did!,
      rkey
    });
  } catch (error) {
    console.error(`Error removing from list ${listItemUri}:`, error);
    throw error;
  }
};

// Report functions
export const reportPost = async (
  agent: BskyAgent,
  postUri: string,
  postCid: string,
  reasonType: string,
  reason?: string
): Promise<void> => {
  try {
    await agent.app.bsky.moderation.createReport({
      reasonType,
      reason: reason || '',
      subject: {
        $type: 'com.atproto.repo.strongRef',
        uri: postUri,
        cid: postCid,
      },
    });
  } catch (error) {
    console.error(`Error reporting post ${postUri}:`, error);
    throw error;
  }
};

export const reportProfile = async (
  agent: BskyAgent,
  did: string,
  reasonType: string,
  reason?: string
): Promise<void> => {
  try {
    await agent.app.bsky.moderation.createReport({
      reasonType,
      reason: reason || '',
      subject: {
        $type: 'com.atproto.admin.defs#repoRef',
        did,
      },
    });
  } catch (error) {
    console.error(`Error reporting profile ${did}:`, error);
    throw error;
  }
};

// Upload functions
export const uploadImage = async (agent: BskyAgent, image: Blob): Promise<{ blob: any }> => {
  try {
    const { data } = await agent.uploadBlob(image, { encoding: 'image/jpeg' });
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Session management
export const refreshSession = async (agent: BskyAgent): Promise<void> => {
  try {
    await agent.resumeSession(agent.session!);
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
};

