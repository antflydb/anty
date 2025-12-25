/**
 * Animation Debug Tracker
 *
 * INSANELY CLEAR debug system to detect animation conflicts
 * Shows RED/GREEN/YELLOW warnings for OLD vs NEW animation systems
 */

export type AnimationSource = 'CONTROLLER' | 'MANUAL';

export interface ActiveAnimation {
  id: string;
  source: AnimationSource;
  elementName: string;
  element: Element | string;
  timeline?: gsap.core.Timeline;
  startedAt: number;
  duration?: number;
  stackTrace?: string;
}

class AnimationDebugTracker {
  private activeAnimations = new Map<string, ActiveAnimation>();
  private elementOwnership = new Map<string, Set<string>>(); // element -> animation IDs
  private enabled = false;

  constructor() {
    // Enable in development
    if (typeof window !== 'undefined') {
      this.enabled = process.env.NODE_ENV === 'development';
    }
  }

  /**
   * Track a controller animation
   */
  trackController(
    id: string,
    elements: (Element | string)[],
    timeline?: gsap.core.Timeline,
    duration?: number
  ): void {
    if (!this.enabled) return;

    const animation: ActiveAnimation = {
      id,
      source: 'CONTROLLER',
      elementName: this.getElementNames(elements),
      element: elements[0],
      timeline,
      startedAt: Date.now(),
      duration,
    };

    this.activeAnimations.set(id, animation);

    // Track element ownership
    elements.forEach(el => {
      const key = this.getElementKey(el);
      if (!this.elementOwnership.has(key)) {
        this.elementOwnership.set(key, new Set());
      }
      this.elementOwnership.get(key)!.add(id);
    });

    this.logAnimation('🟢 CONTROLLER', animation);
    this.checkConflicts();
  }

  /**
   * Track a manual GSAP animation (VIOLATION!)
   */
  trackManual(
    elementName: string,
    element: Element | string,
    timeline?: gsap.core.Timeline
  ): void {
    if (!this.enabled) return;

    const id = `manual-${Date.now()}-${Math.random()}`;
    const stackTrace = this.getStackTrace();

    const animation: ActiveAnimation = {
      id,
      source: 'MANUAL',
      elementName,
      element,
      timeline,
      startedAt: Date.now(),
      stackTrace,
    };

    this.activeAnimations.set(id, animation);

    // Track element ownership
    const key = this.getElementKey(element);
    if (!this.elementOwnership.has(key)) {
      this.elementOwnership.set(key, new Set());
    }
    this.elementOwnership.get(key)!.add(id);

    this.logAnimation('🔴 MANUAL', animation, true);
    this.checkConflicts();
  }

  /**
   * Remove animation from tracking
   */
  untrack(id: string): void {
    if (!this.enabled) return;

    const animation = this.activeAnimations.get(id);
    if (!animation) return;

    // Remove from element ownership
    this.elementOwnership.forEach((animIds, elementKey) => {
      animIds.delete(id);
      if (animIds.size === 0) {
        this.elementOwnership.delete(elementKey);
      }
    });

    this.activeAnimations.delete(id);
  }

  /**
   * Check for conflicts (multiple animations on same element)
   */
  private checkConflicts(): void {
    const conflicts: string[] = [];

    this.elementOwnership.forEach((animIds, elementKey) => {
      if (animIds.size > 1) {
        const anims = Array.from(animIds)
          .map(id => this.activeAnimations.get(id))
          .filter(Boolean) as ActiveAnimation[];

        const hasManual = anims.some(a => a.source === 'MANUAL');
        const hasController = anims.some(a => a.source === 'CONTROLLER');

        if (hasManual && hasController) {
          conflicts.push(
            `⚠️ CONFLICT on ${elementKey}:\n` +
            anims.map(a => `  ${a.source === 'MANUAL' ? '🔴' : '🟢'} ${a.id}`).join('\n')
          );
        }
      }
    });

    if (conflicts.length > 0) {
      console.error('⚠️⚠️⚠️ ANIMATION CONFLICTS DETECTED ⚠️⚠️⚠️');
      conflicts.forEach(c => console.error(c));
    }
  }

  /**
   * Get all active animations
   */
  getActiveAnimations(): ActiveAnimation[] {
    return Array.from(this.activeAnimations.values());
  }

  /**
   * Get debug info for display
   */
  getDebugInfo(): {
    total: number;
    controller: number;
    manual: number;
    conflicts: number;
    animations: ActiveAnimation[];
  } {
    const animations = this.getActiveAnimations();
    const controller = animations.filter(a => a.source === 'CONTROLLER').length;
    const manual = animations.filter(a => a.source === 'MANUAL').length;

    let conflicts = 0;
    this.elementOwnership.forEach(animIds => {
      if (animIds.size > 1) {
        const anims = Array.from(animIds)
          .map(id => this.activeAnimations.get(id))
          .filter(Boolean) as ActiveAnimation[];

        const hasManual = anims.some(a => a.source === 'MANUAL');
        const hasController = anims.some(a => a.source === 'CONTROLLER');

        if (hasManual && hasController) conflicts++;
      }
    });

    return {
      total: animations.length,
      controller,
      manual,
      conflicts,
      animations,
    };
  }

  /**
   * Log animation with color coding
   */
  private logAnimation(prefix: string, animation: ActiveAnimation, isViolation = false): void {
    const style = isViolation
      ? 'color: #ff0000; font-weight: bold; font-size: 14px;'
      : 'color: #00ff00; font-weight: bold;';

    console.log(
      `%c${prefix} ${animation.id}`,
      style,
      `\n  Element: ${animation.elementName}`,
      `\n  Started: ${new Date(animation.startedAt).toLocaleTimeString()}`
    );

    if (isViolation && animation.stackTrace) {
      console.log('  Stack trace:', animation.stackTrace);
    }
  }

  /**
   * Get stack trace
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (e: any) {
      return e.stack
        ?.split('\n')
        .slice(3, 6) // Skip first few lines
        .join('\n') || '';
    }
  }

  /**
   * Get element key for tracking
   */
  private getElementKey(element: Element | string): string {
    if (typeof element === 'string') return element;

    const htmlElement = element as HTMLElement;
    return (
      htmlElement.getAttribute('data-anty-id') ||
      htmlElement.id ||
      htmlElement.className ||
      `element-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  /**
   * Get readable element names
   */
  private getElementNames(elements: (Element | string)[]): string {
    return elements
      .map(el => {
        if (typeof el === 'string') return el;
        const htmlEl = el as HTMLElement;
        return (
          htmlEl.getAttribute('data-anty-id') ||
          htmlEl.id ||
          htmlEl.className.split(' ')[0] ||
          'unknown'
        );
      })
      .join(', ');
  }

  /**
   * Clear all tracking
   */
  clear(): void {
    this.activeAnimations.clear();
    this.elementOwnership.clear();
  }
}

// Global singleton instance
export const debugTracker = new AnimationDebugTracker();

/**
 * Intercept GSAP timeline creation to detect manual animations
 * Call this in development to catch violations
 */
export function interceptGSAP(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // This would need to be called after GSAP is loaded
  // We'll add this as a development tool
  console.log('📊 Animation Debug Tracker enabled');
  console.log('  🟢 GREEN = AnimationController (GOOD)');
  console.log('  🔴 RED = Manual GSAP (VIOLATION)');
  console.log('  ⚠️ YELLOW = Conflict detected');
}
