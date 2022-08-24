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

## 代码（参照原件销售）

<div style="display: flex;">

<image src="./images/sale-base-detail.png" style="width: 375px; height: 824px; margin-right: 50px;" />

```tsx
import { useApolloClient } from '@apollo/client';
import React, { useCallback, useRef, useMemo } from 'react';
import type { FC } from 'react';
import { ScrollView } from 'react-native';

import CellInOutRecord from '@/components/_business/cell-in-out-record';
import Space from '@/components/_business/space';
import BottomBar from '@/components/bottom-bar';
import Dialog from '@/components/dialog';
import OrderStatus from '@/components/primary-status/order-status';
import SkeletonProgress from '@/components/skeleton/progress';
import { StockOutStatus, StockOutType } from '@/const/enums/store';
import { RequestFlag } from '@/graphql/generated/types';
import type {
  OutOrderLogQueryVariables,
  OutOrderLogQuery,
} from '@/graphql/operations/production/__generated__/record.generated';
import { OutOrderLogDocument } from '@/graphql/operations/production/__generated__/record.generated';
import {
  useStockOutDetailQuery,
  useRejectOutOrderAuditMutation,
  useFinishOutOrderMutation,
  useConfirmOutOrderStatisticsLazyQuery,
} from '@/graphql/operations/store/__generated__/stock-out.generated';
import { useStatusBar } from '@/hooks';
import useNavigationHeaderCustomColor from '@/hooks/useNavigationHeaderCustomColor';
import useNavigationResume from '@/hooks/useNavigationResume';
import { OutOrderType } from '@/pages/production/record/config';
import type { RootStackScreenProps } from '@/router';
import { timestamp2time } from '@/utils/time';
import Toast from '@/utils/toast';

import BaseInfo from './components/base-info';
import CommodityDetail from './components/commodity-detail';
import type { Handles as ManifestModalHandles } from './components/manifest-modal';
import ManifestModal from './components/manifest-modal';

type ScreenProps = RootStackScreenProps<'STOCK_OUT_AUDIT_DETAIL'>;
interface IProps extends ScreenProps {}

/**
 * 出库审核详情页面
 */
const StockOutAuditDetail: FC<IProps> = ({ navigation, route }) => {
  useStatusBar('light-content', true);
  useNavigationHeaderCustomColor();
  const { id, commodityTypeId } = route.params;
  const manifestModalRef = useRef<ManifestModalHandles>();
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
  const recordCount = allData?.countOutStockRecord;

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

  /** 驳回订单 */
  const [rejectMutation] = useRejectOutOrderAuditMutation();
  // 确认驳回订单
  const confirmToReject = useCallback(
    (text: string) => {
      const closeLoading = Toast.loading('提交中...');
      return rejectMutation({
        variables: {
          rejectOutOrderInput: {
            outOrderId: id,
            rejectDescription: text,
          },
        },
      })
        .then(() => {
          Toast.success('驳回成功！');
          // 调拨之类的订单一旦驳回就不存在，避免刷新接口报错，返回上一页
          navigation.goBack();
          return Promise.resolve(true);
        })
        .finally(closeLoading);
    },
    [id, navigation, rejectMutation],
  );
  // 驳回订单点击事件
  const handleReject = useCallback(() => {
    Dialog.input({
      title: '驳回订单',
      message: '订单驳回后，申请人员，\n可再次填写提交',
      confirmButtonText: '确认驳回',
      placeholder: '驳回原因（30个字以内）',
      textInput: { maxLength: 30 },
      type: 'textarea',
      onPressConfirm(text) {
        if (!text.trim()) {
          Toast.warn('请填写驳回原因');
          return false;
        }
        return confirmToReject(text);
      },
    });
  }, [confirmToReject]);

  /** 完成订单 */
  const [completeMutation] = useFinishOutOrderMutation();
  const [getOutOrderStatistics] = useConfirmOutOrderStatisticsLazyQuery();
  // 完成订单事件
  const handleComplete = () => {
    if (data.outOrderType === OutOrderType.FINISHED_PRODUCT_ACQUISITION) {
      getOutOrderStatistics({
        variables: { outOrderId: route.params?.id },
      }).then((res) => {
        if (res?.data?.confirmOutOrderStatistics) {
          manifestModalRef.current.open({
            data: res?.data?.confirmOutOrderStatistics,
          });
        }
      });
    } else {
      Dialog.confirm({
        message: '确定商品已完成出库？',
        confirmButtonText: '完成出库',
      })
        .then((action) => {
          if (action === 'confirm') {
            confirmToCompleteAction();
          }
        })
        .catch(() => {});
    }
  };

  /**
   * 查看出库记录
   */
  const viewRecord = useCallback(() => {
    // 其他出库跳转
    if (StockOutType.OTHER_ACQUISITION === data?.outOrderType) {
      navigation.navigate('TRANSFER_MANAGE_OUT_ORDER_RECORD', {
        id,
      });
    } else {
      navigation.navigate('STOCK_OUT_RECORD', {
        id,
      });
    }
  }, [data?.outOrderType, id, navigation]);

  const confirmToCompleteAction = useCallback(() => {
    const closeLoading = Toast.loading('提交中...');
    completeMutation({
      variables: {
        finishOutOrderInput: {
          outOrderId: id,
        },
      },
    })
      .then(() => {
        // 次品销售出库需要弹框提示生成了销售收入单
        if (data?.outOrderType === StockOutType.DEFECTIVE_SALE) {
          Dialog.confirm({
            message: '出库完成，已生成销售收入单，请联系销售人员及时去确认提交',
            confirmButtonText: '查看出库详情',
            cancelButtonText: '返回列表',
          }).then((action) => {
            if (action === 'confirm') {
              refreshData();
            } else {
              navigation.goBack();
            }
          });
        } else {
          Toast.success('提交成功');
          manifestModalRef.current.close();
          refreshData();
        }
      })
      .finally(closeLoading);
  }, [completeMutation, data?.outOrderType, id, navigation, refreshData]);
  const showFinishBtn = useMemo(() => {
    // 当是成品销售,订单状态为待出库，部分出库,并且计划出库量为0的时候允许完成出库
    if (
      data?.outOrderType === StockOutType.PRODUCT_DELIVERY &&
      [StockOutStatus.PARTIAL, StockOutStatus.PRE].includes(data?.outOrderStatus)
    ) {
      let waitNumFlag = true;
      data?.commodityList?.forEach((v) => {
        if (v.waitTotalQuantity !== 0 && v.waitUnitQuantity !== 0) {
          waitNumFlag = false;
        }
      });

      if (waitNumFlag) {
        return waitNumFlag;
      }
    }
    return (
      data?.outOrderStatus === StockOutStatus.PARTIAL &&
      // 成品配送出库会自动完成，不需要显示完成出库按钮
      data?.outOrderType !== StockOutType.PRODUCT_DELIVERY
    );
  }, [data]);

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
          {/* 出库记录数量及入口 */}
          <CellInOutRecord
            hidden={recordCount === 0}
            count={recordCount}
            type="out"
            onPress={viewRecord}
          />
        </Space>
      </ScrollView>
      {/* 完成任务清单弹框 */}
      <ManifestModal ref={manifestModalRef} onConfirmPress={confirmToCompleteAction} />
      {/* 底部操作bar */}
      <BottomBar
        buttonList={[
          {
            children: '驳回订单',
            onPress: handleReject,
            hidden: !(
              data?.outOrderStatus === StockOutStatus.PRE &&
              data?.outOrderType !== StockOutType.PRODUCT_DELIVERY
            ),
          },
          {
            children: '完成出库',
            onPress: handleComplete,
            hidden: !showFinishBtn,
          },
          {
            children: '去出库',
            onPress: () => {
              navigation.navigate('STOCK_OUT_ACTION', {
                id,
                commodityTypeId,
              });
            },
            hidden: ![StockOutStatus.PRE, StockOutStatus.PARTIAL].includes(data?.outOrderStatus),
          },
        ]}
      />
    </SkeletonProgress>
  );
};

export default StockOutAuditDetail;
```

</div>
