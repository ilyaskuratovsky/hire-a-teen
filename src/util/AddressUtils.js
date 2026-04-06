export function removeHouseNumber(address) {
  const words = address.split(" ");
  let result = "";

  for (let i = 0; i < words.length; i++) {
    if (words[i].match(/^[0-9]+$/)) {
      continue;
    } else {
      result += words[i] + " ";
    }
  }

  return result.trim();
}
