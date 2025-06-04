// GHN API configuration
const GHN_API = {
  DEVELOPMENT: 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2',
  PRODUCTION: 'https://online-gateway.ghn.vn/shiip/public-api/v2'
}

const GHN_TOKEN = process.env.NEXT_PUBLIC_GHN_TOKEN || ''
const GHN_SHOP_ID = parseInt(process.env.NEXT_PUBLIC_GHN_SHOP_ID || '0')

export interface GHNShippingFeeRequest {
  service_type_id: number;
  from_district_id: number;
  from_ward_code: string;
  to_district_id: number;
  to_ward_code: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  insurance_value: number;
  items: Array<{
    name: string;
    quantity: number;
    weight: number;
    length: number;
    width: number;
    height: number;
  }>;
}

interface GHNShippingFeeResponse {
  code: number;
  message: string;
  data: {
    total: number;
    service_fee: number;
    insurance_fee: number;
    pick_station_fee: number;
    coupon_value: number;
    r2s_fee: number;
    document_return: number;
    double_check: number;
    cod_fee: number;
    pick_remote_areas_fee: number;
    deliver_remote_areas_fee: number;
    cod_failed_fee: number;
  };
}

export const calculateShippingFee = async (params: GHNShippingFeeRequest): Promise<GHNShippingFeeResponse> => {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? GHN_API.PRODUCTION 
    : GHN_API.DEVELOPMENT

  try {
    const response = await fetch(`${apiUrl}/shipping-order/fee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': GHN_TOKEN,
        'ShopId': GHN_SHOP_ID.toString()
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error('Failed to calculate shipping fee')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error calculating shipping fee:', error)
    throw error
  }
}

// Sample data for testing
export const sampleShippingRequest: GHNShippingFeeRequest = {
  service_type_id: 2, // Standard delivery
  from_district_id: 1442, // Example district ID
  from_ward_code: "21211", // Example ward code
  to_district_id: 1820,
  to_ward_code: "030712",
  weight: 1000, // 1kg
  length: 30,
  width: 20,
  height: 15,
  insurance_value: 0,
  items: [
    {
      name: "Sample Product",
      quantity: 1,
      weight: 1000,
      length: 30,
      width: 20,
      height: 15
    }
  ]
} 