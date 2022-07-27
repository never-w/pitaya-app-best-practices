---
title: 搜索
order: 0
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

<image src="./images/sale-return-filter.png" style="width: 431px; height: 92px; margin-right: 50px;" />

```tsx
import type { FC } from 'react';
import React from 'react';

import useNavigationResume from '@/hooks/useNavigationResume';
import ListFilter from '@/components/list-filter';
import ListFilterBar from '@/components/list-filter/bar';
import RangeDateFilter from '@/components/list-filter/range-date-filter';
// 根据业务接口具体类型
import type { PageSaleReturnInput } from '@/graphql/generated/types';
// 根据接口具体枚举类型
import { InOrderStatus } from '@/graphql/generated/types';
// 具体接口
import { useCountSaleReturnQuery } from '@/graphql/operations/sell/__generated__/return.generated';

interface IProps {
  value: PageSaleReturnInput;
  onChange: (data: PageSaleReturnInput) => void;
}

const Filter: FC<IProps> = ({ value, onChange }) => {
  const { data, refetch } = useCountSaleReturnQuery({
    variables: {
      countSaleReturnInput: {
        returnTime: value?.timeRange,
        inOrderType: value?.inOrderType,
      },
    },
  });
  useNavigationResume(refetch);

  const statusArr = [
    { label: '全部', value: null },
    {
      label: '待提交',
      value: InOrderStatus.ToBeSubmit,
      number: data?.countSaleReturn?.toSubmit,
    },
    {
      label: '待入库',
      value: InOrderStatus.ToBeEnter,
      number: data?.countSaleReturn?.toInbound,
    },
    {
      label: '已完成',
      value: InOrderStatus.Finished,
    },
    {
      label: '已取消',
      value: InOrderStatus.Canceled,
    },
  ];

  return (
    <ListFilterBar>
      <RangeDateFilter
        widthLabel={42}
        label="时间"
        value={[value?.timeRange?.startTime, value?.timeRange?.endTime]}
        onChange={(times) => {
          onChange({
            ...value,
            timeRange: {
              startTime: times[0],
              endTime: times[1],
            },
          });
        }}
      />
      <ListFilter<InOrderStatus>
        widthLabel={38}
        options={statusArr}
        label="状态"
        value={value.orderStatus}
        onChange={(val) => {
          onChange({
            ...value,
            orderStatus: val,
          });
        }}
      />
    </ListFilterBar>
  );
};

export default Filter;
```

</div>
