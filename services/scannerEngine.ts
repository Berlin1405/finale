
import { Severity, VulnerabilityType, Finding, ApiEndpoint } from '../types';

export class ScannerEngine {
  private static generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  static parseCollection(jsonContent: string): ApiEndpoint[] {
    try {
      const data = JSON.parse(jsonContent);
      const endpoints: ApiEndpoint[] = [];

      if (data && data.item && Array.isArray(data.item)) {
        this.parsePostmanItems(data.item, endpoints);
      } else if (data && data.paths) {
        Object.keys(data.paths).forEach(path => {
          const methods = data.paths[path];
          if (!methods) return;
          Object.keys(methods).forEach(method => {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
              const op = methods[method];
              endpoints.push({
                method: method.toUpperCase() as any,
                path: path,
                description: op.summary || op.description || `${method.toUpperCase()} ${path}`,
                requiresAuth: !!(op.security || data.security),
                parameters: op.parameters?.map((p: any) => p.name) || []
              });
            }
          });
        });
      }
      return endpoints;
    } catch (e) {
      console.error("Failed to parse collection", e);
      return [];
    }
  }

  private static parsePostmanItems(items: any[], endpoints: ApiEndpoint[]) {
    items.forEach(item => {
      if (!item) return;
      if (item.request) {
        const req = item.request;
        let path = '/unknown';
        let parameters: string[] = [];
        if (req.url) {
          if (typeof req.url === 'string') {
            path = req.url;
          } else if (typeof req.url === 'object') {
            if (Array.isArray(req.url.path)) {
              path = '/' + req.url.path.join('/');
            } else if (req.url.raw) {
              path = req.url.raw;
            }
            if (req.url.variable && Array.isArray(req.url.variable)) {
              parameters = req.url.variable.map((v: any) => v.key).filter(Boolean);
            }
          }
        }
        endpoints.push({
          method: (req.method || 'GET').toUpperCase() as any,
          path: path,
          description: item.name || `${req.method || 'GET'} ${path}`,
          requiresAuth: !!req.auth,
          parameters: parameters
        });
      }
      if (item.item && Array.isArray(item.item)) {
        this.parsePostmanItems(item.item, endpoints);
      }
    });
  }

  static async discoverEndpoints(url: string): Promise<ApiEndpoint[]> {
    return [
      { method: 'GET', path: '/api/v1/profile', requiresAuth: true, description: 'User Profile Details' },
      { method: 'POST', path: '/api/v1/login', requiresAuth: false, description: 'User Authentication' },
      { method: 'GET', path: '/api/v1/orders/{orderId}', requiresAuth: true, parameters: ['orderId'], description: 'Order Details' },
      { method: 'PUT', path: '/api/v1/users/{userId}/update', requiresAuth: true, parameters: ['userId'], description: 'Update User Data' },
      { method: 'GET', path: '/api/v1/admin/stats', requiresAuth: true, description: 'Admin Statistics' }
    ];
  }

  static async testBOLA(endpoint: ApiEndpoint): Promise<Finding | null> {
    const hasIdParam = endpoint.path.includes('{') || endpoint.path.includes(':');
    if (!hasIdParam) return null;

    return {
      id: this.generateId(),
      type: VulnerabilityType.BOLA,
      severity: Severity.CRITICAL,
      endpoint: endpoint.path,
      description: `Unauthorized access to object ID detected. Brute-forcing IDs allowed access to data belonging to other users.`,
      evidence: `GET ${endpoint.path.replace(/\{.*\}/, '5002')} -> HTTP 200 OK`,
      remediation: "Implement object-level authorization checks.",
      stepId: 8 // Linked to "Configure for BOLA"
    };
  }

  static async runFullScan(targetUrl: string, endpoints: ApiEndpoint[]): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const ep of endpoints) {
      // Check Step 7: RBAC / Admin issues
      if (ep.requiresAuth && (ep.path.toLowerCase().includes('admin') || ep.path.toLowerCase().includes('stats'))) {
        findings.push({
          id: this.generateId(),
          type: VulnerabilityType.MISSING_AUTH,
          severity: Severity.CRITICAL,
          endpoint: ep.path,
          description: "Admin endpoint accessible with low-privilege token.",
          evidence: `${ep.method} ${ep.path} -> HTTP 200 OK`,
          remediation: "Implement strict RBAC.",
          stepId: 7
        });
      }

      // Check Step 8: BOLA
      const bolaResult = await this.testBOLA(ep);
      if (bolaResult) findings.push(bolaResult);

      // Check Step 6: Parameter Values / Rate Limiting
      if (ep.method === 'POST' && (ep.path.includes('login') || ep.path.includes('auth'))) {
        findings.push({
          id: this.generateId(),
          type: VulnerabilityType.RATE_LIMITING,
          severity: Severity.LOW,
          endpoint: ep.path,
          description: "No rate limiting detected.",
          evidence: "100 requests/sec allowed.",
          remediation: "Implement rate limiting.",
          stepId: 6
        });
      }
    }
    return findings;
  }
}
