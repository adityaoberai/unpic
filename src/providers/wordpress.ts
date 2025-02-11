import type {
	Operations,
	URLExtractor,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import {
	createExtractAndGenerate,
	createOperationsHandlers,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";

export interface WordPressOperations extends Operations {
	w?: number;
	h?: number;
	crop?: boolean | "1" | "0";
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	WordPressOperations
>({
	keyMap: {
		width: "w",
		height: "h",
	},
	defaults: {
		crop: "1",
	},
});

export const generate: URLGenerator<"wordpress"> = (
	src,
	operations,
) => {
	const url = toUrl(src);
	const { crop } = operations;
	if (typeof crop !== "undefined" && crop !== "0") {
		operations.crop = crop ? "1" : "0";
	}
	url.search = operationsGenerator(operations);
	return toCanonicalUrlString(url);
};

export const extract: URLExtractor<"wordpress"> = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser(parsedUrl);

	if (operations.crop !== undefined) {
		operations.crop = operations.crop === "1";
	}

	parsedUrl.search = "";

	return {
		src: toCanonicalUrlString(parsedUrl),
		operations,
	};
};

export const transform: URLTransformer<"wordpress"> = createExtractAndGenerate(
	extract,
	generate,
);
