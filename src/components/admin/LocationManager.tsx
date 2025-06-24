'use client';

import { useState, useEffect } from 'react';
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '@/lib/provinces';
import { locationManager, useLocationData } from '@/lib/locationManager';
import { useToast } from "@/hooks/useToast";
import { Button } from '@/components/ui/Button';

interface SyncProgress {
  current: number;
  total: number;
  status: string;
  phase: 'provinces' | 'districts' | 'wards' | 'complete';
}

export default function LocationManager() {
  const { provinces, getDistricts, getWards, stats, hasData, isStale } = useLocationData();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<SyncProgress>({
    current: 0,
    total: 0,
    status: '',
    phase: 'complete'
  });
  
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [syncMode, setSyncMode] = useState<'all' | 'districts-only'>('districts-only');
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Refresh component when location data changes
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const { showToast } = useToast();

  const syncAllProvinces = async () => {
    setLoading(true);
    setProgress({ current: 0, total: 1, status: 'Đang tải danh sách tỉnh thành...', phase: 'provinces' });
    
    try {
      const provinceList = await getProvinces();
      locationManager.updateCache({ provinces: provinceList });
      
      setProgress({ 
        current: 1, 
        total: 1, 
        status: `Đã tải ${provinceList.length} tỉnh thành`, 
        phase: 'complete' 
      });
      
      showToast('Đã đồng bộ ' + provinceList.length + ' tỉnh thành thành công!', 'default');
      refreshData();
      
    } catch (error) {
      showToast('Lỗi khi đồng bộ tỉnh thành: ' + (error instanceof Error ? error.message : 'Unknown error'), 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const syncAllDistricts = async () => {
    if (provinces.length === 0) {
      showToast('Vui lòng đồng bộ tỉnh thành trước!', 'destructive');
      return;
    }

    setLoading(true);
    setProgress({ 
      current: 0, 
      total: provinces.length, 
      status: 'Bắt đầu đồng bộ quận huyện...', 
      phase: 'districts' 
    });

    try {
      const allDistricts: District[] = [];
      
      for (let i = 0; i < provinces.length; i++) {
        const province = provinces[i];
        setProgress({
          current: i + 1,
          total: provinces.length,
          status: `Đang tải quận huyện cho ${province.name}...`,
          phase: 'districts'
        });

        try {
          const districts = await getDistricts(province.code);
          allDistricts.push(...districts);
          
          // Add incremental update to show progress
          if (i % 5 === 0 || i === provinces.length - 1) {
            locationManager.addDistricts(allDistricts.slice());
            refreshData();
          }
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`Error fetching districts for ${province.name}:`, err);
        }
      }

      locationManager.addDistricts(allDistricts);
      
      setProgress({
        current: provinces.length,
        total: provinces.length,
        status: `Hoàn thành! Đã đồng bộ ${allDistricts.length} quận huyện`,
        phase: 'complete'
      });

      showToast('Đã đồng bộ ' + allDistricts.length + ' quận huyện thành công!', 'default');
      refreshData();

    } catch (error) {
      showToast('Lỗi khi đồng bộ quận huyện: ' + (error instanceof Error ? error.message : 'Unknown error'), 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const syncWardsForDistrict = async (district: District) => {
    setLoading(true);
    setProgress({
      current: 0,
      total: 1,
      status: `Đang tải phường xã cho ${district.name}...`,
      phase: 'wards'
    });

    try {
      const wards = await getWards(district.code);
      locationManager.addWards(wards);
      
      setProgress({
        current: 1,
        total: 1,
        status: `Đã tải ${wards.length} phường xã cho ${district.name}`,
        phase: 'complete'
      });

      showToast(`Đã tải ${wards.length} phường xã cho ${district.name}`, 'default');
      refreshData();

    } catch (error) {
      showToast('Lỗi khi tải phường xã: ' + (error instanceof Error ? error.message : 'Unknown error'), 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const syncAllData = async () => {
    await syncAllProvinces();
    if (!loading) {
      await syncAllDistricts();
    }
  };

  const exportData = () => {
    try {
      const data = locationManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `location_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Đã xuất dữ liệu thành công!', 'default');
    } catch (error) {
      showToast('Lỗi khi xuất dữ liệu: ' + (error instanceof Error ? error.message : 'Unknown error'), 'destructive');
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      showToast('Vui lòng nhập dữ liệu JSON!', 'destructive');
      return;
    }

    const success = locationManager.importData(importData);
    if (success) {
      showToast('Đã nhập dữ liệu thành công!', 'default');
      setShowImportModal(false);
      setImportData('');
      refreshData();
    } else {
      showToast('Dữ liệu JSON không hợp lệ!', 'destructive');
    }
  };

  const clearCache = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã lưu?')) {
      locationManager.clearCache();
      showToast('Đã xóa cache thành công!', 'default');
      refreshData();
    }
  };

  const getProgressColor = () => {
    switch (progress.phase) {
      case 'provinces': return 'bg-blue-600';
      case 'districts': return 'bg-green-600';
      case 'wards': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" key={refreshKey}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                🗺️ Quản lý Địa điểm Việt Nam
              </h1>
              <p className="text-gray-600">
                Đồng bộ và quản lý toàn bộ dữ liệu tỉnh thành - quận huyện - phường xã
              </p>
            </div>
            
            {hasData() && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Trạng thái dữ liệu</div>
                <div className={`font-medium ${isStale() ? 'text-orange-600' : 'text-green-600'}`}>
                  {isStale() ? '⚠️ Cần cập nhật' : '✅ Mới nhất'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProvinces}</div>
              <div className="text-sm text-gray-600">Tỉnh/Thành phố</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.totalDistricts}</div>
              <div className="text-sm text-gray-600">Quận/Huyện</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.totalWards}</div>
              <div className="text-sm text-gray-600">Phường/Xã</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm font-medium text-gray-700">Cập nhật cuối</div>
              <div className="text-xs text-gray-500">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('vi-VN') : 'Chưa có'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={syncAllProvinces}
              disabled={loading}
              variant="secondary"
            >
              {loading && progress.phase === 'provinces' ? '🔄 Đang tải...' : '🏙️ Đồng bộ tỉnh thành'}
            </Button>
            
            <Button
              onClick={syncAllDistricts}
              disabled={loading || provinces.length === 0}
              variant="secondary"
            >
              {loading && progress.phase === 'districts' ? '🔄 Đang tải...' : '🏘️ Đồng bộ quận huyện'}
            </Button>

            <Button
              onClick={syncAllData}
              disabled={loading}
              variant="secondary"
            >
              {loading ? '🔄 Đang đồng bộ...' : '🔄 Đồng bộ tất cả'}
            </Button>
            
            <div className="h-8 border-l border-gray-300 mx-1"></div>
            
            <Button
              onClick={exportData}
              disabled={!hasData()}
              variant="outline"
            >
              📥 Xuất dữ liệu
            </Button>
            
            <Button
              onClick={() => setShowImportModal(true)}
              variant="default"
            >
              📤 Nhập dữ liệu
            </Button>
            
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Xóa cache
            </button>
          </div>

          {/* Progress */}
          {loading && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{progress.status}</span>
                <span className="text-sm text-gray-600">
                  {progress.total > 0 && `${progress.current}/${progress.total}`}
                </span>
              </div>
              {progress.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Browser */}
        {hasData() && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Duyệt dữ liệu</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Provinces */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <span className="mr-2">🏙️</span>
                  Tỉnh/Thành phố ({provinces.length})
                </h3>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {provinces.map((province) => {
                    const districtCount = getDistricts(province.code).length;
                    return (
                      <div
                        key={province.code}
                        onClick={() => setSelectedProvince(province)}
                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedProvince?.code === province.code ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="font-medium text-sm">{province.name}</div>
                        <div className="text-xs text-gray-500">
                          {districtCount} quận/huyện
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Districts */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <span className="mr-2">🏘️</span>
                  Quận/Huyện {selectedProvince && `- ${selectedProvince.name}`}
                </h3>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {selectedProvince ? (
                    getDistricts(selectedProvince.code).length > 0 ? (
                      getDistricts(selectedProvince.code).map((district) => {
                        const wardCount = getWards(district.code).length;
                        return (
                          <div
                            key={district.code}
                            onClick={() => setSelectedDistrict(district)}
                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedDistrict?.code === district.code ? 'bg-green-50 border-green-200' : ''
                            }`}
                          >
                            <div className="font-medium text-sm">{district.name}</div>
                            <div className="text-xs text-gray-500 flex items-center justify-between">
                              <span>{wardCount} phường/xã</span>
                              {wardCount === 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    syncWardsForDistrict(district);
                                  }}
                                  disabled={loading}
                                  className="text-blue-600 hover:underline text-xs disabled:opacity-50"
                                >
                                  Tải
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <div>Chưa có dữ liệu quận/huyện</div>
                        <button
                          onClick={() => syncAllDistricts()}
                          disabled={loading}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Đồng bộ ngay
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Chọn tỉnh/thành phố để xem quận/huyện
                    </div>
                  )}
                </div>
              </div>

              {/* Wards */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <span className="mr-2">🏠</span>
                  Phường/Xã {selectedDistrict && `- ${selectedDistrict.name}`}
                </h3>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {selectedDistrict ? (
                    getWards(selectedDistrict.code).length > 0 ? (
                      getWards(selectedDistrict.code).map((ward) => (
                        <div
                          key={ward.code}
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-sm">{ward.name}</div>
                          <div className="text-xs text-gray-500">Mã: {ward.code}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <div>Chưa có dữ liệu phường/xã</div>
                        <button
                          onClick={() => syncWardsForDistrict(selectedDistrict)}
                          disabled={loading}
                          className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          Tải dữ liệu
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Chọn quận/huyện để xem phường/xã
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">📤 Nhập dữ liệu JSON</h3>
            </div>
            <div className="p-6">
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON data here..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Nhập dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 