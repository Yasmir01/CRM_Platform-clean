import * as React from 'react';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

export default function AttachmentList({ attachments }: { attachments: any[] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="font-medium text-sm text-gray-700">Attachments:</p>
      <div className="grid grid-cols-2 gap-3">
        {attachments.map((a) => {
          const mime = String(a?.mimeType || '').toLowerCase();
          const isImage = mime.startsWith('image/');
          const isPDF = mime === 'application/pdf' || mime.includes('pdf');
          const isDoc = mime.includes('word') || mime.includes('msword') || mime.includes('officedocument.wordprocessingml');
          const isExcel = mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('officedocument.spreadsheetml');

          return (
            <div
              key={a.id}
              className="border rounded-lg p-2 bg-gray-50 shadow-sm flex flex-col items-center justify-center"
            >
              {isImage ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  <img src={a.url} alt={a.filename} className="h-24 w-24 object-cover rounded-md" />
                </a>
              ) : (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                  {isPDF && <PictureAsPdfRoundedIcon sx={{ width: 32, height: 32, color: '#dc2626' }} />}
                  {isDoc && <DescriptionRoundedIcon sx={{ width: 32, height: 32, color: '#2563eb' }} />}
                  {isExcel && <TableChartRoundedIcon sx={{ width: 32, height: 32, color: '#16a34a' }} />}
                  {!isPDF && !isDoc && !isExcel && (
                    <InsertDriveFileRoundedIcon sx={{ width: 32, height: 32, color: '#6b7280' }} />
                  )}
                </a>
              )}
              <span className="mt-1 text-xs text-gray-600 truncate w-full text-center">{a.filename}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
