export const getXPath = (element) => {
	if (element.id) return `#${element.id}`;
	if (element === document.body) return "body";

	let ix = 0;
	const siblings = element.parentNode.childNodes;

	for (let i = 0; i < siblings.length; i++) {
		const sibling = siblings[i];
		if (sibling === element) {
			return `${getXPath(element.parentNode)} > ${element.tagName}:nth-child(${
				ix + 1
			})`;
		}
		if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
	}
};
