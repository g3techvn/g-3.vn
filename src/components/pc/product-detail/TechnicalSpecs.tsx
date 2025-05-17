import React from 'react';
import * as Separator from '@radix-ui/react-separator';

interface Specification {
  name: string;
  value: string;
}

interface TechnicalSpecsProps {
  specifications: Specification[];
}

export function TechnicalSpecs({ specifications }: TechnicalSpecsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
      <div>
        {specifications.map((spec, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between py-3">
              <span className="font-semibold">{spec.name}</span>
              <span className="text-right">{spec.value}</span>
            </div>
            {index < specifications.length - 1 && (
              <Separator.Root className="h-px bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Default specifications for the chair product
export const defaultChairSpecs: Specification[] = [
  {
    name: 'Bộ điều khiển thông minh',
    value: 'Multi Button bằng nút'
  },
  {
    name: 'Cơ chế ngả',
    value: 'Ngả lưng lên tới 4 cấp, giữ khóa ngả ở mỗi cấp'
  },
  {
    name: 'Chất liệu lưới',
    value: 'Solidmesh USA (chứng chỉ OEKO-TEX® STANDARD 100)'
  },
  {
    name: 'Trượt mâm',
    value: 'Trượt tiến lùi biên độ 5cm'
  },
  {
    name: 'Chất liệu chân',
    value: 'Chân hợp kim nhôm bền bỉ chống rỉ'
  },
  {
    name: 'Điều chỉnh kháng lực + Trụ thủy lực',
    value: 'Cơ chế kháng lực Tension Control linh hoạt + Trụ thủy lực WITHUS Class 4'
  },
  {
    name: 'Tựa đầu',
    value: 'HeadFlex 8D thông minh'
  },
  {
    name: 'Tựa lưng',
    value: 'Butterfit 2D cánh bướm + 4 lò xo chỉnh lên xuống nhiều nấc ôm trọn thắt lưng'
  },
  {
    name: 'Kê tay',
    value: 'Xoay360 độ giúp đỡ khuỷ tay tốt nhất'
  }
]; 