import pdfParse from 'pdf-parse';
import { extractClaimedSkills } from '../utils/skillTaxonomy.js';

/**
 * Normalizes extracted text from a PDF document:
 * - Unifies newline formats (\r\n -> \n)
 * - Collapses multiple horizontal spaces into a single space
 * - Collapses 3 or more consecutive newlines into 2 (preserving section breaks)
 * - Trims leading and trailing whitespace
 *
 * @param {string} rawText 
 * @returns {string} normalizedText
 */
export function normalizeText(rawText = '') {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse horizontal spaces/tabs on each line to a single space
    .replace(/[^\S\n]+/g, ' ')
    // Remove space at start/end of lines
    .replace(/^ +| +$/gm, '')
    // Collapse more than 2 consecutive newlines down to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts raw and normalized text from an in-memory PDF buffer.
 *
 * @param {Buffer} pdfBuffer - Uploaded PDF buffer in memory
 * @returns {Promise<{ pages: number, text: string, textLength: number }>}
 */
export async function extractResumeText(pdfBuffer) {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    throw new Error('Invalid or empty PDF buffer provided.');
  }

  try {
    // Ensure Uint8Array view is passed for reliable Node 22 compatibility with pdf-parse
    const uint8Data = new Uint8Array(
      pdfBuffer.buffer, 
      pdfBuffer.byteOffset, 
      pdfBuffer.byteLength
    );

    const parsedData = await pdfParse(uint8Data);
    const normalizedText = normalizeText(parsedData.text);

    return {
      pages: parsedData.numpages || 1,
      text: normalizedText,
      textLength: normalizedText.length
    };
  } catch (err) {
    throw new Error(`Failed to parse PDF document: ${err.message || 'Corrupted or unreadable PDF'}`);
  }
}

/**
 * Parses resume PDF buffer and extracts claimed technical skills via taxonomy matching.
 *
 * @param {Buffer} pdfBuffer
 * @returns {Promise<{ pages: number, textLength: number, claimedSkills: Array }>}
 */
export async function extractResumeSkills(pdfBuffer) {
  const { pages, text, textLength } = await extractResumeText(pdfBuffer);
  const claimedSkills = extractClaimedSkills(text);

  return {
    pages,
    textLength,
    claimedSkills
  };
}

export { extractClaimedSkills };
