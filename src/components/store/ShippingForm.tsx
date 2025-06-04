'use client'

import { useState, useEffect } from 'react'
import ShippingInfo from './ShippingInfo'
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '@/lib/provinces'
import { useCart } from '@/context/CartContext'

interface AddressForm {
  city: string;
  district: string;
  ward: string;
  address: string;
}

const carriers = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    price: 30000,
    estimatedTime: '2-3 ngày'
  },
  {
    id: 'express',
    name: 'Giao hàng nhanh',
    price: 50000,
    estimatedTime: '1-2 ngày'
  }
]

export default function ShippingForm() {
  const { cartItems } = useCart()
  const [addressForm, setAddressForm] = useState<AddressForm>({
    city: '',
    district: '',
    ward: '',
    address: ''
  })
  const [selectedCarrier, setSelectedCarrier] = useState('')
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const data = await getProvinces()
        setProvinces(data)
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  const fetchDistricts = async (provinceCode: number) => {
    try {
      setLoadingDistricts(true)
      setDistricts([])
      setWards([])
      const data = await getDistricts(provinceCode)
      setDistricts(data)
    } catch (error) {
      console.error('Error fetching districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  const fetchWards = async (districtCode: number) => {
    try {
      setLoadingWards(true)
      setWards([])
      const data = await getWards(districtCode)
      setWards(data)
    } catch (error) {
      console.error('Error fetching wards:', error)
    } finally {
      setLoadingWards(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <ShippingInfo
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        selectedCarrier={selectedCarrier}
        setSelectedCarrier={setSelectedCarrier}
        carriers={carriers}
        provinces={provinces}
        districts={districts}
        wards={wards}
        loadingProvinces={loadingProvinces}
        loadingDistricts={loadingDistricts}
        loadingWards={loadingWards}
        showAddressDrawer={false}
        setShowAddressDrawer={() => {}}
        showShippingDrawer={false}
        setShowShippingDrawer={() => {}}
        fetchDistricts={fetchDistricts}
        fetchWards={fetchWards}
        note={note}
        setNote={setNote}
        cartItems={cartItems}
      />
    </div>
  )
} 