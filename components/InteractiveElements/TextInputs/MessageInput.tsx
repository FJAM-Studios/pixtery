import { MESSAGE_CHARACTER_LIMIT } from "../../../constants";
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
      textLimit={MESSAGE_CHARACTER_LIMIT}
      initializeWithCounter
      placeHolderText="Message (optional, reveals when solved)"
    />
  );
}
