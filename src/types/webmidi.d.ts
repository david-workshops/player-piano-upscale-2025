declare namespace WebMidi {
  interface MIDIOutput {
    name: string;
    send: (data: number[]) => void;
  }

  interface MIDIOutputMap {
    size: number;
    values(): IterableIterator<MIDIOutput>;
    entries(): IterableIterator<[string, MIDIOutput]>;
    keys(): IterableIterator<string>;
    get(id: string): MIDIOutput | undefined;
    forEach(
      callbackfn: (value: MIDIOutput, key: string, map: MIDIOutputMap) => void,
    ): void;
  }

  interface MIDIAccess {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
    onstatechange: ((this: MIDIAccess, ev: MIDIConnectionEvent) => void) | null;
    sysexEnabled: boolean;
  }

  interface MIDIInputMap {
    size: number;
    values(): IterableIterator<MIDIInput>;
    entries(): IterableIterator<[string, MIDIInput]>;
    keys(): IterableIterator<string>;
    get(id: string): MIDIInput | undefined;
    forEach(
      callbackfn: (value: MIDIInput, key: string, map: MIDIInputMap) => void,
    ): void;
  }

  interface MIDIInput {
    onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => void) | null;
    id: string;
    manufacturer?: string;
    name?: string;
    type: "input" | "output";
    version?: string;
    state: "connected" | "disconnected";
    connection: "open" | "closed" | "pending";
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
    onstatechange: ((this: MIDIPort, ev: MIDIConnectionEvent) => void) | null;
  }
}
