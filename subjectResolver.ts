export enum SubjectType {
  Handle = 'handle',
  Did = 'did',
  Unknown = 'unknown'
}

/**
 * Parses a BlueSky subject (handle or DID) and returns its type and normalized form
 */
export const parseSubject = (subject: string): { type: SubjectType; value: string } => {
  // Clean up the input
  const cleaned = subject.trim().toLowerCase();
  
  // Check if it's a DID
  if (cleaned.startsWith('did:plc:')) {
    return {
      type: SubjectType.Did,
      value: cleaned
    };
  }
  
  // Check if it's a handle with @ prefix
  if (cleaned.startsWith('@')) {
    return {
      type: SubjectType.Handle,
      value: cleaned.substring(1) // Remove the @ prefix
    };
  }
  
  // Check if it looks like a handle (contains a dot)
  if (cleaned.includes('.')) {
    return {
      type: SubjectType.Handle,
      value: cleaned
    };
  }
  
  // If we can't determine, assume it's a handle without domain
  return {
    type: SubjectType.Handle,
    value: cleaned
  };
};

/**
 * Validates if a subject is in a valid format for BlueSky
 */
export const isValidSubject = (subject: string): boolean => {
  const { type, value } = parseSubject(subject);
  
  if (type === SubjectType.Did) {
    // DIDs should start with did:plc: and have additional characters
    return value.startsWith('did:plc:') && value.length > 8;
  }
  
  if (type === SubjectType.Handle) {
    // Handles should either contain a dot (domain) or be at least 3 characters
    return value.includes('.') || value.length >= 3;
  }
  
  return false;
};

/**
 * Formats a subject for display, adding @ prefix to handles if needed
 */
export const formatSubjectForDisplay = (subject: string): string => {
  const { type, value } = parseSubject(subject);
  
  if (type === SubjectType.Handle && !value.startsWith('@')) {
    return `@${value}`;
  }
  
  return value;
};

