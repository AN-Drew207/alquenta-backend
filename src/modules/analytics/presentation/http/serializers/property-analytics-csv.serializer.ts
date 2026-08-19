import { Injectable } from '@nestjs/common';
import { PropertyAnalyticsExportData } from '../../../application/use-cases/get-property-analytics-export-data/get-property-analytics-export-data.use-case';

const CSV_HEADER = [
  'Property',
  'Generated At',
  'Total Views',
  'Total Contacts',
  'Conversion Rate',
];

/**
 * Hand-built CSV — this repo has no CSV library anywhere, and one row of
 * data doesn't justify adding one. RFC 4180-style escaping: any field
 * containing a comma, double quote, or newline is wrapped in double quotes,
 * with internal double quotes doubled.
 */
@Injectable()
export class PropertyAnalyticsCsvSerializer {
  serialize(data: PropertyAnalyticsExportData): string {
    const row = [
      data.propertyTitle,
      data.generatedAt.toISOString(),
      String(data.totalViews),
      String(data.totalContacts),
      data.conversionRate.toFixed(4),
    ];

    return [CSV_HEADER, row]
      .map((fields) => fields.map(escapeCsvField).join(','))
      .join('\r\n');
  }
}

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
