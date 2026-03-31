/**
 * Tests for scoring utility functions
 */

import {
  getCommodityScoreColor,
  getCommodityScoreLevel,
  getCommodityScoreLabel,
  getCommodityScoreDescription,
  getCommodityScoreColorClass,
  getCommodityScoreBgClass,
  getCategoryScoreColor,
  getCategoryScoreLabel,
  getCategoryScoreColorClass,
  getCategoryScoreBgClass,
} from '../../utils/scoring'

describe('Commodity Score Functions (INVERSE - lower is better)', () => {
  describe('getCommodityScoreColor', () => {
    it('returns green for scores 0-40 (well differentiated)', () => {
      expect(getCommodityScoreColor(0)).toBe('green')
      expect(getCommodityScoreColor(20)).toBe('green')
      expect(getCommodityScoreColor(40)).toBe('green')
    })

    it('returns yellow for scores 41-60 (needs work)', () => {
      expect(getCommodityScoreColor(41)).toBe('yellow')
      expect(getCommodityScoreColor(50)).toBe('yellow')
      expect(getCommodityScoreColor(60)).toBe('yellow')
    })

    it('returns orange for scores 61-80 (highly generic)', () => {
      expect(getCommodityScoreColor(61)).toBe('orange')
      expect(getCommodityScoreColor(70)).toBe('orange')
      expect(getCommodityScoreColor(80)).toBe('orange')
    })

    it('returns red for scores 81-100 (commodity territory)', () => {
      expect(getCommodityScoreColor(81)).toBe('red')
      expect(getCommodityScoreColor(90)).toBe('red')
      expect(getCommodityScoreColor(100)).toBe('red')
    })

    it('handles edge cases at boundaries', () => {
      expect(getCommodityScoreColor(0)).toBe('green')
      expect(getCommodityScoreColor(40)).toBe('green')
      expect(getCommodityScoreColor(41)).toBe('yellow')
      expect(getCommodityScoreColor(60)).toBe('yellow')
      expect(getCommodityScoreColor(61)).toBe('orange')
      expect(getCommodityScoreColor(80)).toBe('orange')
      expect(getCommodityScoreColor(81)).toBe('red')
      expect(getCommodityScoreColor(100)).toBe('red')
    })

    it('handles NaN gracefully', () => {
      expect(getCommodityScoreColor(NaN)).toBe('red')
      expect(getCommodityScoreColor(Infinity)).toBe('red')
      expect(getCommodityScoreColor(-Infinity)).toBe('red')
    })
  })

  describe('getCommodityScoreLevel', () => {
    it('returns excellent for scores 0-40', () => {
      expect(getCommodityScoreLevel(0)).toBe('excellent')
      expect(getCommodityScoreLevel(40)).toBe('excellent')
    })

    it('returns moderate for scores 41-60', () => {
      expect(getCommodityScoreLevel(41)).toBe('moderate')
      expect(getCommodityScoreLevel(60)).toBe('moderate')
    })

    it('returns poor for scores 61-80', () => {
      expect(getCommodityScoreLevel(61)).toBe('poor')
      expect(getCommodityScoreLevel(80)).toBe('poor')
    })

    it('returns critical for scores 81-100', () => {
      expect(getCommodityScoreLevel(81)).toBe('critical')
      expect(getCommodityScoreLevel(100)).toBe('critical')
    })

    it('handles NaN gracefully', () => {
      expect(getCommodityScoreLevel(NaN)).toBe('critical')
    })
  })

  describe('getCommodityScoreLabel', () => {
    it('returns "Well differentiated" for scores 0-40', () => {
      expect(getCommodityScoreLabel(0)).toBe('Well differentiated')
      expect(getCommodityScoreLabel(40)).toBe('Well differentiated')
    })

    it('returns "Needs work" for scores 41-60', () => {
      expect(getCommodityScoreLabel(41)).toBe('Needs work')
      expect(getCommodityScoreLabel(60)).toBe('Needs work')
    })

    it('returns "Highly generic" for scores 61-80', () => {
      expect(getCommodityScoreLabel(61)).toBe('Highly generic')
      expect(getCommodityScoreLabel(80)).toBe('Highly generic')
    })

    it('returns "Commodity territory" for scores 81-100', () => {
      expect(getCommodityScoreLabel(81)).toBe('Commodity territory')
      expect(getCommodityScoreLabel(100)).toBe('Commodity territory')
    })

    it('handles NaN gracefully', () => {
      expect(getCommodityScoreLabel(NaN)).toBe('Invalid score')
    })
  })

  describe('getCommodityScoreDescription', () => {
    it('returns appropriate description for each score range', () => {
      expect(getCommodityScoreDescription(20)).toContain('stands out from competitors')
      expect(getCommodityScoreDescription(50)).toContain('Some differentiation')
      expect(getCommodityScoreDescription(70)).toContain('sounds like most competitors')
      expect(getCommodityScoreDescription(90)).toContain('could be anyone')
    })

    it('handles NaN gracefully', () => {
      expect(getCommodityScoreDescription(NaN)).toBe('Score calculation error')
    })
  })

  describe('getCommodityScoreColorClass', () => {
    it('returns correct Tailwind text color classes', () => {
      expect(getCommodityScoreColorClass(20)).toBe('text-green-600')
      expect(getCommodityScoreColorClass(50)).toBe('text-yellow-600')
      expect(getCommodityScoreColorClass(70)).toBe('text-orange-500')
      expect(getCommodityScoreColorClass(90)).toBe('text-red-600')
    })
  })

  describe('getCommodityScoreBgClass', () => {
    it('returns correct Tailwind background color classes', () => {
      expect(getCommodityScoreBgClass(20)).toBe('bg-green-50')
      expect(getCommodityScoreBgClass(50)).toBe('bg-yellow-50')
      expect(getCommodityScoreBgClass(70)).toBe('bg-orange-50')
      expect(getCommodityScoreBgClass(90)).toBe('bg-red-50')
    })
  })
})

describe('Category Score Functions (NORMAL - higher is better)', () => {
  describe('getCategoryScoreColor', () => {
    it('returns excellent for scores 7-10', () => {
      expect(getCategoryScoreColor(7)).toBe('excellent')
      expect(getCategoryScoreColor(8.5)).toBe('excellent')
      expect(getCategoryScoreColor(10)).toBe('excellent')
    })

    it('returns moderate for scores 5-6', () => {
      expect(getCategoryScoreColor(5)).toBe('moderate')
      expect(getCategoryScoreColor(5.5)).toBe('moderate')
      expect(getCategoryScoreColor(6)).toBe('moderate')
      expect(getCategoryScoreColor(6.9)).toBe('moderate')
    })

    it('returns poor for scores 0-4', () => {
      expect(getCategoryScoreColor(0)).toBe('poor')
      expect(getCategoryScoreColor(2)).toBe('poor')
      expect(getCategoryScoreColor(4)).toBe('poor')
      expect(getCategoryScoreColor(4.9)).toBe('poor')
    })

    it('handles edge cases at boundaries', () => {
      expect(getCategoryScoreColor(7)).toBe('excellent')
      expect(getCategoryScoreColor(6.99)).toBe('moderate')
      expect(getCategoryScoreColor(5)).toBe('moderate')
      expect(getCategoryScoreColor(4.99)).toBe('poor')
    })

    it('handles NaN gracefully', () => {
      expect(getCategoryScoreColor(NaN)).toBe('poor')
    })
  })

  describe('getCategoryScoreLabel', () => {
    it('returns "Strong" for scores 7-10', () => {
      expect(getCategoryScoreLabel(7)).toBe('Strong')
      expect(getCategoryScoreLabel(10)).toBe('Strong')
    })

    it('returns "Needs work" for scores 5-6', () => {
      expect(getCategoryScoreLabel(5)).toBe('Needs work')
      expect(getCategoryScoreLabel(6)).toBe('Needs work')
    })

    it('returns "Critical gap" for scores 0-4', () => {
      expect(getCategoryScoreLabel(0)).toBe('Critical gap')
      expect(getCategoryScoreLabel(4)).toBe('Critical gap')
    })

    it('handles NaN gracefully', () => {
      expect(getCategoryScoreLabel(NaN)).toBe('No score')
    })
  })

  describe('getCategoryScoreColorClass', () => {
    it('returns correct Tailwind text color classes', () => {
      expect(getCategoryScoreColorClass(8)).toBe('text-green-600')
      expect(getCategoryScoreColorClass(5.5)).toBe('text-yellow-600')
      expect(getCategoryScoreColorClass(3)).toBe('text-red-600')
    })
  })

  describe('getCategoryScoreBgClass', () => {
    it('returns correct Tailwind background color classes', () => {
      expect(getCategoryScoreBgClass(8)).toBe('bg-green-50')
      expect(getCategoryScoreBgClass(5.5)).toBe('bg-yellow-50')
      expect(getCategoryScoreBgClass(3)).toBe('bg-red-50')
    })
  })
})
