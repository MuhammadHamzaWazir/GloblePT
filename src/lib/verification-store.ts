// Temporary in-memory store for verification codes
// This will be replaced by database fields after migration

interface VerificationCode {
  code: string;
  expiresAt: Date;
  attempts: number;
  lastSent: Date;
}

class VerificationStore {
  private store: Map<string, VerificationCode> = new Map();

  set(email: string, code: string, expiresAt: Date): void {
    const existing = this.store.get(email);
    this.store.set(email, {
      code,
      expiresAt,
      attempts: existing ? existing.attempts + 1 : 1,
      lastSent: new Date()
    });
  }

  get(email: string): VerificationCode | undefined {
    const data = this.store.get(email);
    if (data && data.expiresAt < new Date()) {
      this.store.delete(email);
      return undefined;
    }
    return data;
  }

  verify(email: string, code: string): boolean {
    const data = this.get(email);
    if (!data || data.code !== code) {
      return false;
    }
    this.store.delete(email);
    return true;
  }

  canSendCode(email: string): boolean {
    const data = this.store.get(email);
    if (!data) return true;
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return data.lastSent < oneDayAgo || data.attempts < 5;
  }

  clear(email: string): void {
    this.store.delete(email);
  }

  // Clean up expired codes periodically
  cleanup(): void {
    const now = new Date();
    for (const [email, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(email);
      }
    }
  }
}

export const verificationStore = new VerificationStore();

// Clean up expired codes every 5 minutes
setInterval(() => {
  verificationStore.cleanup();
}, 5 * 60 * 1000);
