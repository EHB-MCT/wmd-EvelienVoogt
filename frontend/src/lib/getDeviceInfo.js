export function getDeviceInfo() {
	const ua = navigator.userAgent;
	const uaData = navigator.userAgentData;

	// --- DEVICE TYPE ---
	const device = uaData?.mobile
		? "mobile"
		: /Mobi|Android/i.test(ua)
		? "mobile"
		: "desktop";

	// --- BROWSER ---
	let browser = "unknown";

	if (uaData?.brands?.length) {
		browser = uaData.brands[0].brand;
	} else if (ua.includes("Chrome")) {
		browser = "Chrome";
	} else if (ua.includes("Firefox")) {
		browser = "Firefox";
	} else if (ua.includes("Safari")) {
		browser = "Safari";
	}

	// --- OS ---
	let os = "unknown";

	if (uaData?.platform) {
		os = uaData.platform;
	} else if (ua.includes("Win")) {
		os = "Windows";
	} else if (ua.includes("Mac")) {
		os = "macOS";
	} else if (ua.includes("Android")) {
		os = "Android";
	} else if (ua.includes("iPhone") || ua.includes("iPad")) {
		os = "iOS";
	} else if (ua.includes("Linux")) {
		os = "Linux";
	}

	return { device, browser, os };
}