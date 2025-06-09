// src/lib/bskyService.ts
import { BskyAgent, AtpSessionData, ComAtprotoServerDefs, AppBskyFeedDefs } from '@atproto/api';
import { FeedViewPost, PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { Notification } from '@atproto/api/dist/client/types/app/bsky/notification/listNotifications';
import { ActorProfile } from '@atproto/api/dist/client/types/app/bsky/actor/defs';


const BSKY_SERVICE_URL = 'https://bsky.social';

// Re-initialize the agent with stored session data if available
export const initializeAgent = async (): Promise<BskyAgent> => {
  const agent = new BskyAgent({
    service: BSKY_SERVICE_URL,
    persistSession: (evt, session) => {
      if (session) {
        try {
          localStorage.setItem('bsky_session', JSON.stringify(session));
        } catch (error) {
          console.error("Failed to persist session to localStorage", error);
        }
      } else {
        try {
          localStorage.removeItem('bsky_session');
        } catch (error) {
          console.error("Failed to remove session from localStorage", error);
        }
      }
    },
  });

  const sessionJson = typeof window !== 'undefined' ? localStorage.getItem('bsky_session') : null;
  if (sessionJson) {
    try {
      const session = JSON.parse(sessionJson);
      await agent.resumeSession(session);
    } catch (error) {
      console.error("Failed to resume session", error);
      // If resume fails, session data is likely invalid, clear it
      if (typeof window !== 'undefined') localStorage.removeItem('bsky_session');
    }
  }
  return agent;
};


export const getAgent = (): BskyAgent => {
  // This is a simplified getter. In a real app, agent initialization and session management
  // would be more robust, likely within an AuthContext as previously established.
  // For now, it creates a new agent instance or could potentially retrieve a shared one.
  // This does NOT automatically resume session here; that's handled by initializeAgent or AuthContext.
  return new BskyAgent({ service: BSKY_SERVICE_URL });
};


// Example function to fetch a user's profile
export const getProfile = async (agent: BskyAgent, handleOrDid: string): Promise<ActorProfile> => {
  if (!agent) throw new Error("Agent not initialized");
  try {
    const { data } = await agent.getProfile({ actor: handleOrDid });
    return data as ActorProfile; // Cast needed due to BskyAgent's general type
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Example function to fetch a feed (e.g., timeline)
export const getTimeline = async (agent: BskyAgent, algorithm?: string, limit?: number, cursor?: string) => {
  if (!agent.session) throw new Error("User is not authenticated. Cannot fetch timeline.");
  try {
    const { data } = await agent.getTimeline({ algorithm, limit, cursor });
    return data;
  } catch (error) {
    console.error('Error fetching timeline:', error);
    throw error;
  }
};

// --- Functions that were previously missing ---

export const getPreferences = async (agent: BskyAgent) => {
  if (!agent.session) throw new Error("Authentication required.");
  const { data } = await agent.getPreferences();
  return data;
};

export const setPreferences = async (agent: BskyAgent, preferences: ComAtprotoServerDefs.Preferences) => {
  if (!agent.session) throw new Error("Authentication required.");
  await agent.postPreferences(preferences);
};

export const updateProfileDetails = async (agent: BskyAgent, details: { displayName?: string; description?: string; avatar?: Blob; banner?: Blob }) => {
  if (!agent.session) throw new Error("Authentication required.");
  // BskyAgent's updateProfile takes specific parameters, not a single details object.
  // This function needs to adapt the 'details' object to the agent.updateProfile call.
  // Avatar and banner need to be Blobs if provided.
  await agent.updateProfile({
    displayName: details.displayName,
    description: details.description,
    // avatar and banner handling would require them to be of type Blob or compatible
    // For simplicity, this example assumes they are passed correctly if present.
    ...(details.avatar && { avatar: details.avatar }),
    ...(details.banner && { banner: details.banner }),
  });
};


export const getAuthorFeed = async (agent: BskyAgent, actor: string, limit?: number, cursor?: string) => {
   if (!agent.session && !agent.com?.atproto?.server?.getSession) { // Check if public view is possible
    // If no session and no public view method (older agent), throw error
    // Modern agents might allow some public views without session.
    // This check is a bit of a placeholder for actual public view capability detection.
    // throw new Error("User is not authenticated or agent cannot make public views.");
   }
  try {
    const { data } = await agent.getAuthorFeed({ actor, limit, cursor });
    return data;
  } catch (error) {
    console.error(`Error fetching author feed for ${actor}:`, error);
    throw error;
  }
};

export const listNotifications = async (agent: BskyAgent, limit?: number, cursor?: string): Promise<{ notifications: Notification[], cursor?: string }> => {
  if (!agent.session) throw new Error("Authentication required.");
  const { data } = await agent.listNotifications({ limit, cursor });
  return data;
};

export const updateSeen = async (agent: BskyAgent, seenAt: string) => {
  if (!agent.session) throw new Error("Authentication required.");
  await agent.updateSeenNotifications(seenAt);
};


// --- Chat related (Conceptual - bsky.social doesn't have direct DMs via main API yet) ---
// These would require a different service endpoint or library for Bluesky DMs if/when available.
// The following are placeholders based on common patterns.

export const listConvos = async (agent: BskyAgent) => {
  console.warn("listConvos: Direct messaging is not standard in bsky.social API yet.");
  // Placeholder: return agent.api.chat.bsky.convs.listConvos();
  return { convos: [] };
};

export const getConvo = async (agent: BskyAgent, convoId: string) => {
  console.warn("getConvo: Direct messaging is not standard in bsky.social API yet.");
  // Placeholder: return agent.api.chat.bsky.convs.getConvo({ convoId });
  return { convo: null };
};

export const getMessages = async (agent: BskyAgent, convoId: string, limit?: number, cursor?: string) => {
  console.warn("getMessages: Direct messaging is not standard in bsky.social API yet.");
  // Placeholder: return agent.api.chat.bsky.convs.getMessages({ convoId, limit, cursor });
  return { messages: [] };
};

export const sendMessage = async (agent: BskyAgent, convoId: string, message: { text: string }) => {
  console.warn("sendMessage: Direct messaging is not standard in bsky.social API yet.");
  // Placeholder: return agent.api.chat.bsky.convs.sendMessage({ convoId, message });
  return { success: false, message: "DM API not available" };
};

// --- Feed specific (if different from getTimeline) ---
export const getFeed = async (agent: BskyAgent, feedUri: string, limit?: number, cursor?: string): Promise<{ feed: FeedViewPost[], cursor?: string }> => {
  if (!agent.session) throw new Error("Authentication required.");
  const { data } = await agent.getFeed({ feed: feedUri, limit, cursor });
  return data;
};

// --- Post specific ---
export const getPostThread = async (agent: BskyAgent, uri: string, depth?: number): Promise<{ thread: PostView }> => {
  const { data } = await agent.getPostThread({ uri, depth });
  return data;
};

export const postRecord = async (agent: BskyAgent, record: any) => {
  if (!agent.session) throw new Error("Authentication required.");
  return await agent.post(record); // `post` is a versatile method
};

export const likeRecord = async (agent: BskyAgent, uri: string, cid: string) => {
  if (!agent.session) throw new Error("Authentication required.");
  return await agent.like(uri, cid);
};

export const repostRecord = async (agent: BskyAgent, uri: string, cid: string) => {
  if (!agent.session) throw new Error("Authentication required.");
  return await agent.repost(uri, cid);
};

export const getFeedGenerators = async (
  agent: BskyAgent,
  feeds: string[] // Array of feed URIs
): Promise<{ feeds: AppBskyFeedDefs.GeneratorView[] }> => { // Explicit return type for clarity
  if (!agent.session) {
    // Or handle public queries if the API supports and it's intended.
    // For fetching user-specific pinned feeds, session is likely required.
    throw new Error("Authentication required to get feed generators.");
  }
  try {
    const { data } = await agent.app.bsky.feed.getFeedGenerators({ feeds });
    return data;
  } catch (error) {
    console.error('Error fetching feed generators:', error);
    // Re-throw or handle as appropriate for your app's error strategy
    throw error;
  }
};
