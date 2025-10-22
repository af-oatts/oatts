import { useEffect, useCallback, useRef } from "react";

interface CSPViolationReport {
  blockedURI: string;
  violatedDirective: string;
  originalPolicy: string;
  documentURI: string;
  timestamp: string;
  userAgent: string;
}

interface CSPReportingConfig {
  enableConsoleLogging?: boolean;
  enableRemoteReporting?: boolean;
  reportEndpoint?: string;
  maxReportsPerSession?: number;
}

/**
 * Custom hook for CSP violation reporting and monitoring
 */
export function useCSPReporting(config: CSPReportingConfig = {}) {
  const {
    enableConsoleLogging = true,
    enableRemoteReporting = false,
    reportEndpoint = "/api/csp-violations",
    maxReportsPerSession = 50,
  } = config;

  const reportCount = useRef(0);

  const handleViolation = useCallback(
    (event: SecurityPolicyViolationEvent) => {
      // Prevent spam reporting
      if (reportCount.current >= maxReportsPerSession) {
        return;
      }

      reportCount.current++;

      const report: CSPViolationReport = {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        documentURI: event.documentURI,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      if (enableConsoleLogging) {
        console.warn("🚨 CSP Violation Detected:", {
          blocked: report.blockedURI,
          directive: report.violatedDirective,
          document: report.documentURI,
          count: reportCount.current,
        });
      }

      if (enableRemoteReporting && reportEndpoint) {
        sendViolationReport(report, reportEndpoint);
      }

      // Store violation in session storage for debugging
      storeViolationLocally(report);
    },
    [enableConsoleLogging, enableRemoteReporting, reportEndpoint, maxReportsPerSession],
  );

  const sendViolationReport = async (report: CSPViolationReport, endpoint: string) => {
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error("Failed to send CSP violation report:", error);
    }
  };

  const storeViolationLocally = (report: CSPViolationReport) => {
    try {
      const existingReports = JSON.parse(sessionStorage.getItem("csp-violations") || "[]");
      existingReports.push(report);

      // Keep only the last 20 reports to prevent storage bloat
      const recentReports = existingReports.slice(-20);
      sessionStorage.setItem("csp-violations", JSON.stringify(recentReports));
    } catch (error) {
      console.error("Failed to store CSP violation locally:", error);
    }
  };

  const getStoredViolations = useCallback((): CSPViolationReport[] => {
    try {
      return JSON.parse(sessionStorage.getItem("csp-violations") || "[]");
    } catch {
      return [];
    }
  }, []);

  const clearStoredViolations = useCallback(() => {
    sessionStorage.removeItem("csp-violations");
    reportCount.current = 0;
  }, []);

  useEffect(() => {
    document.addEventListener("securitypolicyviolation", handleViolation);

    return () => {
      document.removeEventListener("securitypolicyviolation", handleViolation);
    };
  }, [handleViolation]);

  return {
    getStoredViolations,
    clearStoredViolations,
    reportCount: reportCount.current,
  };
}

/**
 * Hook for monitoring iframe CSP violations specifically
 */
export function useIframeCSPMonitoring(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const { getStoredViolations } = useCSPReporting({
    enableConsoleLogging: true,
    enableRemoteReporting: false,
  });

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      try {
        // Monitor iframe content for CSP violations
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.addEventListener("securitypolicyviolation", (event) => {
            console.warn("🚨 Iframe CSP Violation:", {
              source: "iframe",
              blocked: event.blockedURI,
              directive: event.violatedDirective,
              iframe: iframe.src,
            });
          });
        }
      } catch (error) {
        // Cross-origin iframe - can't access content
        console.log("Cannot monitor cross-origin iframe for CSP violations");
      }
    };

    iframe.addEventListener("load", handleIframeLoad);

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [iframeRef]);

  return { getStoredViolations };
}
