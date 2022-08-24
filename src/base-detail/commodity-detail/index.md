---
title: 商品明细
order: 1
nav:
  title: 最佳实践
  order: 1
  path: /practices
group:
  title: 基础详情页
  order: 1
  path: /practices/detail1
---

## 代码（参照原件销售）

<div style="display: flex;">

<image src="./images/commodity-detail.png" style="width: 375px; height: 320px; margin-right: 50px;" />

```tsx
import { Description } from '@fruits-chain/react-native-xiaoshu';
import React, { memo } from 'react';
import type { FC } from 'react';

import { GreyCard, SkuDesc, TotalAmount } from '@/components/_business/commodity-bak';
import Space from '@/components/_business/space';
import DetailCard from '@/components/detail-card';
import UploadPreview from '@/components/upload/preview';
import { CommodityType } from '@/const/enums/commodity';
import { StockOutType } from '@/const/enums/store';

import type { StockOutAuditDetailData } from '../../../../typing';
import { getOutOrderQuantityLabel, getOutOrderQuantityText } from '../../../utils';

interface IProps {
  data: StockOutAuditDetailData;
}

const CommodityDetail: FC<IProps> = ({ data }) => {
  // 是否展示副/小单位转换关系
  const showConversion = [CommodityType.RAW_MATERIAL, CommodityType.ASSIST].includes(
    data?.commodityTypeId,
  );
  return (
    <DetailCard
      title="商品明细"
      headerJustify="space-between"
      extra={
        !!data?.totalPrice && (
          <TotalAmount label="合计" unit="元" highlight>
            {data.totalPrice}
          </TotalAmount>
        )
      }
      space={16}
    >
      {data?.commodityList?.map((item, index) => {
        const imageList =
          item.photos?.map((photo, photoIndex) => ({
            filename: photo + index,
            key: photoIndex.toString(),
            fileId: photoIndex.toString(),
            fileUrl: photo,
          })) || [];
        return (
          <GreyCard key={index}>
            <SkuDesc
              name={item.commodityName}
              specDesc={item.skuTextDescription}
              numberOfLines={0}
            />
            <Space size={16}>
              <Description.Group
                size="s"
                style={{
                  marginTop: 8,
                }}
              >
                {!!item.batchCode && <Description label="批次号">{item?.batchCode}</Description>}
                {!!item?.belongCustomerName && (
                  <Description label="所属客户">{item?.belongCustomerName}</Description>
                )}
                {showConversion && !!item.totalTypeName && (
                  <Description label="换算单位">
                    1{item.totalTypeName}={item.conversion}
                    {item.unitTypeName}
                  </Description>
                )}
                <Description
                  label={
                    data?.outOrderType === StockOutType.TRANSFER_OUT_APPLY
                      ? '调拨量'
                      : getOutOrderQuantityLabel(data?.outOrderType)
                  }
                  bold
                >
                  {getOutOrderQuantityText(item as Required<typeof item>, 'wait').join('，')}
                </Description>
                <Description label="已出库量" bold>
                  {item.totalTypeName
                    ? `${item?.outStockFinishTotalQuantity ?? 0}${item.totalTypeName}，`
                    : ''}
                  {item?.outStockFinishUnitQuantity ?? 0}
                  {item.unitTypeName}
                </Description>
                {!!item.unitTotalPrice && (
                  <TotalAmount label="小计" unit="元" justifyContent="flex-end">
                    {item.unitTotalPrice}
                  </TotalAmount>
                )}
              </Description.Group>
              {item.photos?.length > 0 && <UploadPreview list={imageList} />}
            </Space>
          </GreyCard>
        );
      })}
    </DetailCard>
  );
};

export default memo(CommodityDetail);
```

</div>
