
// Mock Authentication Service
// Completely decoupled from Firebase or any external provider.

export const sendOTP = async (phoneNumber: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return a mock session ID or just success
    console.log(`[MOCK AUTH] OTP requested for ${phoneNumber}`);
    return "mock-session-id";
};

export const verifyOTP = async (sessionId: any, otp: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Accept any 6-digit OTP for smooth demo purposes
    // Or enforce a specific one like '123456'
    console.log(`[MOCK AUTH] Verifying OTP: ${otp}`);

    // For this demo, let's say '123456' is the secret key, OR we can accept anything to be friendlier.
    // Let's accept '123456' to keep some realism.
    return otp === '123456';
};

// No-op for recaptcha compatibility if UI still calls it
export const setupRecaptcha = (elementId: string) => {
    console.log("[MOCK AUTH] Recaptcha setup skipped (Mock Mode)");
};
