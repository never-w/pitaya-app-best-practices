---
title: 商品选择
order: 1
nav:
  title: 最佳实践
  order: 1
  path: /practices
group:
  title: 动态表单
  order: 1
  path: /practices/commodity-selection
---

## 代码（次品销售选择商品）

<div style="display: flex;">

<image src="./images/commodity.png" style="width: 351px; height: 677px; margin-right: 50px;" />

```tsx
import React from 'react';
import type { FC } from 'react';
import { Text, View } from 'react-native';
import { Description } from '@fruits-chain/react-native-xiaoshu';

import SelectPage from '@/components/select-page';
import useDefaultStatusBar from '@/hooks/_business/useDefaultStatusBar';
import type { RootStackScreenProps } from '@/router';
import EStyleSheet from '@/lib/react-native-extended-stylesheet';

export type Commodity = 这里是每一个商品的类型声明;
type ScreenProps = RootStackScreenProps<'xxxxxx'>;
interface IProps extends ScreenProps {}

const SelectionCommodity: FC<IProps> = ({ route }) => {
  useDefaultStatusBar();
  // 解构路由传过来的参数
  const { xxxx } = route.params;

  return (
    <SelectPage<Commodity>
      queryParams={{
        query: gqlDocument,
        variables: {
          gqlInput: {
            xxxKey: xxValue,
          },
        },
      }}
      multiple
      gqlKey="xxxKey"
      idKey="xxxId"
      defaultValues={xxx默认值} // 用于处理表单页面带过来的数据要在商品页面显示已经被选择的样式
      renderItem={({ item }) => {
        return (
          <View key={item.commoditySkuId}>
            <Text style={styles.title}>{item?.commodityName}</Text>
            <Description.Group size="m" labelStyle={styles.label} colon={false}>
              <Description label="库存量" text="xxValue" />
              <Description label="所属仓库" text="xxValue" />
            </Description.Group>
          </View>
        );
      }}
    />
  );
};
export default SelectionCommodity;

const styles = EStyleSheet.create({
  title: {
    fontSize: 16,
    color: '$text_color_1',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    width: 78,
  },
});
```

</div>
