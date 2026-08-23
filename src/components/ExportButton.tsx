import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getAuthToken } from '../services/api';

export const ExportButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/reports/export-csv', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to export CSV report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerNexus_Placement_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Error exporting CSV report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
      Export Placement CSV
    </button>
  );
};
