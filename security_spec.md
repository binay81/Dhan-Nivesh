# Security Specification for Dhan Nivesh

## Data Invariants
1. A user can only access their own profile, portfolio, and learning progress.
2. The `uid` in a user document must match the `request.auth.uid`.
3. Asset quantities must be non-negative.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Creating a user document with `uid` that doesn't match `auth.uid`.
2. **Cross-User Leak**: Authenticated User A attempting to read User B's portfolio.
3. **Ghost Field Injection**: Adding an `isVerified: true` field to the user profile update.
4. **Invalid Risk Profile**: Setting `riskProfile` to "yolo".
5. **Negative Assets**: Setting portfolio `quantity` to -100.
6. **Resource Exhaustion**: Sending a 1MB string as `assetName`.
7. **Orphaned Writes**: Creating a portfolio item for a non-existent user path (though rules catch this via path nesting).
8. **PII Leak**: Accessing `/users` collection without a specific `userId`.
9. **State Locking Bypass**: Modifying `uid` after creation (though update hasOnly prevents this).
10. **Timestamp Fraud**: Modifying `createdAt` (though update hasOnly prevents this).
11. **Path Poisoning**: Using dangerous characters in `assetId`.
12. **Unauthorized Deletion**: User B trying to delete User A's assets.

## Verification
- All above payloads must return `PERMISSION_DENIED`.
