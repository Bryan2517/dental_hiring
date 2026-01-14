/**
 * Get the current authenticated user ID
 */
export declare function getCurrentUserId(): Promise<string | null>;
/**
 * Get the current authenticated user
 */
export declare function getCurrentUser(): Promise<import("@supabase/auth-js").User>;
/**
 * Check if user is authenticated
 */
export declare function isAuthenticated(): Promise<boolean>;
