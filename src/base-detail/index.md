---
title: 详情
order: 2
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

<image src="./images/sale-base-detail.png" style="width: 375px; height: 824px; margin-right: 50px;" />

```tsx
import { useApolloClient } from '@apollo/client';
import React, { useCallback } from 'react';
import type { FC } from 'react';
import { ScrollView } from 'react-native';

import Space from '@/components/_business/space';
import BottomBar from '@/components/bottom-bar';
import OrderStatus from '@/components/primary-status/order-status';
import SkeletonProgress from '@/components/skeleton/progress';
import { RequestFlag } from '@/graphql/generated/types';
import type {
  OutOrderLogQueryVariables,
  OutOrderLogQuery,
} from '@/graphql/operations/production/__generated__/record.generated';
import { OutOrderLogDocument } from '@/graphql/operations/production/__generated__/record.generated';
import { useStockOutDetailQuery } from '@/graphql/operations/store/__generated__/stock-out.generated';
import { useStatusBar } from '@/hooks';
import useNavigationHeaderCustomColor from '@/hooks/useNavigationHeaderCustomColor';
import useNavigationResume from '@/hooks/useNavigationResume';
import type { RootStackScreenProps } from '@/router';
import { timestamp2time } from '@/utils/time';
import Toast from '@/utils/toast';

import BaseInfo from './components/base-info';
import CommodityDetail from './components/commodity-detail';

type ScreenProps = RootStackScreenProps<'STOCK_OUT_AUDIT_DETAIL'>;
interface IProps extends ScreenProps {}

const StockOutAuditDetail: FC<IProps> = ({ navigation, route }) => {
  useStatusBar('light-content', true);
  useNavigationHeaderCustomColor();

  const { id } = route.params;

  /** 获取页面数据（详情+出库记录条数） */
  const {
    loading,
    error,
    data: allData,
    refetch: refetchAllData,
  } = useStockOutDetailQuery({
    variables: {
      outOrderInput: { outOrderId: id, requestFlag: RequestFlag.Audit },
      countOutStockRecordInput: {
        outOrderId: id,
      },
    },
  });

  // 刷新数据
  const refreshData = useCallback(() => {
    const closeLoading = Toast.loading('加载中...');
    refetchAllData()?.finally(closeLoading);
  }, [refetchAllData]);

  // 从其他页面回来重新获取数据
  useNavigationResume(refreshData);
  const data = allData?.outOrder;

  const client = useApolloClient();
  // 获取操作日志请求
  const logRequest = useCallback(() => {
    return client
      .query<OutOrderLogQuery, OutOrderLogQueryVariables>({
        query: OutOrderLogDocument,
        variables: {
          outOrderId: id,
        },
      })
      .then((resp) => {
        return (resp?.data?.outOrderLog || []).map((item) => ({
          title: item.outOrderLogTypeText,
          description: item.createUserName,
          timer: timestamp2time(item.createTime),
        }));
      });
  }, [client, id]);

  return (
    <SkeletonProgress loading={loading} fail={!!error}>
      {/* 状态 */}
      <OrderStatus
        statusName={data?.outOrderStatusName}
        errDescription={data?.errorDescription}
        onRequestLog={logRequest}
      />

      <ScrollView>
        <Space lead tail>
          {/* 基本信息 */}
          <BaseInfo data={data} />
          {/* 商品明细 */}
          <CommodityDetail data={data} />
        </Space>
      </ScrollView>

      {/* 底部操作bar */}
      <BottomBar
        buttonList={[
          {
            children: '驳回订单',
          },
          {
            children: '去出库',
          },
        ]}
      />
    </SkeletonProgress>
  );
};

export default StockOutAuditDetail;
```

</div>
