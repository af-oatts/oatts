# Content Security Policy (CSP) Hardening Guide for OATTS

## Overview

This document provides comprehensive guidance for implementing and maintaining Content Security Policy (CSP) in the OATTS (Official AFOQT and TBAS Test-familiarization Software) application. OATTS is a Tauri-based React application that loads SCORM educational content in iframes, presenting unique security challenges.

## Current Security Implementation

### 1. Main Application CSP

The main application CSP is implemented in [`index.html`](../index.html) with the following policy:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net;
  font-src 'self' https://fonts.gstatic.com https://use.typekit.net;
  img-src 'self' data: blob: https:;
  media-src 'self' blob: data:;
  connect-src 'self' ws://localhost:* wss://localhost:* https://api.tauri.app;
  frame-src 'self' blob: data:;
  worker-src 'self' blob:;
  child-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
"
/>
```

### 2. Tauri Application CSP

The Tauri application CSP is configured in [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json):

```json
{
  "security": {
    "csp": {
      "default-src": "'self'",
      "script-src": "'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
      "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net",
      "font-src": "'self' https://fonts.gstatic.com https://use.typekit.net",
      "img-src": "'self' data: blob: https:",
      "media-src": "'self' blob: data:",
      "connect-src": "'self' ws://localhost:* wss://localhost:* https://api.tauri.app tauri:",
      "frame-src": "'self' blob: data:",
      "worker-src": "'self' blob:",
      "child-src": "'self' blob:",
      "object-src": "'none'",
      "base-uri": "'self'",
      "form-action": "'self'",
      "frame-ancestors": "'none'"
    }
  }
}
```

## Security Features Implemented

### 1. SCORM Content Security

- **Iframe Sandboxing**: All SCORM content is loaded in sandboxed iframes with restricted permissions
- **CSP Helper Utilities**: [`src/utils/CSPHelper.ts`](../src/utils/CSPHelper.ts) provides tools for securing SCORM content
- **Content Sanitization**: Functions to inject CSP policies into SCORM HTML content

### 2. CSP Violation Monitoring

- **Real-time Reporting**: [`src/hooks/useCSPReporting.ts`](../src/hooks/useCSPReporting.ts) provides hooks for monitoring violations
- **Local Storage**: Violations are stored locally for debugging
- **Console Logging**: Detailed violation information in development

### 3. Enhanced Iframe Security

The [`ContentViewer.tsx`](../src/components/module/ContentViewer.tsx) component implements:

- **Sandbox Attributes**: `allow-scripts allow-same-origin allow-forms allow-popups allow-modals`
- **Referrer Policy**: `strict-origin-when-cross-origin`
- **Security Logging**: Content loading is logged for monitoring

## Security Recommendations

### 1. Immediate Actions

#### High Priority

- [ ] **Remove `'unsafe-inline'` and `'unsafe-eval'`** from script-src once SCORM content compatibility is verified
- [ ] **Implement nonce-based CSP** for inline scripts that cannot be moved to external files
- [ ] **Add CSP reporting endpoint** to collect violation reports in production
- [ ] **Audit SCORM content** for unnecessary external dependencies

#### Medium Priority

- [ ] **Implement Subresource Integrity (SRI)** for external resources
- [ ] **Add Content-Type validation** for loaded SCORM content
- [ ] **Implement rate limiting** for CSP violation reports
- [ ] **Add CSP policy validation** in CI/CD pipeline

### 2. Long-term Security Enhancements

#### Advanced CSP Features

```html
<!-- Example of stricter CSP for production -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.tauri.app;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  report-uri /api/csp-violations;
  require-trusted-types-for 'script';
"
/>
```

#### Trusted Types Implementation

```typescript
// Example implementation for Trusted Types
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const policy = window.trustedTypes.createPolicy("scorm-content", {
    createHTML: (input: string) => {
      // Sanitize SCORM HTML content
      return sanitizeHTML(input);
    },
    createScript: (input: string) => {
      // Validate and sanitize script content
      return validateScript(input);
    },
  });
}
```

### 3. SCORM-Specific Security

#### Content Validation

```typescript
// Validate SCORM content before loading
function validateSCORMContent(content: string): boolean {
  // Check for malicious patterns
  const dangerousPatterns = [
    /<script[^>]*src=["']https?:\/\/(?!allowed-domain\.com)/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(content));
}
```

#### Iframe Communication Security

```typescript
// Secure postMessage handling
window.addEventListener("message", (event) => {
  // Validate origin
  if (!isAllowedOrigin(event.origin)) {
    console.warn("Rejected message from unauthorized origin:", event.origin);
    return;
  }

  // Validate message structure
  if (!isValidSCORMMessage(event.data)) {
    console.warn("Rejected invalid SCORM message:", event.data);
    return;
  }

  // Process message
  handleSCORMMessage(event.data);
});
```

## Monitoring and Maintenance

### 1. CSP Violation Analysis

Regular review of CSP violations helps identify:

- Potential security threats
- Legitimate resources that need to be allowlisted
- Overly restrictive policies affecting functionality

### 2. Security Auditing

#### Monthly Tasks

- [ ] Review CSP violation reports
- [ ] Audit new SCORM content for security compliance
- [ ] Update allowlisted domains as needed
- [ ] Test CSP policies in staging environment

#### Quarterly Tasks

- [ ] Comprehensive security audit of CSP policies
- [ ] Review and update security documentation
- [ ] Penetration testing of iframe security
- [ ] Update CSP based on new threats and best practices

### 3. Emergency Response

#### CSP Bypass Detection

If CSP bypasses are detected:

1. Immediately tighten CSP policies
2. Audit affected SCORM content
3. Update security monitoring
4. Document incident and response

#### False Positive Handling

For legitimate CSP violations:

1. Analyze the violation context
2. Update CSP policy if necessary
3. Document the change rationale
4. Test thoroughly before deployment

## Development Guidelines

### 1. Adding New Features

When adding new features that might affect CSP:

- Test with strict CSP policies first
- Document any required CSP changes
- Use nonces for inline scripts when possible
- Prefer external files over inline content

### 2. SCORM Content Integration

For new SCORM content:

- Validate content security before integration
- Test with current CSP policies
- Document any required allowlist additions
- Implement content sanitization if needed

### 3. Third-party Dependencies

Before adding new dependencies:

- Evaluate security implications
- Check if CSP updates are needed
- Implement SRI for external resources
- Document security considerations

## Testing CSP Policies

### 1. Automated Testing

```typescript
// Example CSP testing
describe("CSP Policy Tests", () => {
  it("should block unauthorized script sources", async () => {
    const violation = await injectMaliciousScript();
    expect(violation).toBeDefined();
    expect(violation.violatedDirective).toBe("script-src");
  });

  it("should allow legitimate SCORM resources", async () => {
    const result = await loadSCORMContent(validContent);
    expect(result.success).toBe(true);
  });
});
```

### 2. Manual Testing

Regular manual testing should include:

- Loading various SCORM content types
- Testing iframe functionality
- Verifying external resource loading
- Checking violation reporting

## Conclusion

This CSP implementation provides a strong security foundation for OATTS while maintaining compatibility with SCORM content. Regular monitoring, updates, and adherence to these guidelines will ensure continued security effectiveness.

For questions or security concerns, consult the development team and consider engaging security professionals for complex scenarios.
