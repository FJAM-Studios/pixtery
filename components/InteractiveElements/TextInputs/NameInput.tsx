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
      initalizeWithCounter={false}
      placeHolderText="Pixtery Display Name"
    />
  );
}
