import { useRecoilState } from "recoil";
import CustomInfoPage from "../info/infoPage";
import { D2I18n, ProgramConfig } from "dhis2-semis-types";
import React, { useEffect, useState } from "react";
import { TableDataRefetch, Modules } from "dhis2-semis-types";
import { Table, useSchoolCalendarKey } from "dhis2-semis-components";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";
import { useHeader, useTableData, useTableSort, useUrlParams, useViewPortWidth } from "dhis2-semis-functions";
import EnrollmentActionsButtons from "../../components/enrollmentButtons/EnrollmentActionsButtons";

const TransferExecute = ({ i18n }: { i18n: D2I18n }) => {
  const { urlParameters } = useUrlParams();
  const { viewPortWidth } = useViewPortWidth();
  const schoolCalendar = useSchoolCalendarKey()
  const [refetch] = useRecoilState(TableDataRefetch);
  const [selected, setSelected] = useState<any[]>([]);
  const { dataStoreData, program: programData } = useGetSelectedKeys()
  const { academicYear, grade, class: section, school, schoolName, } = urlParameters;
  const { getData, tableData, loading, sortableKeys } = useTableData({ module: Modules.Transfer });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, totalPages: 0, totalElements: 0 });
  const { sort, order, orderBy, createSortHandler, withSortableColumns } = useTableSort({ onSortChange: () => setPagination((prev) => ({ ...prev, page: 1 })) });
  const [filterState, setFilterState] = useState<{ dataElements: any; attributes: any; }>({ attributes: [], dataElements: [] });
  const { columns } = useHeader({ dataStoreData, programConfigData: programData as unknown as ProgramConfig, programStage: "" });

  useEffect(() => {
    if (school) {
      void getData({
        page: pagination.page,
        pageSize: pagination.pageSize,
        program: programData!.id as string,
        orgUnit: school,
        order: dataStoreData?.defaults?.defaultOrder,
        baseProgramStage: dataStoreData?.registration?.programStage as string,
        attributeFilters: filterState.attributes,
        dataElementFilters: [
          academicYear !== null ? `${schoolCalendar?.academicYear}:in:${academicYear}` : null,
          grade !== null ? `${dataStoreData.registration.grade}:in:${grade}` : null,
          section !== null ? `${dataStoreData.registration.section}:in:${section}` : null,
        ].filter((filter): filter is string => filter !== null),
        sort: sort && { ...sort, program: programData! },
      });
    }
  }, [filterState, refetch, school, pagination.page, pagination.pageSize, academicYear, grade, section, sort]);

  useEffect(() => {
    setPagination((prev: any) => ({ ...prev, totalPages: tableData?.pagination?.totalPages, totalElements: tableData?.pagination?.totalElements }))
  }, [tableData])

  return (
    <div style={{ height: "85vh" }}>
      {!(Boolean(schoolName) && Boolean(school)) ? (
        <CustomInfoPage i18n={i18n} />
      ) : (
        <Table
          programConfig={programData!}
          title={i18n.t("Transfer Execute")}
          viewPortWidth={viewPortWidth}
          columns={withSortableColumns(columns, sortableKeys)}
          tableData={tableData.data}
          selectable={true}
          selected={selected}
          setSelected={setSelected}
          defaultFilterNumber={5}
          filterState={{ attributes: [], dataElements: [] }}
          loading={loading}
          rightElements={
            <EnrollmentActionsButtons
            i18n={i18n}
              selected={selected}
              setSelected={setSelected}
            />
          }
          setFilterState={setFilterState}
          pagination={pagination}
          setPagination={setPagination}
          sortable
          order={order}
          orderBy={orderBy}
          createSortHandler={createSortHandler}
        />
      )}
    </div>
  );
};

export default TransferExecute;