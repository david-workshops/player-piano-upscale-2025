declare namespace WebMidi {
  interface MIDIAccess extends EventTarget {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  }

  interface MIDIInput {
    name: string;
  }

  interface MIDIOutput {
    name: string;
    send(data: number[]): void;
  }

  interface MIDIInputMap {
    values(): Array<MIDIInput>;
  }

  interface MIDIOutputMap {
    values(): Array<MIDIOutput>;
  }
}

interface Navigator {
  requestMIDIAccess(): Promise<WebMidi.MIDIAccess>;
}