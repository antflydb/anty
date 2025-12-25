/**
 * Element Registry for Animation System
 *
 * Tracks which elements are owned by which animations to prevent conflicts.
 * Provides safe cleanup and ownership transfer mechanisms.
 */

import type { ElementOwnership } from './types';
import gsap from 'gsap';

export class ElementRegistry {
  private ownership = new Map<string, ElementOwnership>();
  private enableLogging: boolean;
  private killingTimelines = new Set<gsap.core.Timeline>();

  constructor(enableLogging = false) {
    this.enableLogging = enableLogging;
  }

  /**
   * Get unique key for an element
   */
  private getElementKey(element: Element | string): string {
    if (typeof element === 'string') {
      return element;
    }
    // Use data-anty-id if available, otherwise use element class/id
    return element.getAttribute('data-anty-id') ||
           element.id ||
           element.className ||
           `element-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if an element is currently owned by an animation
   */
  isOwned(element: Element | string): boolean {
    const key = this.getElementKey(element);
    return this.ownership.has(key);
  }

  /**
   * Get the current owner of an element
   */
  getOwner(element: Element | string): string | null {
    const key = this.getElementKey(element);
    const ownership = this.ownership.get(key);
    return ownership ? ownership.owner : null;
  }

  /**
   * Acquire ownership of an element
   * Returns true if successful, false if already owned
   */
  acquire(
    element: Element | string,
    owner: string,
    timeline: gsap.core.Timeline,
    force = false
  ): boolean {
    const key = this.getElementKey(element);
    const existing = this.ownership.get(key);

    if (existing && !force) {
      if (this.enableLogging) {
        console.warn(`[ElementRegistry] Element ${key} already owned by ${existing.owner}`);
      }
      return false;
    }

    // Kill existing timeline if forcing
    if (existing && force) {
      if (this.enableLogging) {
        console.log(`[ElementRegistry] Forcing ownership transfer for ${key} from ${existing.owner} to ${owner}`);
      }
      this.release(element);
    }

    this.ownership.set(key, {
      element,
      owner,
      timeline,
      acquiredAt: Date.now(),
      priority: 0, // Default priority, can be enhanced later
    });

    if (this.enableLogging) {
      console.log(`[ElementRegistry] ${owner} acquired ${key}`);
    }

    return true;
  }

  /**
   * Release ownership of an element
   */
  release(element: Element | string): void {
    const key = this.getElementKey(element);
    const ownership = this.ownership.get(key);

    if (!ownership) {
      return;
    }

    // Kill the timeline if it's still active
    if (ownership.timeline && ownership.timeline.isActive()) {
      ownership.timeline.kill();
    }

    this.ownership.delete(key);

    if (this.enableLogging) {
      console.log(`[ElementRegistry] Released ${key} from ${ownership.owner}`);
    }
  }

  /**
   * Release all elements owned by a specific owner
   */
  releaseByOwner(owner: string): void {
    const toRelease: string[] = [];

    this.ownership.forEach((ownership, key) => {
      if (ownership.owner === owner) {
        toRelease.push(key);
      }
    });

    toRelease.forEach(key => {
      const ownership = this.ownership.get(key);
      if (ownership) {
        // Kill timeline directly, then delete from map
        if (ownership.timeline && ownership.timeline.isActive()) {
          // Prevent re-entrant timeline.kill() calls to avoid stack overflow
          if (!this.killingTimelines.has(ownership.timeline)) {
            this.killingTimelines.add(ownership.timeline);
            ownership.timeline.kill();
            this.killingTimelines.delete(ownership.timeline);
          }
        }
        this.ownership.delete(key);  // ✅ Direct deletion, no recursion

        if (this.enableLogging) {
          console.log(`[ElementRegistry] Released ${key} from ${ownership.owner}`);
        }
      }
    });
  }

  /**
   * Release all elements (cleanup)
   */
  releaseAll(): void {
    if (this.enableLogging) {
      console.log(`[ElementRegistry] Releasing all ${this.ownership.size} owned elements`);
    }

    this.ownership.forEach(ownership => {
      if (ownership.timeline && ownership.timeline.isActive()) {
        ownership.timeline.kill();
      }
    });

    this.ownership.clear();
  }

  /**
   * Get all owned elements
   */
  getOwnedElements(): ElementOwnership[] {
    return Array.from(this.ownership.values());
  }

  /**
   * Get debug info
   */
  getDebugInfo(): {
    totalOwned: number;
    owners: Map<string, number>;
    elements: ElementOwnership[];
  } {
    const owners = new Map<string, number>();

    this.ownership.forEach(ownership => {
      owners.set(ownership.owner, (owners.get(ownership.owner) || 0) + 1);
    });

    return {
      totalOwned: this.ownership.size,
      owners,
      elements: this.getOwnedElements(),
    };
  }

  /**
   * Validate that no elements are leaked
   * Call this periodically in development to catch memory leaks
   */
  validateNoLeaks(): boolean {
    let hasLeaks = false;

    this.ownership.forEach((ownership, key) => {
      const ageMs = Date.now() - ownership.acquiredAt;
      const ageSeconds = ageMs / 1000;

      // If owned for more than 30 seconds and timeline isn't active, it's probably a leak
      if (ageSeconds > 30 && !ownership.timeline.isActive()) {
        console.warn(
          `[ElementRegistry] Potential leak: ${key} owned by ${ownership.owner} for ${ageSeconds.toFixed(1)}s but timeline inactive`
        );
        hasLeaks = true;
      }
    });

    return !hasLeaks;
  }
}
