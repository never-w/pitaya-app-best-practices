---
title: 基础信息
order: 0
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

<image src="./images/base-info.png" style="width: 375px; height: 350px; margin-right: 50px;" />

```tsx
import { Description } from '@fruits-chain/react-native-xiaoshu';
import React, { memo } from 'react';
import type { FC } from 'react';

import { DetailCard } from '@/components/_bailu-bate';
import { StockOutType } from '@/const/enums/store';
import { formatCustomerName } from '@/utils/_business/customer';
import { timestamp2time } from '@/utils/time';

import type { StockOutAuditDetailData } from '../../../../typing';

interface IProps {
  data: StockOutAuditDetailData;
}

const BaseInfo: FC<IProps> = ({ data }) => {
  const customerLabel = data.outOrderType === StockOutType.ORIGINAL_SALE ? '销售客户' : '所属客户';

  return (
    <DetailCard title="基本信息">
      <Description.Group size="l" labelWidth={92} colon={false}>
        <Description label="出库单号">{data?.outOrderCode}</Description>
        <Description label="销售单号" hidden={data.outOrderType !== StockOutType.PRODUCT_DELIVERY}>
          {data?.saleOrderInfo?.saleOrderCode}
        </Description>
        <Description label="生产任务" hidden={!data?.taskCode}>
          {data?.taskCode}
        </Description>
        <Description label="出库类型">{data?.outOrderTypeName}</Description>
        <Description label="商品类型">{data?.commodityTypeName}</Description>
        <Description label="供应商" hidden={!data.supplierName}>
          {data.supplierName}
        </Description>
        <Description hidden={!data?.customerName} label={customerLabel}>
          {data?.customerName
            ? `${
                data.outOrderType === StockOutType.PRODUCT_DELIVERY
                  ? formatCustomerName(data.customerName, data.customerDistributionName)
                  : data.customerName
              }`
            : data?.customerTypeName}
        </Description>
        <Description
          label="所属仓库"
          hidden={!data?.warehouseName || data?.outOrderType === StockOutType.TRANSFER_OUT_APPLY}
        >
          {data?.warehouseName}
        </Description>
        <Description
          label="调入组织"
          hidden={data?.outOrderType !== StockOutType.TRANSFER_OUT_APPLY}
        >
          {data?.transferOrganizationName}
        </Description>
        <Description label="提交人员">
          {data?.createUserName + (data?.createUserPhone ? `/${data?.createUserPhone}` : '')}
        </Description>
        <Description label="提交时间">{timestamp2time(data?.createTime)}</Description>
        <Description label="备注信息" hidden={!data?.outOrderDescription}>
          {data?.outOrderDescription}
        </Description>
      </Description.Group>
    </DetailCard>
  );
};

export default memo(BaseInfo);
```

</div>
