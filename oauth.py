"""
AT Protocol OAuth Client Implementation

This module implements a full OAuth 2.0 client specifically adapted for AT Protocol authentication.
It provides the core functionality for initiating OAuth flows, handling callbacks, and refreshing tokens.

The implementation follows these OAuth 2.0 standards and specifications:
- OAuth 2.0 Authorization Code Grant (RFC 6749)
- Proof Key for Code Exchange (PKCE) (RFC 7636)
- OAuth 2.0 DPoP (Demonstrating Proof of Possession) (draft)
- OAuth 2.0 JWT Client Authentication (RFC 7523)
- OAuth 2.0 Pushed Authorization Requests (PAR) (RFC 9126)

The OAuth flow is implemented in three stages:
1. Initialization (`oauth_init`): Resolve user identity, prepare PKCE challenge, 
   create a PAR request, and redirect to authorization server
2. Completion (`oauth_complete`): Exchange authorization code for tokens,
   store tokens, and return a signed auth token
3. Refresh (`oauth_refresh`): Use refresh token to obtain new access token
   before the current one expires

Each stage involves secure cryptographic operations, endpoint discovery from the AT Protocol
PDS (Personal Data Server), and proper token storage with automatic refresh scheduling.
"""

import base64
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
from typing import Optional, Tuple
from aio_statsd import TelegrafStatsdClient
from aiohttp import ClientSession, FormData
from jwcrypto import jwt, jwk
from ulid import ULID
from urllib.parse import urlparse, urlencode, parse_qsl, urlunparse
import redis.asyncio as redis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import (
    async_sessionmaker,
    AsyncSession,
)
from social.graze.aip.app.config import Settings, OAUTH_REFRESH_QUEUE
from social.graze.aip.atproto.chain import (
    ChainMiddlewareClient,
    GenerateClaimAssertionMiddleware,
    GenerateDpopMiddleware,
    StatsdMiddleware,
)
from social.graze.aip.atproto.pds import (
    oauth_authorization_server,
    oauth_protected_resource,
)
from social.graze.aip.model.handles import Handle, upsert_handle_stmt
from social.graze.aip.model.oauth import OAuthRequest, OAuthSession
from social.graze.aip.resolve.handle import resolve_subject

def generate_pkce_verifier() -> Tuple[str, str]:
    """
    Generate PKCE (Proof Key for Code Exchange) verifier and challenge.
    
    This implements the PKCE extension to OAuth 2.0 (RFC 7636) to prevent
    authorization code interception attacks. It creates a cryptographically
    random verifier and its corresponding S256 challenge.
    
    Returns:
        Tuple[str, str]: A tuple containing (pkce_verifier, pkce_challenge)
        - pkce_verifier: The secret verifier that will be sent in the token request
        - pkce_challenge: The challenge derived from the verifier, sent in the authorization request
        
    Security considerations:
        - The verifier uses recommended 80 bytes of entropy (RFC 7636 section 4.1)
        - The challenge uses SHA-256 for the code challenge method
    """
    pkce_token = secrets.token_urlsafe(80)

    hashed = hashlib.sha256(pkce_token.encode("ascii")).digest()
    encoded = base64.urlsafe_b64encode(hashed)
    pkce_challenge = encoded.decode("ascii").rstrip("=")
    return (pkce_token, pkce_challenge)


async def oauth_init(
    settings: Settings,
    statsd_client: TelegrafStatsdClient,
    http_session: ClientSession,
    database_session_maker: async_sessionmaker[AsyncSession],
    redis_session: redis.Redis,
    subject: str,
    destination: Optional[str] = None,
):
    """
    Initialize OAuth flow with AT Protocol.
    
    This function starts the OAuth authorization code flow:
    1. Resolves the user's handle or DID to canonical form
    2. Discovers the PDS (Personal Data Server) and authorization endpoints
    3. Creates Pushed Authorization Request (PAR)
    4. Generates PKCE verification codes
    5. Stores request data for later verification
    6. Returns a redirect URL to the authorization server