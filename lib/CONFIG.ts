export const DEFAULT_FORM_FRONTMATTER = {
  collectEmail: true,
  allowMultipleResponses: false,
  limitResponses: 500,
  showProgressBar: true,
  shuffleQuestions: false,
  responseReceipt: "whenRequested",
  themeColor: "#2563EB",
  backgroundImage: "mountain",
  font: "Noto Sans JP, sans-serif",
} as const;

export const DEFAULT_FORM_FRONTMATTER_MARKDOWN = `---
collectEmail: ${DEFAULT_FORM_FRONTMATTER.collectEmail}
allowMultipleResponses: ${DEFAULT_FORM_FRONTMATTER.allowMultipleResponses}
limitResponses: ${DEFAULT_FORM_FRONTMATTER.limitResponses}
showProgressBar: ${DEFAULT_FORM_FRONTMATTER.showProgressBar}
shuffleQuestions: ${DEFAULT_FORM_FRONTMATTER.shuffleQuestions}
responseReceipt: ${DEFAULT_FORM_FRONTMATTER.responseReceipt}
themeColor: "${DEFAULT_FORM_FRONTMATTER.themeColor}"
backgroundImage: ${DEFAULT_FORM_FRONTMATTER.backgroundImage}
font: "${DEFAULT_FORM_FRONTMATTER.font}"
---

`;
