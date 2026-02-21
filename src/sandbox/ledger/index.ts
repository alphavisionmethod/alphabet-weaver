import type { AuditEvent } from '../contracts';
import { canonicalJsonStringify } from '../utils/canonical-json';
import { sha256 } from '../utils/hash';

const GENESIS_HASH = '0'.repeat(64);

export class Ledger {
  private events: AuditEvent[] = [];

  getEvents(): ReadonlyArray<AuditEvent> {
    return this.events;
  }

  getLastHash(): string {
    return this.events.length > 0 ? this.events[this.events.length - 1].hash : GENESIS_HASH;
  }

  getChainLength(): number {
    return this.events.length;
  }

  async append(sessionId: string, type: string, data: Record<string, unknown>): Promise<AuditEvent> {
    const previousHash = this.getLastHash();
    const chainIndex = this.events.length;
    const id = `evt_${chainIndex}_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    const eventData = { id, sessionId, timestamp, type, data, chainIndex, previousHash };
    const hash = await sha256(previousHash + canonicalJsonStringify(eventData));

    const event: AuditEvent = { ...eventData, hash };
    this.events.push(event);
    return event;
  }

  async verify(): Promise<{ valid: boolean; brokenAt?: number }> {
    let prevHash = GENESIS_HASH;
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      if (event.previousHash !== prevHash) {
        return { valid: false, brokenAt: i };
      }
      const eventData = {
        id: event.id,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        type: event.type,
        data: event.data,
        chainIndex: event.chainIndex,
        previousHash: event.previousHash,
      };
      const computed = await sha256(prevHash + canonicalJsonStringify(eventData));
      if (computed !== event.hash) {
        return { valid: false, brokenAt: i };
      }
      prevHash = event.hash;
    }
    return { valid: true };
  }
}
