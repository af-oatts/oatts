
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

/**
 * Content Security Policy Helper for SCORM Content
 * Provides utilities for securing iframe-loaded SCORM content
 */

export interface CSPConfig {
  allowInlineScripts?: boolean;
  allowInlineStyles?: boolean;
  allowedDomains?: string[];
  reportUri?: string;
  enforceHttps?: boolean;
}

/**
 * Generates a secure CSP header for SCORM content iframes
 */
export function generateSCORMCSP(config: CSPConfig = {}): string {
  const {
    allowInlineScripts = false,
    allowInlineStyles = true,
    allowedDomains = ["use.typekit.net", "fonts.googleapis.com", "fonts.gstatic.com"],
    reportUri,
    enforceHttps = true,
  } = config;

  const policies: string[] = [
    "default-src 'self'",

    // Script sources - be restrictive for SCORM content
    allowInlineScripts
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:"
      : "script-src 'self' blob: data:",

    // Style sources - SCORM often needs inline styles
    allowInlineStyles
      ? `style-src 'self' 'unsafe-inline' ${allowedDomains.map((d) => `https://${d}`).join(" ")}`
      : `style-src 'self' ${allowedDomains.map((d) => `https://${d}`).join(" ")}`,

    // Font sources
    `font-src 'self' ${allowedDomains.map((d) => `https://${d}`).join(" ")}`,

    // Image sources - SCORM content may have various image sources
    "img-src 'self' data: blob: https:",

    // Media sources
    "media-src 'self' blob: data:",

    // Connection sources - restrict API calls
    "connect-src 'self'",

    // Frame sources - prevent nested iframes in SCORM content
    "frame-src 'none'",

    // Worker sources
    "worker-src 'self' blob:",

    // Object sources - block plugins
    "object-src 'none'",

    // Base URI restriction
    "base-uri 'self'",

    // Form action restriction
    "form-action 'self'",

    // Prevent framing by external sites
    "frame-ancestors 'none'",
  ];

  if (enforceHttps) {
    policies.push("upgrade-insecure-requests");
  }

  if (reportUri) {
    policies.push(`report-uri ${reportUri}`);
  }

  return policies.join("; ");
}

/**
 * Sanitizes SCORM content by injecting CSP meta tag
 */
export function injectCSPIntoSCORMContent(htmlContent: string, cspPolicy: string): string {
  const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="${cspPolicy}">`;

  // Try to inject after existing meta charset tag
  if (htmlContent.includes("<meta charset")) {
    return htmlContent.replace(/(<meta charset[^>]*>)/i, `$1\n    ${cspMetaTag}`);
  }

  // Try to inject in head section
  if (htmlContent.includes("<head>")) {
    return htmlContent.replace("<head>", `<head>\n    ${cspMetaTag}`);
  }

  // Fallback: inject at the beginning of HTML
  return htmlContent.replace(/(<html[^>]*>)/i, `$1\n${cspMetaTag}`);
}

/**
 * Validates if a URL is allowed by the CSP policy
 */
export function isURLAllowedByCSP(url: string, allowedDomains: string[]): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Allow same origin
    if (urlObj.protocol === "blob:" || urlObj.protocol === "data:") {
      return true;
    }

    // Check against allowed domains
    return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * CSP violation reporting handler
 */
export function handleCSPViolation(violationReport: any): void {
  console.warn("CSP Violation detected:", {
    blockedURI: violationReport["blocked-uri"],
    violatedDirective: violationReport["violated-directive"],
    originalPolicy: violationReport["original-policy"],
    documentURI: violationReport["document-uri"],
    timestamp: new Date().toISOString(),
  });

  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService(violationReport);
}

/**
 * Sets up CSP violation event listener
 */
export function setupCSPViolationReporting(): void {
  document.addEventListener("securitypolicyviolation", (event) => {
    handleCSPViolation({
      "blocked-uri": event.blockedURI,
      "violated-directive": event.violatedDirective,
      "original-policy": event.originalPolicy,
      "document-uri": event.documentURI,
    });
  });
}
