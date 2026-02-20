import type { ReactNode } from "react";

import { AppaDoIjeHangyedaForm } from "./forms/AppaDoIjeHangyedaForm";
import { DefaultMemeForm } from "./forms/DefaultMemeForm";
import { EotteokharagoForm } from "./forms/EotteokharagoForm";
import { YeogiseoKkeuchiAnidaForm } from "./forms/YeogiseoKkeuchiAnidaForm";

interface MemeGenerateFormProps {
  slug: string;
  actionRightSlot?: ReactNode;
}

export function MemeGenerateForm({ slug, actionRightSlot }: MemeGenerateFormProps): React.JSX.Element {
  switch (slug) {
    case "appa-do-ije-hangyeda":
      return <AppaDoIjeHangyedaForm slug={slug} actionRightSlot={actionRightSlot} />;
    case "eotteokharago":
      return <EotteokharagoForm slug={slug} actionRightSlot={actionRightSlot} />;
    case "yeogiseo-kkeuchi-anida":
      return <YeogiseoKkeuchiAnidaForm slug={slug} actionRightSlot={actionRightSlot} />;
    default:
      return <DefaultMemeForm slug={slug} actionRightSlot={actionRightSlot} />;
  }
}
