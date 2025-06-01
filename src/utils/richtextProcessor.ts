import { AppBskyRichtextFacet } from '@atproto/api';
import React from 'react'; // Needed for React.Fragment, not for Link in this file

export interface ProcessedRichTextSegment {
  type: 'text' | 'link' | 'mention' | 'tag'; // Added 'tag' for hashtags
  content: string;
  href?: string; // For links and mentions
  tag?: string; // For hashtags
}

export const processFacets = (
  text: string,
  facets?: AppBskyRichtextFacet.Main[]
): ProcessedRichTextSegment[] => {
  if (!facets || facets.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const segments: ProcessedRichTextSegment[] = [];
  let lastByteEnd = 0;

  // Ensure TextEncoder and TextDecoder are available (they are standard in modern browsers and Node.js)
  // If targeting older environments, polyfills might be needed, but for Next.js/React, this should be fine.
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const textBytes = textEncoder.encode(text); // Encode the full text once

  // Sort facets by byteStart to process them in order
  const sortedFacets = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);

  for (const facet of sortedFacets) {
    const byteStart = Math.max(0, facet.index.byteStart); // Ensure byteStart is not negative
    const byteEnd = Math.min(textBytes.length, facet.index.byteEnd); // Ensure byteEnd does not exceed text length

    if (byteStart > byteEnd) { // Skip invalid facets where start is after end
        console.warn("Skipping invalid facet where byteStart > byteEnd", facet);
        continue;
    }

    // Add text segment before the facet
    if (byteStart > lastByteEnd) {
      segments.push({
        type: 'text',
        content: textDecoder.decode(textBytes.slice(lastByteEnd, byteStart)),
      });
    }

    const facetTextBytes = textBytes.slice(byteStart, byteEnd);
    const facetText = textDecoder.decode(facetTextBytes);

    let featureProcessed = false;
    if (facet.features && facet.features.length > 0) {
        const feature = facet.features[0]; // Process the first feature primarily
        if (AppBskyRichtextFacet.isLink(feature)) {
          segments.push({
            type: 'link',
            content: facetText,
            href: feature.uri,
          });
          featureProcessed = true;
        } else if (AppBskyRichtextFacet.isMention(feature)) {
          segments.push({
            type: 'mention',
            content: facetText, // facetText should be like "@handle.bsky.social"
            href: `/profile/${feature.did}`,
          });
          featureProcessed = true;
        } else if (AppBskyRichtextFacet.isTag(feature)) {
            segments.push({
                type: 'tag',
                content: facetText, // facetText should be like "#tag"
                tag: feature.tag,
            });
            featureProcessed = true;
        }
    }

    if (!featureProcessed) {
        // Fallback for unknown facet types or facets with no features, just add as text
        segments.push({ type: 'text', content: facetText });
    }

    lastByteEnd = byteEnd;
  }

  // Add any remaining text after the last facet
  if (lastByteEnd < textBytes.length) {
    segments.push({
      type: 'text',
      content: textDecoder.decode(textBytes.slice(lastByteEnd)),
    });
  }
  return segments;
};
