// src/lib/subjectResolver.ts

export enum SubjectType {
  DID = 'did',
  HANDLE = 'handle',
  UNKNOWN = 'unknown',
}

export interface ResolvedSubject {
  type: SubjectType;
  value: string;
}

/**
 * Parses a string to determine if it's a DID or a handle.
 * @param subject The string to parse.
 * @returns ResolvedSubject object with type and value.
 */
export const parseSubject = (subject: string): ResolvedSubject => {
  if (typeof subject !== 'string' || !subject.trim()) {
    return { type: SubjectType.UNKNOWN, value: subject };
  }

  const trimmedSubject = subject.trim();

  // Basic DID check (starts with 'did:')
  if (trimmedSubject.startsWith('did:')) {
    // Further validation could be added here (e.g., specific DID methods like 'plc', 'web')
    // For example: /^did:(plc:[a-zA-Z0-9._-]+|web:[a-zA-Z0-9.:%_-]+)$/
    if (/^did:(plc|web):[a-zA-Z0-9._%:-]+$/.test(trimmedSubject)) {
      return { type: SubjectType.DID, value: trimmedSubject };
    } else {
      // It starts with 'did:' but doesn't match known simple patterns
      return { type: SubjectType.UNKNOWN, value: trimmedSubject };
    }
  }

  // Basic Handle check (contains at least one dot, no 'did:', no slashes, etc.)
  // A common handle pattern is something.something or user.bsky.social
  // This is a simplified check. Robust handle validation is complex.
  // Allowed characters: a-zA-Z0-9.-_
  if (
    trimmedSubject.includes('.') &&
    !trimmedSubject.startsWith('@') && // Usually, handles are not prefixed with @ in the identifier itself
    /^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(trimmedSubject) &&
    trimmedSubject.length <= 253 // Max domain length
  ) {
    return { type: SubjectType.HANDLE, value: trimmedSubject };
  }

  return { type: SubjectType.UNKNOWN, value: trimmedSubject };
};

/**
 * Checks if a subject string is a valid DID or Handle.
 * @param subject The string to check.
 * @returns True if valid, false otherwise.
 */
export const isValidSubject = (subject: string): boolean => {
  const { type } = parseSubject(subject);
  return type !== SubjectType.UNKNOWN;
};


/**
 * Formats a subject (DID or Handle) for display.
 * Currently, it just returns the value, but could be extended (e.g., shorten DIDs).
 * @param subject The ResolvedSubject object or a string.
 * @returns Formatted string for display.
 */
export const formatSubjectForDisplay = (subject: ResolvedSubject | string): string => {
  if (typeof subject === 'string') {
    const parsed = parseSubject(subject);
    if (parsed.type === SubjectType.DID) {
      // Example: Shorten DID: did:plc:short...end
      // return `${parsed.value.substring(0, 10)}...${parsed.value.substring(parsed.value.length - 4)}`;
      return parsed.value; // Keep full DID for now
    }
    return parsed.value;
  }

  if (subject.type === SubjectType.DID) {
    // return `${subject.value.substring(0, 10)}...${subject.value.substring(subject.value.length - 4)}`;
    return subject.value; // Keep full DID for now
  }
  return subject.value;
};
