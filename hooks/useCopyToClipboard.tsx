import { useState } from 'react';

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset the status after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return { isCopied, handleCopy };
};
