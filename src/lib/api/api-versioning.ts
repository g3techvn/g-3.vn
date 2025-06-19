import { NextRequest, NextResponse } from 'next/server';

export type ApiVersion = 'v1' | 'v2';

export interface VersionedEndpoint {
  version: ApiVersion;
  handler: (request: NextRequest) => Promise<NextResponse>;
  deprecated?: boolean;
  deprecationDate?: Date;
  migrationGuide?: string;
}

export class ApiVersionManager {
  private endpoints = new Map<string, Map<ApiVersion, VersionedEndpoint>>();
  private defaultVersion: ApiVersion = 'v1';

  registerEndpoint(path: string, versionedEndpoint: VersionedEndpoint): void {
    if (!this.endpoints.has(path)) {
      this.endpoints.set(path, new Map());
    }
    
    const pathMap = this.endpoints.get(path)!;
    pathMap.set(versionedEndpoint.version, versionedEndpoint);
  }

  getRequestedVersion(request: NextRequest): ApiVersion {
    // Check version from header first
    const versionHeader = request.headers.get('API-Version') || 
                         request.headers.get('X-API-Version');
    
    if (versionHeader && this.isValidVersion(versionHeader)) {
      return versionHeader as ApiVersion;
    }

    // Check version from query parameter
    const versionParam = request.nextUrl.searchParams.get('version');
    if (versionParam && this.isValidVersion(versionParam)) {
      return versionParam as ApiVersion;
    }

    // Check version from path prefix
    const pathVersion = this.extractVersionFromPath(request.nextUrl.pathname);
    if (pathVersion) {
      return pathVersion;
    }

    // Return default version
    return this.defaultVersion;
  }

  private isValidVersion(version: string): boolean {
    return ['v1', 'v2'].includes(version);
  }

  private extractVersionFromPath(pathname: string): ApiVersion | null {
    const versionMatch = pathname.match(/^\/api\/(v[12])\//);
    return versionMatch ? versionMatch[1] as ApiVersion : null;
  }

  async handleVersionedRequest(
    path: string, 
    request: NextRequest
  ): Promise<NextResponse> {
    const requestedVersion = this.getRequestedVersion(request);
    const pathMap = this.endpoints.get(path);

    if (!pathMap) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      );
    }

    const versionedEndpoint = pathMap.get(requestedVersion);
    
    if (!versionedEndpoint) {
      // Try to find closest available version
      const availableVersions = Array.from(pathMap.keys()).sort().reverse();
      const fallbackVersion = availableVersions[0];
      
      if (fallbackVersion) {
        const fallbackEndpoint = pathMap.get(fallbackVersion)!;
        const response = await fallbackEndpoint.handler(request);
        
        // Add warning header about version fallback
        response.headers.set('X-API-Version-Warning', 
          `Requested version ${requestedVersion} not available. Using ${fallbackVersion}.`);
        
        return response;
      }

      return NextResponse.json(
        { 
          error: 'API version not supported',
          availableVersions: availableVersions
        },
        { status: 400 }
      );
    }

    // Check if version is deprecated
    if (versionedEndpoint.deprecated) {
      const response = await versionedEndpoint.handler(request);
      
      response.headers.set('X-API-Deprecated', 'true');
      if (versionedEndpoint.deprecationDate) {
        response.headers.set('X-API-Deprecation-Date', 
          versionedEndpoint.deprecationDate.toISOString());
      }
      if (versionedEndpoint.migrationGuide) {
        response.headers.set('X-API-Migration-Guide', 
          versionedEndpoint.migrationGuide);
      }
      
      return response;
    }

    // Execute the handler
    const response = await versionedEndpoint.handler(request);
    
    // Add version header to response
    response.headers.set('X-API-Version', requestedVersion);
    
    return response;
  }
}

// Global instance
export const apiVersionManager = new ApiVersionManager();

// Utility function to create versioned response
export function createVersionedResponse(
  data: Record<string, unknown>, 
  version: ApiVersion,
  options?: {
    status?: number;
    headers?: Record<string, string>;
    deprecated?: boolean;
    migrationGuide?: string;
  }
): NextResponse {
  const response = NextResponse.json(data, {
    status: options?.status || 200,
    headers: options?.headers
  });

  response.headers.set('X-API-Version', version);
  
  if (options?.deprecated) {
    response.headers.set('X-API-Deprecated', 'true');
    if (options.migrationGuide) {
      response.headers.set('X-API-Migration-Guide', options.migrationGuide);
    }
  }

  return response;
}

// Helper to transform data between versions
export class DataTransformer {
  // Transform order data from v1 to v2 format
  static transformOrderV1ToV2(orderV1: Record<string, unknown>): Record<string, unknown> {
    return {
      id: orderV1.id,
      orderNumber: `ORD-${orderV1.id}`, // New in v2
      customer: {
        id: orderV1.user_id,
        name: orderV1.customer_name,
        phone: orderV1.customer_phone,
        email: orderV1.customer_email
      },
      shipping: {
        address: orderV1.shipping_address,
        fee: orderV1.shipping_fee
      },
      payment: {
        method: orderV1.payment_method,
        subtotal: orderV1.subtotal,
        total: orderV1.total_price,
        discount: {
          voucher: orderV1.voucher_discount || 0,
          points: orderV1.points_discount || 0
        }
      },
      status: orderV1.status,
      createdAt: orderV1.created_at,
      updatedAt: orderV1.updated_at
    };
  }

  // Transform order data from v2 to v1 format (for backward compatibility)
  static transformOrderV2ToV1(orderV2: Record<string, unknown>): Record<string, unknown> {
    const customer = orderV2.customer as Record<string, unknown>;
    const shipping = orderV2.shipping as Record<string, unknown>;
    const payment = orderV2.payment as Record<string, unknown>;
    const discount = payment.discount as Record<string, unknown>;
    
    return {
      id: orderV2.id,
      user_id: customer?.id,
      customer_name: customer?.name,
      customer_phone: customer?.phone,
      customer_email: customer?.email,
      shipping_address: shipping?.address,
      shipping_fee: shipping?.fee,
      payment_method: payment?.method,
      subtotal: payment?.subtotal,
      total_price: payment?.total,
      voucher_discount: discount?.voucher,
      points_discount: discount?.points,
      status: orderV2.status,
      created_at: orderV2.createdAt,
      updated_at: orderV2.updatedAt
    };
  }

  // Transform product data between versions
  static transformProductV1ToV2(productV1: Record<string, unknown>): Record<string, unknown> {
    return {
      ...productV1,
      metadata: {
        version: 'v2',
        lastUpdated: new Date().toISOString()
      },
      variants: (productV1.product_variants as Array<Record<string, unknown>> || []).map((variant) => ({
        id: variant.id,
        attributes: {
          color: variant.color,
          size: variant.size,
          weight: variant.weight,
          legRest: variant.gac_chan // Renamed for clarity in v2
        },
        pricing: {
          price: variant.price,
          originalPrice: variant.original_price
        },
        inventory: {
          sku: variant.sku,
          stock: variant.stock_quantity
        },
        media: {
          image: variant.image_url,
          gallery: variant.gallery_url
        }
      })) || []
    };
  }
} 