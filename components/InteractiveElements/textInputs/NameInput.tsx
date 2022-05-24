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
      textLimit={15}
      placeHolderText="Display Name"
    />
  );
}
