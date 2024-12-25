const symbol = {
  javascript: "//",
  python: "#",
};

const getDefaultContent = (language) => {
  let content = "";
  if (symbol[language]) {
    content = `${symbol[language]} write your code here`;
  }
  return content;
};

export default getDefaultContent;
