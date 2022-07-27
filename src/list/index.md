---
title: 列表
order: 2
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

<image src="./images/sale-return-list.png" style="width: 375px; height: 824px; margin-right: 50px;" />

```tsx
import { ButtonBar } from '@fruits-chain/react-native-xiaoshu';
import { useUpdateEffect } from 'ahooks';
import type { FC } from 'react';
import React, { useRef, useState } from 'react';

import Button from '@/components/_bailu-bate/button';
import type { PagingInstance } from '@/components/paging';
import PagingGQL from '@/components/paging/gql';
// 具体接口参数类型
import type { PageSaleReturnInput } from '@/graphql/generated/types';
// 具体枚举类型
import { InOrderType } from '@/graphql/generated/types';
// 具体接口返回体类型
import type { PageSaleReturnQuery } from '@/graphql/operations/sell/__generated__/return.generated';
// 具体接口
import { PageSaleReturnDocument } from '@/graphql/operations/sell/__generated__/return.generated';
import useDefaultStatusBar from '@/hooks/_business/useDefaultStatusBar';
import useNavigationSearch from '@/hooks/useNavigationSearch';
import type { RootStackScreenProps } from '@/router';
// 默认时间段工具函数
import { getStartEndDayjs } from '@/utils/time';

import Filter from './components/filter';
import ListItem from './components/list-item';

export type PageSaleReturnList = PageSaleReturnQuery['pageSaleReturn']['records'][0];
type ScreenProps = RootStackScreenProps<'SALE_RETURN_LIST'>;
interface IProps extends ScreenProps {}

const SaleReturnList: FC<IProps> = ({ navigation }) => {
  useDefaultStatusBar();

  const defaultTime = getStartEndDayjs();
  const [paramsData, setParamsData] = useState<PageSaleReturnInput>({
    inOrderType: InOrderType.SalesReturn,
    orderStatus: null,
    timeRange: {
      startTime: +defaultTime[0],
      endTime: +defaultTime[1],
    },
  });

  const pagingRef = useRef<PagingInstance<PageSaleReturnInput>>();

  useUpdateEffect(() => {
    pagingRef.current.setParams((oldParams) => ({
      ...oldParams,
      ...paramsData,
    }));
    pagingRef.current.reload();
  }, [paramsData]);

  // 设置搜索按钮
  useNavigationSearch(() => {
    navigation.navigate('SALE_RETURN_SEARCH');
  });

  const renderItem = ({ item }: { item: PageSaleReturnList }) => <ListItem itemData={item} />;

  return (
    <>
      <Filter value={paramsData} onChange={setParamsData} />
      <PagingGQL<PageSaleReturnList, PageSaleReturnInput>
        ref={pagingRef}
        gql={PageSaleReturnDocument}
        // 具体接口返回体key值
        gqlKey="pageSaleReturn"
        defaultParams={paramsData}
        // 具体接口参数key值
        gqlParamKey="pageSaleReturnInput"
        keyExtractor={(item) => item?.inOrderId}
        renderItem={renderItem}
      />
      <ButtonBar alone>
        <Button
          iconPlus
          onPress={() => {
            navigation.navigate('SALE_RETURN_CREATE');
          }}
        >
          新增销售退货
        </Button>
      </ButtonBar>
    </>
  );
};

export default SaleReturnList;
```

</div>
