# Session Management Rationale - FixItForMe Contractor Module

## Overview
The FixItForMe Contractor Module implements a dual-session architecture with different timeout behaviors for different types of operations.

## Session Types & Timeouts

### 1. Contractor Login Sessions (48 Hours)
**Purpose**: Keep contractors logged in for extended work periods  
**Duration**: 48 hours  
**Rationale**: 
- Contractors work on projects over multiple days
- Desktop/tablet professional environment (secure workstations)
- Reduces friction for active project management
- Aligns with contractor workflow patterns

**Implementation**:
```typescript
// Supabase Auth Configuration
const supabaseConfig = {
  auth: {
    // Contractor login sessions
    sessionTimeout: 48 * 60 * 60, // 48 hours in seconds
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}
```

### 2. Agentic Operation Timeouts (10 Minutes)
**Purpose**: Prevent hanging AI operations and resource waste  
**Duration**: 10 minutes  
**Rationale**:
- AI operations should complete within reasonable time
- Prevents infinite loops or stuck processes
- Resource management for concurrent operations
- User experience - contractors shouldn't wait indefinitely

**Implementation**:
```typescript
// Agent Operation Timeout
const AGENT_OPERATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// In agent endpoints
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Operation timeout')), AGENT_OPERATION_TIMEOUT)
);
```

## Security Considerations

### Login Session Security
- **Secure Token Storage**: HttpOnly cookies for refresh tokens
- **CSRF Protection**: Built into Supabase Auth
- **Session Rotation**: Refresh tokens rotate on each use
- **Logout on Suspicious Activity**: Automatic logout on security events

### Agentic Operation Security
- **Resource Limits**: Max 2 concurrent operations per account
- **Timeout Protection**: All operations have hard timeout limits
- **Error Handling**: Graceful degradation on timeouts
- **Audit Trail**: All operations logged for debugging

## User Experience Patterns

### For 48-Hour Login Sessions
1. **Seamless Experience**: Contractors stay logged in across work sessions
2. **Auto-Save**: Work is continuously saved without re-authentication
3. **Background Sync**: Data syncs automatically while logged in
4. **Graceful Expiry**: Clear notification when session expires with easy re-login

### For 10-Minute Agentic Timeouts
1. **Progress Indicators**: Real-time progress for long operations
2. **Timeout Warnings**: UI warns at 8-minute mark
3. **Retry Mechanisms**: Easy retry if operation times out
4. **Partial Results**: Save partial progress before timeout

## Implementation Notes

### Supabase Configuration
```typescript
// Client-side configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 48-hour contractor sessions
    sessionTimeout: 172800, // 48 hours in seconds
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Security settings
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  }
});
```

### Agent Timeout Wrapper
```typescript
export async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 600000 // 10 minutes default
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
  );
  
  return Promise.race([promise, timeoutPromise]);
}
```

## Monitoring & Analytics

### Session Metrics
- Average session duration
- Session expiry rates
- Re-authentication frequency
- Security event frequency

### Operation Metrics
- Average operation completion time
- Timeout frequency by agent type
- Concurrent operation patterns
- Resource utilization during operations

## Business Rationale

### 48-Hour Login Sessions
- **Professional Contractor Experience**: Matches desktop software patterns
- **Reduced Support Load**: Fewer password reset requests
- **Higher Engagement**: Smoother workflow increases usage
- **Competitive Advantage**: More convenient than competitors

### 10-Minute Agentic Timeouts
- **Cost Control**: Prevents runaway AI operations
- **Quality Assurance**: Forces efficient AI operations
- **Resource Management**: Enables concurrent user support
- **User Expectation Management**: Clear boundaries for AI assistance

## Environment Variables Required

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Session Configuration (optional overrides)
CONTRACTOR_SESSION_TIMEOUT=172800  # 48 hours
AGENT_OPERATION_TIMEOUT=600000     # 10 minutes
```

## Error Handling

### Session Expiry
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear local state
    // Redirect to login with return URL
    // Show friendly expiry message
  }
});
```

### Operation Timeout
```typescript
try {
  const result = await withTimeout(agentOperation(), 600000);
  return result;
} catch (error) {
  if (error.message === 'Operation timeout') {
    // Show timeout message
    // Offer retry option
    // Save partial progress
  }
  throw error;
}
```

This dual-session approach provides the best of both worlds: long-lasting convenience for contractors while maintaining tight control over AI operations.
