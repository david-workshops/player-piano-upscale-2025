/**
 * Tests for music theory utilities
 */
import { getScaleNotes, getModeNotes } from '../../src/server/music/theory';

describe('Music Theory Utilities', () => {
  describe('getScaleNotes', () => {
    it('should return correct notes for C major scale', () => {
      const notes = getScaleNotes('C', 'major');
      expect(notes).toEqual([0, 2, 4, 5, 7, 9, 11]); // C, D, E, F, G, A, B
    });
    
    it('should return correct notes for A minor scale', () => {
      const notes = getScaleNotes('A', 'minor');
      expect(notes).toEqual([9, 11, 0, 2, 4, 5, 7]); // A, B, C, D, E, F, G
    });
  });
  
  describe('getModeNotes', () => {
    it('should return correct notes for C Ionian mode', () => {
      const notes = getModeNotes('C', 'major', 'ionian');
      expect(notes).toEqual([0, 2, 4, 5, 7, 9, 11]); // C Ionian = C Major
    });
    
    it('should return correct notes for D Dorian mode', () => {
      const notes = getModeNotes('D', 'major', 'dorian');
      expect(notes).toEqual([2, 4, 5, 7, 9, 11, 0]); // D Dorian
    });
  });
});