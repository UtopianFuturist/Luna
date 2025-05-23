"use client";

/**
 * Subject resolver utility for AT Protocol
 * 
 * This module provides functions to parse and normalize BlueSky handles and DIDs,
 * ensuring proper subject resolution for the OAuth flow.
 */

/**
 * Enum representing the type of subject
 */
export enum SubjectType {
  DID_METHOD_PLC = 'did_method_plc',
  DID_METHOD_WEB = 'did_method_web',
  HOSTNAME = 'hostname'
}

/**
 * Parse and normalize an input subject (handle or DID)
 * 
 * @param subject - The input subject (handle or DID)
 * @returns The normalized subject and its type
 */
export function parseSubject(subject: string): { type: SubjectType; value: string } {
  // Clean up the input
  let cleanSubject = subject.trim();
  cleanSubject = cleanSubject.replace(/^at:\/\//, '');
  cleanSubject = cleanSubject.replace(/^@/, '');

  // Check for DID types
  if (cleanSubject.startsWith('did:plc:')) {
    return {
      type: SubjectType.DID_METHOD_PLC,
      value: cleanSubject
    };
  } else if (cleanSubject.startsWith('did:web:')) {
    return {
      type: SubjectType.DID_METHOD_WEB,
      value: cleanSubject
    };
  }

  // Otherwise, treat as hostname (handle)
  return {
    type: SubjectType.HOSTNAME,
    value: cleanSubject
  };
}

/**
 * Format a subject for display
 * 
 * @param subject - The subject to format
 * @returns Formatted subject for display
 */
export function formatSubjectForDisplay(subject: string): string {
  const parsed = parseSubject(subject);
  
  if (parsed.type === SubjectType.HOSTNAME) {
    return `@${parsed.value}`;
  }
  
  return parsed.value;
}

/**
 * Check if a string is a valid BlueSky handle or DID
 * 
 * @param subject - The subject to validate
 * @returns Whether the subject is valid
 */
export function isValidSubject(subject: string): boolean {
  const parsed = parseSubject(subject);
  
  if (parsed.type === SubjectType.HOSTNAME) {
    // Basic handle validation - should contain at least one dot
    return parsed.value.includes('.') && !parsed.value.includes(' ');
  } else if (
    parsed.type === SubjectType.DID_METHOD_PLC || 
    parsed.type === SubjectType.DID_METHOD_WEB
  ) {
    // Basic DID validation
    return parsed.value.length > 10 && !parsed.value.includes(' ');
  }
  
  return false;
}
