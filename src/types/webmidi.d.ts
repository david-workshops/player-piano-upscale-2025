/**
 * WebMidi API Type Definitions
 */

declare namespace WebMidi {
  interface MIDIOptions {
    sysex?: boolean;
    software?: boolean;
  }

  interface MIDIAccess extends EventTarget {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
    addEventListener(type: "statechange", listener: (this: MIDIAccess, ev: MIDIConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  }

  interface MIDIConnectionEvent extends Event {
    port: MIDIPort;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }

  interface MIDIPort extends EventTarget {
    id: string;
    manufacturer?: string;
    name?: string;
    type: "input" | "output";
    version?: string;
    state: "connected" | "disconnected";
    connection: "open" | "closed" | "pending";
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
    open(): Promise<MIDIPort>;
    close(): Promise<MIDIPort>;
    addEventListener(type: "statechange", listener: (this: MIDIPort, ev: MIDIConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  }

  interface MIDIInput extends MIDIPort {
    type: "input";
    onmidimessage: ((event: MIDIMessageEvent) => void) | null;
    addEventListener(type: "midimessage", listener: (this: MIDIInput, ev: MIDIMessageEvent) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "statechange", listener: (this: MIDIInput, ev: MIDIConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  }

  interface MIDIOutput extends MIDIPort {
    type: "output";
    send(data: number[] | Uint8Array, timestamp?: number): void;
    clear(): void;
  }

  interface MIDIPortMap<T extends MIDIPort> {
    size: number;
    entries(): IterableIterator<[string, T]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<T>;
    forEach(callbackfn: (value: T, key: string, map: MIDIPortMap<T>) => void, thisArg?: any): void;
    get(id: string): T | undefined;
    has(id: string): boolean;
  }
  
  type MIDIInputMap = MIDIPortMap<MIDIInput>;
  type MIDIOutputMap = MIDIPortMap<MIDIOutput>;
}

interface Navigator {
  requestMIDIAccess(options?: WebMidi.MIDIOptions): Promise<WebMidi.MIDIAccess>;
}