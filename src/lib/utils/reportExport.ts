/**
 * Utility functions for exporting sales reports and analytics data
 */

export interface ExportData {
  filename: string;
  data: any[];
  headers: string[];
  title?: string;
  metadata?: Record<string, any>;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Export data as CSV file
 */
export function exportToCSV(exportData: ExportData): void {
  const { data, headers, filename, title, metadata } = exportData;
  
  let csvContent = '';
  
  // Add title and metadata if provided
  if (title) {
    csvContent += `${title}\n\n`;
  }
  
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });
    csvContent += '\n';
  }
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });
  
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * Export data as JSON file
 */
export function exportToJSON(exportData: ExportData): void {
  const { data, filename, title, metadata } = exportData;
  
  const jsonData = {
    ...(title && { title }),
    ...(metadata && { metadata }),
    exportDate: new Date().toISOString(),
    data,
  };
  
  const jsonContent = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Export pipeline analytics data
 */
export function exportPipelineAnalytics(
  analytics: any,
  opportunities: any[],
  options: ExportOptions = { format: 'csv' }
): void {
  const { format } = options;
  
  // Stage metrics export
  const stageMetrics = analytics.stageMetrics.map((stage: any) => ({
    Stage: stage.stage.replace('_', ' '),
    'Opportunity Count': stage.count,
    'Total Value': stage.value,
    'Weighted Value': Math.round(stage.weightedValue),
    'Average Probability': Math.round(stage.avgProbability),
    'Avg Days in Stage': stage.avgDaysInStage,
  }));
  
  const exportData: ExportData = {
    filename: `pipeline-analytics-${new Date().toISOString().split('T')[0]}`,
    data: stageMetrics,
    headers: ['Stage', 'Opportunity Count', 'Total Value', 'Weighted Value', 'Average Probability', 'Avg Days in Stage'],
    title: 'Pipeline Analytics Report',
    metadata: {
      'Generated On': new Date().toLocaleDateString(),
      'Total Opportunities': analytics.summary.totalOpportunities,
      'Total Pipeline Value': `€${analytics.summary.totalValue.toLocaleString()}`,
      'Win Rate': `${Math.round(analytics.summary.winRate)}%`,
      'Average Deal Size': `€${Math.round(analytics.summary.avgDealSize).toLocaleString()}`,
    },
  };
  
  if (format === 'csv') {
    exportToCSV(exportData);
  } else if (format === 'json') {
    exportToJSON(exportData);
  }
}

/**
 * Export sales performance data
 */
export function exportSalesPerformance(
  performance: any[],
  options: ExportOptions = { format: 'csv' }
): void {
  const { format } = options;
  
  const performanceData = performance.map(member => ({
    'Sales Rep': member.name,
    'Email': member.email,
    'Total Opportunities': member.totalOpportunities,
    'Closed Won': member.closedWon,
    'Total Value': member.totalValue,
    'Closed Value': member.closedValue,
    'Win Rate': `${Math.round(member.winRate)}%`,
    'Avg Deal Size': Math.round(member.avgDealSize),
    'Avg Sales Cycle': `${member.avgSalesCycle} days`,
  }));
  
  const totalRevenue = performance.reduce((sum, member) => sum + member.closedValue, 0);
  const totalOpportunities = performance.reduce((sum, member) => sum + member.totalOpportunities, 0);
  
  const exportData: ExportData = {
    filename: `sales-performance-${new Date().toISOString().split('T')[0]}`,
    data: performanceData,
    headers: ['Sales Rep', 'Email', 'Total Opportunities', 'Closed Won', 'Total Value', 'Closed Value', 'Win Rate', 'Avg Deal Size', 'Avg Sales Cycle'],
    title: 'Sales Performance Report',
    metadata: {
      'Generated On': new Date().toLocaleDateString(),
      'Team Size': performance.length,
      'Total Team Revenue': `€${totalRevenue.toLocaleString()}`,
      'Total Opportunities': totalOpportunities,
    },
  };
  
  if (format === 'csv') {
    exportToCSV(exportData);
  } else if (format === 'json') {
    exportToJSON(exportData);
  }
}

/**
 * Export opportunity list
 */
export function exportOpportunityList(
  opportunities: any[],
  options: ExportOptions = { format: 'csv' }
): void {
  const { format } = options;
  
  const opportunityData = opportunities.map(opp => ({
    'Opportunity Name': opp.name,
    'Contact': opp.contact?.name || 'N/A',
    'Stage': opp.stage.replace('_', ' '),
    'Value': opp.value,
    'Event Type': opp.eventType.replace('_', ' '),
    'Event Date': new Date(opp.eventDate).toLocaleDateString(),
    'Guest Count': opp.guestCount,
    'Probability': `${opp.probability || 0}%`,
    'Weighted Value': Math.round(opp.value * ((opp.probability || 0) / 100)),
    'Created Date': new Date(opp.createdAt).toLocaleDateString(),
    'Updated Date': new Date(opp.updatedAt).toLocaleDateString(),
  }));
  
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const totalWeightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * ((opp.probability || 0) / 100)), 0);
  
  const exportData: ExportData = {
    filename: `opportunities-${new Date().toISOString().split('T')[0]}`,
    data: opportunityData,
    headers: ['Opportunity Name', 'Contact', 'Stage', 'Value', 'Event Type', 'Event Date', 'Guest Count', 'Probability', 'Weighted Value', 'Created Date', 'Updated Date'],
    title: 'Opportunities Report',
    metadata: {
      'Generated On': new Date().toLocaleDateString(),
      'Total Opportunities': opportunities.length,
      'Total Pipeline Value': `€${totalValue.toLocaleString()}`,
      'Total Weighted Value': `€${Math.round(totalWeightedValue).toLocaleString()}`,
    },
  };
  
  if (format === 'csv') {
    exportToCSV(exportData);
  } else if (format === 'json') {
    exportToJSON(exportData);
  }
}

/**
 * Export revenue forecasting data
 */
export function exportRevenueForecasting(
  forecasting: any,
  options: ExportOptions = { format: 'csv' }
): void {
  const { format } = options;
  
  const forecastData = forecasting.opportunities.map((opp: any) => ({
    'Opportunity': opp.name,
    'Stage': opp.stage.replace('_', ' '),
    'Value': opp.value,
    'Probability': `${opp.probability}%`,
    'Weighted Value': Math.round(opp.weightedValue),
    'Expected Close': opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : 'TBD',
    'Event Date': new Date(opp.eventDate).toLocaleDateString(),
  }));
  
  const exportData: ExportData = {
    filename: `revenue-forecast-${new Date().toISOString().split('T')[0]}`,
    data: forecastData,
    headers: ['Opportunity', 'Stage', 'Value', 'Probability', 'Weighted Value', 'Expected Close', 'Event Date'],
    title: 'Revenue Forecasting Report',
    metadata: {
      'Generated On': new Date().toLocaleDateString(),
      'Total Opportunities': forecasting.summary.totalOpportunities,
      'Total Pipeline Value': `€${forecasting.summary.totalValue.toLocaleString()}`,
      'Weighted Forecast': `€${Math.round(forecasting.summary.totalWeightedValue).toLocaleString()}`,
      'Average Probability': `${Math.round(forecasting.summary.averageProbability)}%`,
    },
  };
  
  if (format === 'csv') {
    exportToCSV(exportData);
  } else if (format === 'json') {
    exportToJSON(exportData);
  }
}

/**
 * Export executive summary report
 */
export function exportExecutiveSummary(
  analytics: any,
  performance: any[],
  forecasting: any,
  options: ExportOptions = { format: 'csv' }
): void {
  const { format } = options;
  
  const summaryData = [
    {
      Metric: 'Total Pipeline Value',
      Value: `€${analytics.summary.totalValue.toLocaleString()}`,
      Category: 'Pipeline Health',
    },
    {
      Metric: 'Weighted Forecast',
      Value: `€${Math.round(forecasting.summary.totalWeightedValue).toLocaleString()}`,
      Category: 'Revenue Forecast',
    },
    {
      Metric: 'Overall Win Rate',
      Value: `${Math.round(analytics.summary.winRate)}%`,
      Category: 'Pipeline Health',
    },
    {
      Metric: 'Average Deal Size',
      Value: `€${Math.round(analytics.summary.avgDealSize).toLocaleString()}`,
      Category: 'Deal Metrics',
    },
    {
      Metric: 'Average Sales Cycle',
      Value: `${analytics.summary.avgSalesCycle} days`,
      Category: 'Velocity',
    },
    {
      Metric: 'Active Sales Reps',
      Value: performance.filter(p => p.totalOpportunities > 0).length.toString(),
      Category: 'Team Performance',
    },
    {
      Metric: 'Top Performer Revenue',
      Value: `€${Math.max(...performance.map(p => p.closedValue)).toLocaleString()}`,
      Category: 'Team Performance',
    },
  ];
  
  const exportData: ExportData = {
    filename: `executive-summary-${new Date().toISOString().split('T')[0]}`,
    data: summaryData,
    headers: ['Metric', 'Value', 'Category'],
    title: 'Executive Summary Report',
    metadata: {
      'Generated On': new Date().toLocaleDateString(),
      'Report Period': options.dateRange 
        ? `${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}`
        : 'All Time',
    },
  };
  
  if (format === 'csv') {
    exportToCSV(exportData);
  } else if (format === 'json') {
    exportToJSON(exportData);
  }
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate comprehensive sales report package
 */
export function exportComprehensiveReport(
  analytics: any,
  performance: any[],
  opportunities: any[],
  forecasting: any
): void {
  // Export multiple reports as a package
  setTimeout(() => exportPipelineAnalytics(analytics, opportunities), 100);
  setTimeout(() => exportSalesPerformance(performance), 200);
  setTimeout(() => exportOpportunityList(opportunities), 300);
  setTimeout(() => exportRevenueForecasting(forecasting), 400);
  setTimeout(() => exportExecutiveSummary(analytics, performance, forecasting), 500);
}