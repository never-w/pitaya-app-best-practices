---
title: 商品选择
order: 1
nav:
  title: 最佳实践
  order: 1
  path: /practices
group:
  title: 商品选择
  order: 1
  path: /practices/commodity-selection
---

## 代码（参照销售退货）

<div style="display: flex;">

<image src="./images/commodity-selection1.png" style="width: 351px; height: 677px; margin-right: 50px;" />

```tsx
import {
  Button,
  Description,
  NumberInput,
  Space,
  Tag,
  Toast,
} from '@fruits-chain/react-native-xiaoshu';
import dayjs from 'dayjs';
import * as NP from 'number-precision';
import type { FC } from 'react';
import React, { useMemo, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { FieldItem } from '@/components/_business/commodity-bak';
import BottomBar from '@/components/bottom-bar';
import { ConfigListCard, ConfigListItemRadio } from '@/components/config-list-item';
import SkeletonPage from '@/components/skeleton/page';
import type { ListSaleReturnCommoditiesQuery } from '@/graphql/operations/sell/__generated__/return.generated';
import { useListSaleReturnCommoditiesQuery } from '@/graphql/operations/sell/__generated__/return.generated';
import useDefaultStatusBar from '@/hooks/_business/useDefaultStatusBar';
import EStyleSheet from '@/lib/react-native-extended-stylesheet';
import type { RootStackScreenProps } from '@/router';

enum ChangeType {
  total = 'TOTAL',
  unit = 'UNIT',
  active = 'ACTIVE',
}

type ScreenProps = RootStackScreenProps<'SALE_RETURN_SELECTION_COMMODITIES'>;
type OnChangeType = 'TOTAL' | 'UNIT' | 'ACTIVE';
export type ListSaleCommodity =
  ListSaleReturnCommoditiesQuery['listSaleReturnCommodities'][0]['commodities'][0] & {
    active?: boolean;
    returnTotalQuantity?: number;
    returnUnitQuantity?: number;
  };
export type ListSaleReturnValues = Omit<
  ListSaleReturnCommoditiesQuery['listSaleReturnCommodities'][0],
  'commodities'
> & {
  commodities?: ListSaleCommodity[];
};
interface IProps extends ScreenProps {}

const SaleReturnSelection: FC<IProps> = ({ navigation, route }) => {
  useDefaultStatusBar();
  const {
    inOrderId,
    outOrderId,
    warehouseId,
    customerDistributionId,
    saleTime,
    commoditiesListValues,
    callback,
  } = route.params;
  const [commoditiesData, setCommoditiesData] = useState<ListSaleReturnValues[]>([]);

  // 请求商品接口
  const { data, loading, refetch } = useListSaleReturnCommoditiesQuery({
    variables: {
      listSaleReturnCommoditiesInput: {
        warehouseId,
        customerDistributionId,
        saleTime,
        inOrderId,
        outOrderId,
      },
    },
  });

  // 格式化商品数据
  const commoditiesValues = useMemo(() => {
    return data?.listSaleReturnCommodities?.map((item) => ({
      ...item,
      commodities: item?.commodities?.map((v) => ({
        ...v,
        saleReturnableQuantity:
          // 当可退货量小于0时，展示为0
          v?.saleReturnableQuantity < 0 ? 0 : v?.saleReturnableQuantity,
        active: false,
        returnTotalQuantity: undefined,
        returnUnitQuantity: undefined,
      })),
    }));
  }, [data?.listSaleReturnCommodities]);

  // 输入框值和点击选中按钮的改变事件
  const onChangeInputValue = (
    v: number | boolean,
    index: number,
    index2: number,
    type: OnChangeType,
    // eslint-disable-next-line max-params
  ) => {
    setCommoditiesData((preV) => {
      return preV?.map((item, itemIndex) => {
        if (itemIndex === index) {
          return {
            ...item,
            commodities: item?.commodities?.map((commodityItem, commodityItemIndex) => {
              if (commodityItemIndex === index2) {
                switch (type) {
                  case ChangeType.total:
                    return {
                      ...commodityItem,
                      returnTotalQuantity: v as number,
                    };
                  case ChangeType.unit:
                    return {
                      ...commodityItem,
                      returnUnitQuantity: v as number,
                    };
                  default:
                    return {
                      ...commodityItem,
                      active: v as boolean,
                    };
                }
              }
              return commodityItem;
            }),
          };
        }
        return {
          ...item,
          commodities: item?.commodities?.map((commodityItem) => {
            return commodityItem;
          }),
        };
      });
    });
  };

  // 确认事件
  const onConfirm = () => {
    const tmp = commoditiesData
      ?.map((item) => {
        if (item?.commodities?.some((value) => value?.active === true)) {
          return {
            ...item,
            commodities: item?.commodities
              ?.map((commodityItem) => {
                if (commodityItem?.active) return commodityItem;
                return undefined;
              })
              .filter(Boolean),
          };
        }
        return undefined;
      })
      .filter(Boolean);

    if (tmp?.length === 0) {
      return Toast('请选择商品！');
    }

    for (const itemTmp of tmp) {
      for (const {
        commoditySku,
        returnTotalQuantity,
        returnUnitQuantity,
        saleReturnableQuantity,
        // eslint-disable-next-line no-unsafe-optional-chaining
      } of itemTmp?.commodities) {
        if (!returnTotalQuantity) {
          return Toast(
            `[${itemTmp?.customer?.customerName}-${commoditySku?.commodityName}]请填写本次退货量！`,
          );
        }

        if (returnTotalQuantity > saleReturnableQuantity) {
          return Toast(
            `[${itemTmp?.customer?.customerName}-${commoditySku?.commodityName}]本次退货量，不可大于可退货量！`,
          );
        }
        if (!returnUnitQuantity) {
          return Toast(
            `[${itemTmp?.customer?.customerName}-${commoditySku?.commodityName}]请填写本次退货量！`,
          );
        }
      }
    }

    callback(tmp);
    navigation.goBack();
  };

  useEffect(() => {
    // 筛选列表页过来已经被选中的默认商品数据
    const newValues = commoditiesValues?.map((item) => {
      const tmpNum = commoditiesListValues?.findIndex((v) => v?.outOrderId === item?.outOrderId);
      const commodityValueItem = tmpNum === -1 ? null : commoditiesListValues?.[tmpNum];

      if (tmpNum > -1) {
        return {
          ...item,
          commodities: item?.commodities?.map((commodityItem) => {
            const tmpIndex = commodityValueItem?.commodities?.findIndex(
              // eslint-disable-next-line max-nested-callbacks
              (v) =>
                v?.commoditySku?.commoditySkuId === commodityItem?.commoditySku?.commoditySkuId,
            );
            const tmpValue = tmpIndex === -1 ? null : commodityValueItem?.commodities?.[tmpIndex];

            if (tmpIndex > -1) {
              if (commodityItem?.saleReturnableQuantity === 0) {
                return {
                  ...commodityItem,
                  active: false,
                  returnTotalQuantity: undefined,
                  returnUnitQuantity: undefined,
                };
              }
              return {
                ...commodityItem,
                active: tmpValue?.active,
                returnTotalQuantity: tmpValue?.returnTotalQuantity,
                returnUnitQuantity: tmpValue?.returnUnitQuantity,
              };
            }
            return commodityItem;
          }),
        };
      }
      return item;
    });

    setCommoditiesData(newValues || []);
  }, [commoditiesListValues, commoditiesValues]);

  /**
   * 只能选择同一个销售单里面的商品
   */
  const currOutOrderId = useMemo(() => {
    let _currOutOrderId = null;
    commoditiesData.find((item) => {
      return item.commodities.find((item1) => {
        if (item1.active) {
          _currOutOrderId = item.outOrderId;
          return true;
        }
        return false;
      });
    });
    return _currOutOrderId;
  }, [commoditiesData]);

  return (
    <SkeletonPage loading={loading} onPressReload={refetch}>
      <ScrollView>
        <View style={styles.main}>
          <Space head tail>
            {commoditiesData?.map((item, index) => {
              return (
                <ConfigListCard
                  key={item?.outOrderId}
                  titleIcon={<Tag size="m">{item?.customer?.customerName?.substring(0, 1)}</Tag>}
                  title={item?.customer?.customerName}
                  headerJsx={
                    <Description.Group>
                      <Description
                        label="销售日期"
                        text={dayjs(item?.saleTime).format('YYYY-MM-DD')}
                      />
                      <Description label="销售单号" text={item?.outOrderCode} />
                    </Description.Group>
                  }
                >
                  {item?.commodities?.map((commodity, index2) => {
                    // 当可退货量为“0”时，则将此选项置灰，不允许进行选择
                    const orderIsDisabled = currOutOrderId && item.outOrderId !== currOutOrderId;
                    // 当可退货量小于等于"0"时，该选项也不可选择
                    const isDisabledItem =
                      commodity?.saleReturnableQuantity === 0 ||
                      orderIsDisabled ||
                      commodity?.saleReturnableQuantity < 0;
                    return (
                      <TouchableOpacity
                        key={commodity?.commoditySku?.commoditySkuId}
                        disabled={orderIsDisabled}
                        onPress={() => {
                          if (!isDisabledItem) {
                            onChangeInputValue(
                              !commodity?.active,
                              index,
                              index2,
                              ChangeType.active,
                            );
                            // 当该商品置灰清空商品数据
                            if (!commodity?.active === false) {
                              onChangeInputValue(undefined, index, index2, ChangeType.total);
                              onChangeInputValue(undefined, index, index2, ChangeType.unit);
                            }
                          }
                        }}
                        activeOpacity={EStyleSheet.value('$active_opacity')}
                      >
                        <ConfigListItemRadio
                          titleTextSty={styles.fw}
                          title={`${
                            commodity?.commoditySku?.commodityName
                          } ${commodity?.commoditySku?.commoditySpecOptionName?.join(' ')}`}
                          border
                          active={isDisabledItem ? false : commodity?.active}
                          showRadio={isDisabledItem ? false : true}
                        >
                          <Space head={8}>
                            <Description.Group>
                              <Description
                                label="换算单位"
                                text={`1${commodity?.totalType?.unitName}=${commodity?.commoditySku?.conversion}${commodity?.unitType?.unitName}`}
                              />
                              <Description
                                label="出库总量"
                                text={
                                  commodity?.outBoundTotalQuantity?.toString() +
                                  commodity?.totalType?.unitName
                                }
                              />
                              <Description
                                label="已退货量"
                                text={
                                  commodity?.saleReturnFinishedTotalQuantity?.toString() +
                                  commodity?.totalType?.unitName
                                }
                              />
                              <Description
                                label="可退货量"
                                text={
                                  commodity?.saleReturnableQuantity?.toString() +
                                  commodity?.totalType?.unitName
                                }
                              />
                              <FieldItem label="本次退货量">
                                <NumberInput
                                  min={0}
                                  bordered
                                  limitDecimals={4}
                                  placeholder="请输入"
                                  textAlign="center"
                                  editable={commodity?.active}
                                  onChange={(v) => {
                                    if (!isDisabledItem) {
                                      // 选中商品才能进行change事件
                                      if (commodity?.active) {
                                        onChangeInputValue(v, index, index2, ChangeType.total);
                                        onChangeInputValue(
                                          NP.times(
                                            v || 0,
                                            commodity?.commoditySku?.conversion || 0,
                                          ),
                                          index,
                                          index2,
                                          ChangeType.unit,
                                        );
                                      }
                                    }
                                  }}
                                  value={commodity?.returnTotalQuantity}
                                  addonAfter={commodity?.totalType?.unitName}
                                />
                                <NumberInput
                                  min={0}
                                  bordered
                                  limitDecimals={4}
                                  placeholder="请输入"
                                  textAlign="center"
                                  editable={commodity?.active}
                                  onChange={(v) => {
                                    if (!isDisabledItem) {
                                      // 选中商品才能进行change事件
                                      if (commodity?.active) {
                                        onChangeInputValue(v, index, index2, ChangeType.unit);
                                      }
                                    }
                                  }}
                                  value={commodity?.returnUnitQuantity}
                                  addonAfter={commodity?.unitType?.unitName}
                                />
                              </FieldItem>
                            </Description.Group>
                          </Space>
                        </ConfigListItemRadio>
                      </TouchableOpacity>
                    );
                  })}
                </ConfigListCard>
              );
            })}
          </Space>
        </View>
      </ScrollView>
      <BottomBar alone>
        <Button
          onPress={() => {
            onConfirm();
          }}
        >
          确定
        </Button>
      </BottomBar>
    </SkeletonPage>
  );
};

const styles = EStyleSheet.create({
  main: {
    marginHorizontal: 12,
    marginTop: 6,
  },
  fw: {
    fontWeight: 'bold',
  },
});

export default SaleReturnSelection;
```

</div>
