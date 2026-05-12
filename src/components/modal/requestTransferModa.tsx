import { useState } from "react";
import { format } from "date-fns";
import { Form } from "react-final-form";
import { Center, CircularLoader, NoticeBox } from "@dhis2/ui";
import {
  CustomForm,
  ModalComponent,
  useDataStoreKey,
  WithBorder,
  WithPadding,
} from "dhis2-semis-components";
import {
  useGetDataElements,
  useShowAlerts,
  useUploadEvents,
  useUrlParams,
} from "dhis2-semis-functions";
import { D2I18n } from "dhis2-semis-types";

export default function RequestTransferModal({
  i18n,
  open,
  setOpen,
  selected,
  setSelected,
}: {
  i18n: D2I18n;
  setSelected: (args: any) => void;
  open: boolean;
  setOpen: (args: any) => void;
  selected: any;
}) {
  const { urlParameters } = useUrlParams();
  const { sectionType, school } = urlParameters;
  const { transfer } = useDataStoreKey({
    sectionType: sectionType as unknown as "student" | "staff",
  });
  const { dataElements } = useGetDataElements({
    programStageId: transfer?.programStage as unknown as string,
    type: "programStage",
  });
  const { hide, show } = useShowAlerts();
  const { uploadValues } = useUploadEvents();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: any) {
    setLoading(true);
    const dataElementsToPost = dataElements?.filter(
      (x) => x.id !== transfer.status && x.id !== transfer.originSchool,
    );

    let proceed = true,
      dataElementsValues = [];

    for (let dataElement of dataElementsToPost) {
      if (!values[dataElement.id]) {
        const value = dataElementsToPost.find((de) => de.id === dataElement.id);
        if (value?.required) {
          proceed = false;
        }
      } else {
        dataElementsValues.push({
          dataElement: dataElement.id,
          value: values[dataElement.id],
        });
      }
    }

    if (proceed) {
      const events = [];
      for (const event of selected) {
        events.push({
          enrollment: event?.enrollmentId,
          occurredAt: format(new Date(), "yyyy-MM-dd"),
          updatedAt: format(new Date(), "yyyy-MM-dd"),
          orgUnit: school,
          program: event?.program,
          programStage: transfer?.programStage,
          scheduledAt: format(new Date(), "yyyy-MM-dd"),
          status: "ACTIVE",
          trackedEntity: event?.trackedEntity,
          dataValues: [
            ...dataElementsValues,
            { dataElement: transfer.status, value: "Pending" },
            { dataElement: transfer.originSchool, value: school },
          ],
        });
      }

      await uploadValues({ events: events }, "COMMIT", "CREATE_AND_UPDATE")
        .then(() => {
          setLoading(false);
          setOpen(false);
          setSelected([]);
          show({
            message: i18n.t(`Transfer request sent successfully`),
            type: { success: true },
          });
          setTimeout(hide, 5000);
        })
        .catch(() => {
          setLoading(false);
          setOpen(false);
        });
    } else {
      show({
        message: i18n.t(`Please fill all required fields`),
        type: { warning: true },
      });
      setTimeout(hide, 5000);
      setLoading(false);
    }
  }

  return (
    <ModalComponent
      open={open}
      size="large"
      title={i18n.t("Request transfer")}
      handleClose={() => setOpen(false)}
    >
      <WithPadding p="0">
        <NoticeBox
          title={`${i18n.t("WARNING!")} ${selected?.length} ${i18n.t("rows will be affected")}`}
          warning
        ></NoticeBox>
        <WithPadding />
        <WithBorder type="all">
          <WithPadding p="10px 0">
            {dataElements.length > 0 ? (
              <CustomForm
                Form={Form}
                loading={loading}
                initialValues={{}}
                formFields={[
                  {
                    storyBook: false,
                    name: i18n.t("Perform transfer"),
                    description: i18n.t(
                      "Specify all necessary transfer details",
                    ),
                    fields: dataElements?.filter(
                      (x) =>
                        x.id !== transfer.status &&
                        x.id !== transfer?.originSchool,
                    ),
                  },
                ]}
                storyBook={false}
                withButtons={true}
                onFormSubtmit={(e) => onSubmit(e)}
                onCancel={() => setOpen(false)}
                submitButtonLabel={i18n.t("Perform Transfer")}
              />
            ) : (
              <Center>
                <CircularLoader />
              </Center>
            )}
          </WithPadding>
        </WithBorder>
      </WithPadding>
    </ModalComponent>
  );
}
