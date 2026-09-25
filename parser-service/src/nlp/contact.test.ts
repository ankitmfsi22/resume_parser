import { describe, expect, it } from 'vitest';
import { extractEmail, extractPhone } from './contact';

describe('extractEmail', () => {
  it('finds an email inside a block of text', () => {
    expect(extractEmail('Contact me at john.doe@example.com for details')).toBe(
      'john.doe@example.com',
    );
  });

  it('lowercases the address', () => {
    expect(extractEmail('JOHN@EXAMPLE.COM')).toBe('john@example.com');
  });

  it('handles plus addressing and subdomains', () => {
    expect(extractEmail('priya+jobs@mail.company.co.in')).toBe('priya+jobs@mail.company.co.in');
  });

  it('strips a trailing full stop left by OCR', () => {
    expect(extractEmail('Email: a@b.com.')).toBe('a@b.com');
  });

  it('returns undefined when there is no email', () => {
    expect(extractEmail('No contact details here')).toBeUndefined();
  });
});

describe('extractPhone', () => {
  it('reads an Indian mobile number with a country code', () => {
    expect(extractPhone('Phone: +91 98765 43210')).toBe('+919876543210');
  });

  it('reads a plain ten digit number', () => {
    expect(extractPhone('Mobile 9876543210')).toBe('9876543210');
  });

  it('reads a US style number with brackets and dashes', () => {
    expect(extractPhone('Call (555) 123-4567')).toBe('5551234567');
  });

  it('does not mistake a date range for a phone number', () => {
    expect(extractPhone('Worked there from 2019 - 2022')).toBeUndefined();
  });

  it('does not mistake a slash date range for a phone number', () => {
    expect(extractPhone('01/2019 - 12/2022')).toBeUndefined();
  });

  it('ignores digit strings that are too short', () => {
    expect(extractPhone('Roll number 12345')).toBeUndefined();
  });

  it('returns undefined when there is no number', () => {
    expect(extractPhone('Just some resume text')).toBeUndefined();
  });
});