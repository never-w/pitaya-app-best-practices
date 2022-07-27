---
title: 列表项
order: 1
nav:
  title: 最佳实践
  order: 1
  path: /practices
group:
  title: 列表页情况一
  order: 0
  path: /practices/list1
---

## 代码（参照销售退货）

<div style="display: flex;">

<image src="./images/sale-return-list-item.png" style="width: 351px; height: 372px; margin-right: 50px;" />

```tsx
import { Description } from '@fruits-chain/react-native-xiaoshu';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { Text } from 'react-native';

import ListCard from '@/components/_bailu-bate/card';
import { CommodityTag } from '@/components/_business';
import { Summary, SummaryItem } from '@/components/_business/commodity-bak';
// 具体状态颜色map，到时统一在该目录下去创建
import { SALE_RETURN_ORDER_STATUS_TEXT_COLOR_MAP } from '@/config/style';
import { InOrderStatus } from '@/graphql/generated/types';
import type { RootStackScreenProps } from '@/router';
// 时间戳转为时间工具函数
import { timestamp2time } from '@/utils/time';

import type { PageSaleReturnList } from '../..';

type SummaryDataItem = PageSaleReturnList['commodities'][0];
type ScreenProps = RootStackScreenProps<'SALE_RETURN_LIST'>;
interface IProps {
  itemData: PageSaleReturnList;
}

const ListItem: FC<IProps> = ({ itemData }) => {
  const navigation = useNavigation<ScreenProps['navigation']>();

  const renderSummaryItem = useCallback((item: SummaryDataItem, index: number) => {
    return (
      <SummaryItem
        key={index}
        name={item?.commoditySku?.commodityName}
        specs={item?.commoditySku?.commoditySpecOptionName}
        counts={
          item?.returnQuantity?.totalQuantity
            ? [
                item?.returnQuantity?.totalQuantity + item?.totalType?.unitName,
                item?.returnQuantity?.unitQuantity + item?.unitType?.unitName,
              ]
            : [item?.returnQuantity?.unitQuantity + item?.unitType?.unitName]
        }
      />
    );
  }, []);
  const isNoCancel = itemData?.inOrderStatus !== InOrderStatus.Canceled;

  return (
    <ListCard
      onPress={() => {
        navigation.navigate('SALE_RETURN_DETAIL', {
          id: itemData?.inOrderId,
        });
      }}
      title="销售退货单"
      titleLeftExtra={<CommodityTag commodityTypeId={itemData?.commodityTypeId} />}
      extra={
        <Text style={SALE_RETURN_ORDER_STATUS_TEXT_COLOR_MAP[itemData?.inOrderStatus]}>
          {itemData?.inOrderStatusName}
        </Text>
      }
      footer={`创建人：${itemData?.createUser?.userName} ${timestamp2time(itemData?.createTime)}`}
    >
      <Description.Group size="l" colon={false} labelWidth={92}>
        <Description label="退货单号" text={itemData?.inOrderCode} />
        <Description label="所属仓库" text={itemData?.warehouse?.warehouseName} />
        <Description label="所属客户" text={itemData?.customer?.customerName} />
        <Description label="销售日期" text={dayjs(itemData?.saleTime).format('YYYY-MM-DD')} />
        <Description
          label="驳回原因"
          hidden={!(isNoCancel && itemData?.latestDescription)}
          text={itemData?.latestDescription}
          color="#FF3341"
        />
      </Description.Group>
      <Summary<SummaryDataItem>
        marginTop={12}
        data={itemData?.commodities || []}
        renderItem={renderSummaryItem}
      />
    </ListCard>
  );
};

export default ListItem;
```

</div>
