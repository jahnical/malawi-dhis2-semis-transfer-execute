import { InfoPage } from "dhis2-semis-components";
import { D2I18n } from "dhis2-semis-types";
import { getInfoInstructions } from "dhis2-semis-functions";
import useGetSelectedKeys from "../../hooks/config/useGetSelectedKeys";

export default function CustomInfoPage({ i18n }: { i18n: D2I18n }) {
    const { dataStoreData, program } = useGetSelectedKeys()
    return (
        <InfoPage
            title={i18n.t("SEMIS-Transfer-Execute")}
            sections={[
                {
                    sectionTitle: i18n.t("Follow the instructions to proceed"),
                    instructions: getInfoInstructions({ i18n, filters: (dataStoreData?.filters?.dataElements ?? []) as any, program: program as any, academicYear: "optional", sectionFilters: "optional" }),
                },
            ]}
        />
    );
}   