import { AppaDoIjeHangyedaForm } from "./forms/AppaDoIjeHangyedaForm";
import { DefaultMemeForm } from "./forms/DefaultMemeForm";
import { EotteokharagoForm } from "./forms/EotteokharagoForm";
import { YeogiseoKkeuchiAnidaForm } from "./forms/YeogiseoKkeuchiAnidaForm";

interface MemeGenerateFormProps {
  slug: string;
}

export function MemeGenerateForm({ slug }: MemeGenerateFormProps): React.JSX.Element {
  switch (slug) {
    case "appa-do-ije-hangyeda":
      return <AppaDoIjeHangyedaForm slug={slug} />;
    case "eotteokharago":
      return <EotteokharagoForm slug={slug} />;
    case "yeogiseo-kkeuchi-anida":
      return <YeogiseoKkeuchiAnidaForm slug={slug} />;
    default:
      return <DefaultMemeForm slug={slug} />;
  }
}
