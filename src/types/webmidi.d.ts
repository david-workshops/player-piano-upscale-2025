declare namespace WebMidi {
  interface MIDIOutput {
    name: string;
    send: (data: number[]) => void;
  }
}
