import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';

 type Props = {
  url: string; // e.g. "/api/admin/units/list"
  columns: GridColDef[];
  pageSize?: number; // default 50
};

 type ServerResponse<Row = any> = {
  rows: Row[];
  total: number;
};

export default function ServerTable({ url, columns, pageSize = 50 }: Props) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize });

  const { data, isFetching } = useQuery<ServerResponse>({
    queryKey: [url, paginationModel.page, paginationModel.pageSize],
    queryFn: async () => {
      const res = await fetch(`${url}?page=${paginationModel.page}&size=${paginationModel.pageSize}` as string, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('failed');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div style={{ height: 640, width: '100%' }}>
      <DataGrid
        rows={data?.rows ?? []}
        columns={columns}
        rowCount={data?.total ?? 0}
        loading={isFetching}
        pagination
        paginationMode="server"
        pageSizeOptions={[25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={(m) => setPaginationModel(m)}
        disableRowSelectionOnClick
        density="compact"
      />
    </div>
  );
}
