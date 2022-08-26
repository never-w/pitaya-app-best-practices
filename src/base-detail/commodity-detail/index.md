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

## 代码（参照出库审核）

<div style="display: flex;">

<image src="./images/commodity-detail.png" style="width: 375px; height: 350px; margin-right: 50px;" />

```tsx
import { Description } from '@fruits-chain/react-native-xiaoshu';
import React, { memo } from 'react';
import type { FC } from 'react';

import { GreyCard, SkuDesc } from '@/components/_business/commodity-bak';
import Space from '@/components/_business/space';
import DetailCard from '@/components/detail-card';
import { StockOutType } from '@/const/enums/store';

import type { StockOutAuditDetailData } from '../../../../typing';
import { getOutOrderQuantityLabel, getOutOrderQuantityText } from '../../../utils';

interface IProps {
  data: StockOutAuditDetailData;
}

const CommodityDetail: FC<IProps> = ({ data }) => {
  return (
    <DetailCard title="商品明细" headerJustify="space-between" space={16}>
      {data?.commodityList?.map((item, index) => {
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
                <Description label="批次号">{item?.batchCode}</Description>
                <Description label="换算单位">
                  1{item.totalTypeName}={item.conversion}
                  {item.unitTypeName}
                </Description>
                <Description label="待出库量" bold>
                  {item.totalTypeName
                    ? `${item?.outStockFinishTotalQuantity ?? 0}${item.totalTypeName}，`
                    : ''}
                  {item?.outStockFinishUnitQuantity ?? 0}
                  {item.unitTypeName}
                </Description>
                <Description label="已出库量" bold>
                  {item.totalTypeName
                    ? `${item?.outStockFinishTotalQuantity ?? 0}${item.totalTypeName}，`
                    : ''}
                  {item?.outStockFinishUnitQuantity ?? 0}
                  {item.unitTypeName}
                </Description>
              </Description.Group>
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
