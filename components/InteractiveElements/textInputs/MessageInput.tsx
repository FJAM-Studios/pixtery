import CustomTextInput from "./CustomTextInput";

export default function MessageInput({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (text: string) => void;
}): JSX.Element {
  return (
    <CustomTextInput
      text={message}
      setText={setMessage}
      placeHolderText="Message (optional, reveals when solved)"
    />
  );
}
