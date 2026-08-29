import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PropertyAnalyticsExportData } from '../../../application/use-cases/get-property-analytics-export-data/get-property-analytics-export-data.use-case';

const TABLE_COL1_WIDTH = 220;
const TABLE_COL2_WIDTH = 220;
const TABLE_ROW_HEIGHT = 24;

/**
 * Builds a lightweight, readable PDF report via pdfkit — a plain table of
 * the property's analytics summary, not a rendered chart image (that's the
 * frontend's job). Kept deliberately simple: title, a couple of header
 * lines, then a two-column metric/value table.
 */
@Injectable()
export class PropertyAnalyticsPdfSerializer {
  async serialize(data: PropertyAnalyticsExportData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error: Error) => reject(error));

      doc.fontSize(18).text('Property Analytics Report', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).text(`Property: ${data.propertyTitle}`);
      doc.text(`Generated at: ${data.generatedAt.toISOString()}`);
      doc.moveDown();

      const rows: [string, string][] = [
        ['Total Views', String(data.totalViews)],
        ['Total Contacts', String(data.totalContacts)],
        ['Conversion Rate', data.conversionRate.toFixed(4)],
      ];

      const startX = doc.x;
      let y = doc.y;

      doc.font('Helvetica-Bold');
      doc.text('Metric', startX, y, { width: TABLE_COL1_WIDTH });
      doc.text('Value', startX + TABLE_COL1_WIDTH, y, {
        width: TABLE_COL2_WIDTH,
      });
      y += TABLE_ROW_HEIGHT;
      doc
        .moveTo(startX, y - 6)
        .lineTo(startX + TABLE_COL1_WIDTH + TABLE_COL2_WIDTH, y - 6)
        .stroke();

      doc.font('Helvetica');
      for (const [label, value] of rows) {
        doc.text(label, startX, y, { width: TABLE_COL1_WIDTH });
        doc.text(value, startX + TABLE_COL1_WIDTH, y, {
          width: TABLE_COL2_WIDTH,
        });
        y += TABLE_ROW_HEIGHT;
      }

      doc.end();
    });
  }
}
