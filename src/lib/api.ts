const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Get the stored authentication token.
 */
export function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}

/**
 * Set the authentication token in storage.
 */
export function setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
}

/**
 * Remove the authentication token from storage.
 */
export function removeAuthToken(): void {
    localStorage.removeItem('authToken');
}

/**
 * A wrapper around fetch to automatically add Authorization header 
 * and handle common API scenarios.
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    // Determine body type and set Content-Type accordingly
    let bodyToSend = options.body;
    if (!(options.body instanceof FormData)) {
        // If not FormData, assume JSON
        headers.set('Content-Type', 'application/json');
        // Ensure body is stringified if it's an object
        if (typeof bodyToSend === 'object' && bodyToSend !== null) {
            bodyToSend = JSON.stringify(bodyToSend);
        }
    }
    // If it IS FormData, do NOT set Content-Type header
    // let the browser set it automatically with the correct boundary

    if (token) {
        headers.set('Authorization', `Token ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        body: bodyToSend, // Use the potentially stringified body
    });

    // Handle successful response with no content (e.g., logout, delete)
    if (response.status === 204) {
        return Promise.resolve(undefined as T);
    }

    // Try to parse JSON, handle potential errors
    let data;
    try {
        data = await response.json();
    } catch (error) {
        // Handle cases where response is not JSON
        if (!response.ok) {
            throw new Error(response.statusText || 'API request failed with non-JSON response');
        }
        // If response was OK but not JSON (unlikely for our DRF API, but possible)
        data = undefined;
    }

    if (!response.ok) {
        // Handle specific error statuses
        if (response.status === 401) {
            // Unauthorized - Token might be invalid or missing
            removeAuthToken(); // Clear potentially invalid token
            // Redirect to login or notify user - implementation depends on context
            // For now, just throw the error
            console.error("API call unauthorized. Token removed.");
            // window.location.href = '/admin/login'; // Example redirect
        }
        // Throw an error with details from the API response if available
        const errorDetail = data?.detail || JSON.stringify(data) || response.statusText;
        throw new Error(`API Error (${response.status}): ${errorDetail}`);
    }

    return data as T;
} 