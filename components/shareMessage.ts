
import { Share } from 'react-native';
 
const shareMessage = async (pixUrl?: string): Promise <void> => {
 try {
   const content = {
    message: "Can you solve this Pixtery?" + String.fromCharCode(0xD83D, 0xDCF7) + String.fromCharCode(0xD83D, 0xDD75) + pixUrl,
   }
   const options = {
    subject: "Someone sent you a Pixtery to solve!"
   }
    const result = await Share.share(
        content, options
   );
   if (result.action === Share.sharedAction) {
     if (result.activityType) {
     } else {}
   } else if (result.action === Share.dismissedAction) {}
 } catch (error) {
   alert(error.message);
 }
};
 
export default shareMessage;
