import { NAME_CHARACTER_LIMIT } from "../../../constants";
import CustomTextInput from "./CustomTextInput";

export default function NameInput({
  name,
  setName,
}: {
  name: string;
  setName: (text: string) => void;
}): JSX.Element {
  return (
    <CustomTextInput
      text={name}
      setText={setName}
      textLimit={NAME_CHARACTER_LIMIT}
      initializeWithCounter={false}
      placeHolderText="Pixtery Display Name"
    />
  );
}
