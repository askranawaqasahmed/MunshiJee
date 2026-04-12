import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
const TOKEN_EXPIRY = '30d';

interface PdfTokenPayload {
  invoiceId: string;
  type: 'pdf-download';
}

export function generatePdfToken(invoiceId: string): string {
  const payload: PdfTokenPayload = {
    invoiceId,
    type: 'pdf-download',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyPdfToken(token: string): { invoiceId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PdfTokenPayload;

    if (decoded.type !== 'pdf-download' || !decoded.invoiceId) {
      return null;
    }

    return { invoiceId: decoded.invoiceId };
  } catch (error) {
    return null;
  }
}
