// Utility function to fix character encoding issues
export const fixEncoding = (str) => {
  if (!str) return str;
  try {
    // Check for common UTF-8 encoding issues
    if (str.includes('Ã') || str.includes('â€™') || str.includes('â€œ') || str.includes('â€')) {
      // Try multiple decoding methods
      try {
        // Method 1: decodeURIComponent with escape
        return decodeURIComponent(escape(str));
      } catch (e1) {
        try {
          // Method 2: Direct UTF-8 decoding
          return new TextDecoder('utf-8').decode(new TextEncoder().encode(str));
        } catch (e2) {
          // Method 3: Manual character replacement for common issues
          return str
            .replace(/Ã¡/g, 'á')
            .replace(/Ã©/g, 'é')
            .replace(/Ã­/g, 'í')
            .replace(/Ã³/g, 'ó')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã±/g, 'ñ')
            .replace(/Ã¼/g, 'ü')
            .replace(/Ã¶/g, 'ö')
            .replace(/Ã¤/g, 'ä')
            .replace(/Ã¥/g, 'å')
            .replace(/Ã§/g, 'ç')
            .replace(/Ã°/g, 'ð')
            .replace(/Ã¾/g, 'þ')
            .replace(/Ã†/g, 'Æ')
            .replace(/Ã˜/g, 'Ø')
            .replace(/Ã…/g, 'Å')
            // Hungarian specific characters
            .replace(/Ã¶/g, 'ö')
            .replace(/Ã¼/g, 'ü')
            .replace(/Ã³/g, 'ó')
            .replace(/Ã©/g, 'é')
            .replace(/Ã¡/g, 'á')
            .replace(/Ã­/g, 'í')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã±/g, 'ñ')
            .replace(/Ã§/g, 'ç')
            .replace(/Ã°/g, 'ð')
            .replace(/Ã¾/g, 'þ')
            .replace(/Ã†/g, 'Æ')
            .replace(/Ã˜/g, 'Ø')
            .replace(/Ã…/g, 'Å');
        }
      }
    }
    return str;
  } catch (error) {
    console.error('Encoding fix error:', error);
    return str;
  }
};

// Additional function to ensure proper UTF-8 encoding for API calls
export const ensureUTF8 = (str) => {
  if (!str) return str;
  try {
    // Convert to proper UTF-8
    return unescape(encodeURIComponent(str));
  } catch (error) {
    console.error('UTF-8 encoding error:', error);
    return str;
  }
};
