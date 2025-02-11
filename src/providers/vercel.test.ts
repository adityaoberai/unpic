import { extract, generate, transform } from "./vercel.ts";
import { assertEqualIgnoringQueryOrder } from "../test-utils.ts";
import { assertEquals } from "jsr:@std/assert";

const relativeUrl = "/image.jpg";
const baseUrl = "https://example.com";
const transformedUrl = `${baseUrl}/_vercel/image?url=${relativeUrl}`;

// Tests for generate, extract, and transform

Deno.test("Vercel Image CDN - generate", async (t) => {
	await t.step("should generate a relative URL with transformations", () => {
		const result = generate(relativeUrl, { w: 800 });
		assertEqualIgnoringQueryOrder(
			result,
			"/_vercel/image?url=/image.jpg&w=800&q=75",
		);
	});

	await t.step("should generate an absolute URL with transformations", () => {
		const result = generate(relativeUrl, { w: 800 }, { baseUrl });
		assertEqualIgnoringQueryOrder(
			result,
			"https://example.com/_vercel/image?url=/image.jpg&w=800&q=75",
		);
	});

	await t.step("should generate a URL with quality", () => {
		const result = generate(relativeUrl, { w: 800, q: 80 });
		assertEqualIgnoringQueryOrder(
			result,
			"/_vercel/image?url=/image.jpg&w=800&q=80",
		);
	});

	await t.step("should generate an absolute URL with quality", () => {
		const result = generate(relativeUrl, { w: 800, q: 80 }, { baseUrl });
		assertEqualIgnoringQueryOrder(
			result,
			"https://example.com/_vercel/image?url=/image.jpg&w=800&q=80",
		);
	});

	await t.step("should generate a URL with a remote image", () => {
		const result = generate(
			"https://example.net/image.jpg",
			{ w: 800, q: 80 },
			{
				baseUrl,
			},
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://example.com/_vercel/image?url=https%3A%2F%2Fexample.net%2Fimage.jpg&w=800&q=80",
		);
	});

	await t.step(
		"should generate a relative path when transforming a remote URL with no base URL",
		() => {
			const result = generate(
				"https://example.net/image.jpg",
				{ w: 800, q: 80 },
				{},
			);
			assertEqualIgnoringQueryOrder(
				result,
				"/_vercel/image?url=https%3A%2F%2Fexample.net%2Fimage.jpg&w=800&q=80",
			);
		},
	);
});

Deno.test("Vercel Image CDN - extract", async (t) => {
	await t.step(
		"should extract transformations from a transformed URL",
		() => {
			const parsed = extract(
				"https://example.com/_vercel/image?url=/image.jpg&w=800&q=75",
			);
			assertEquals(parsed, {
				src: "/image.jpg",
				operations: {
					width: 800,
					quality: 75,
				},
				options: {
					baseUrl: "https://example.com",
				},
			});
		},
	);
});

Deno.test("Vercel Image CDN - transform", async (t) => {
	await t.step("should transform a URL with new operations", () => {
		const result = transform(
			"/_vercel/image?url=/image.jpg&w=400&q=75",
			{ width: 800 },
			{},
		);
		assertEqualIgnoringQueryOrder(
			result,
			"/_vercel/image?url=/image.jpg&w=800&q=75",
		);
	});

	await t.step("should transform a relative URL with new operations", () => {
		const result = transform(relativeUrl, { w: 800 });
		assertEqualIgnoringQueryOrder(
			result,
			"/_vercel/image?url=/image.jpg&w=800&q=75",
		);
	});

	await t.step("should transform an absolute URL with new operations", () => {
		const result = transform(
			transformedUrl,
			{ w: 1200, q: 80 },
			{ baseUrl },
		);
		assertEqualIgnoringQueryOrder(
			result,
			"https://example.com/_vercel/image?url=/image.jpg&w=1200&q=80",
		);
	});
});
