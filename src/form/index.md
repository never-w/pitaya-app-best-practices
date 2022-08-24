---
title: 表单
order: 2
nav:
  title: 最佳实践
  order: 1
  path: /practices
group:
  title: 动态表单
  order: 2
  path: /practices/commodity-selection
---

## 代码（次品销售选择商品）

<div style="display: flex;">

<image src="./images/form-img.png" style="width: 375px; height: 1328px; margin-right: 50px;" />

```tsx
import type { FormInstance } from '@fruits-chain/react-native-xiaoshu';
import {
  Divider,
  Blank,
  Cell,
  NumberInput,
  Space,
  Field,
  Form,
} from '@fruits-chain/react-native-xiaoshu';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
// import * as NP from 'number-precision' 用于数字金钱计算重要使用
import type { FC } from 'react';
import React from 'react';
import { Text, View } from 'react-native';

import { Deletable, FieldItem } from '@/components/_business/commodity-bak';
import ButtonPlus from '@/components/button-plus';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import Upload from '@/components/upload';
import EStyleSheet from '@/lib/react-native-extended-stylesheet';
import type { RootStackParamList } from '@/router';

import type { Commodity } from '声明单个商品的类型路径';

interface IProps {
  form: FormInstance;
  isWarehouseEditable?: boolean;
}

const PAY_MODE_LIST = [
  {
    label: '微信',
    value: 10, // 这里的10是为了模版代码使用，具体枚举值看后段的返回
  },
  {
    label: '支付宝',
    value: 20,
  },
  {
    label: '转账',
    value: 30,
  },
  {
    label: '刷卡',
    value: 40,
  },
];

const Form: FC<IProps> = ({ form }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'xxxx'>>();

  // 仓库数据, 这里一般要请求接口具体接口要问后端要，我这里是模版所以不需要业务接口
  const warehouseListOptions = [{ label: 'xx', value: 10 }];

  return (
    <KeyboardAwareScrollView>
      <Form form={form}>
        <Cell title="商品类型" value="次品销售" />
        <Form.Item name="warehouseId" rules={[{ required: true, message: '请选择所属仓库！' }]}>
          <Field.Selector
            required
            title="所属仓库"
            placeholder="请选择"
            options={warehouseListOptions}
          />
        </Form.Item>
        <Form.Item name="saleTime" rules={[{ required: true, message: '请选择销售日期！' }]}>
          <Field.Date
            min={new Date(+dayjs().subtract(2, 'd'))}
            max={new Date(+dayjs().subtract(0, 'd'))}
            mode="Y-D"
            required
            title="销售日期"
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item name="payMethod" rules={[{ required: true, message: '请选择收款方式！' }]}>
          <Field.ButtonOption title="收款方式" required vertical options={PAY_MODE_LIST} />
        </Form.Item>
        <Form.Item name="remark">
          <Field.TextInput
            vertical
            title="备注"
            maxLength={200}
            placeholder="请输入备注信息（200字内）"
          />
        </Form.Item>
        <Form.List
          name="xxxxItems"
          rules={[
            {
              validator(_, value) {
                // 这里是验证商品选择没有，没有选择则不通过校验
                if (!value || value?.length === 0) {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject('请选择商品！');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { remove }) => {
            const xxxxItemsValues = form.getFieldValue('xxxxItems');

            return (
              <>
                <Space head={12} gap={0}>
                  {fields.map((field, index) => {
                    return (
                      <Form.Item key={xxxxItemsValues?.[index]?.commoditySkuId} shouldUpdate>
                        {({ getFieldValue }) => {
                          // 这里一般用于获取表单数据来填充选择的商品数据
                          const xxxValue = getFieldValue(['xxxxtems', field.name, 'xxxxxx']);

                          return (
                            <View style={styles.fff}>
                              <View style={styles.title}>
                                <Text style={styles.titleText}>{`商品名称`}</Text>
                                <Deletable
                                  onPress={() => {
                                    remove(index);
                                  }}
                                />
                              </View>
                              <Space head={12} tail={8} gap={8} style={styles.fff}>
                                <View style={styles.textBox}>
                                  <Text style={styles.text}>库存量：</Text>
                                  <Text style={styles.textC}>{`${库存量值}${小单位名称}`}</Text>
                                </View>
                                <Cell
                                  required
                                  innerStyle={styles.pV0}
                                  divider={false}
                                  title="销售数量"
                                  titleTextStyle={styles.cellTitle}
                                  value={
                                    <Form.Item
                                      name={[field.name, 'xxxuantity']}
                                      rules={[
                                        {
                                          validator(_, value) {
                                            if (!value) {
                                              // eslint-disable-next-line prefer-promise-reject-errors
                                              return Promise.reject('xxxxxx');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <NumberInput
                                        inputWidth={110}
                                        min={0}
                                        bordered
                                        limitDecimals={2}
                                        placeholder="请填写"
                                        textAlign="center"
                                        addonAfter={`${小单位名称}`}
                                      />
                                    </Form.Item>
                                  }
                                />
                                <Cell
                                  required
                                  innerStyle={styles.pV0}
                                  divider={false}
                                  title="销售单价"
                                  titleTextStyle={styles.cellTitle}
                                  value={
                                    <Form.Item
                                      name={[field.name, 'xxxPrice']}
                                      rules={[
                                        {
                                          validator(_, value) {
                                            if (!value) {
                                              // eslint-disable-next-line prefer-promise-reject-errors
                                              return Promise.reject('请填写销售单价！');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <NumberInput
                                        inputWidth={110}
                                        onChange={(price) => {
                                          // 这里用于当该输入框值改变会影响另一个输入框改变的联动效果
                                          // form.setFields([
                                          //   {
                                          //     name: [
                                          //       'defectiveItems',
                                          //       field.name,
                                          //       'saleTotalPrice',
                                          //     ],
                                          //     value: NP.round(
                                          //       NP.times(
                                          //         price || 0,
                                          //         quantity || 0,
                                          //       ),
                                          //       2,
                                          //     ),
                                          //   },
                                          // ])
                                        }}
                                        min={0}
                                        bordered
                                        limitDecimals={2}
                                        placeholder="请填写"
                                        textAlign="center"
                                        addonAfter={`元/${小单位名称}`}
                                      />
                                    </Form.Item>
                                  }
                                />
                                <Cell
                                  required
                                  innerStyle={styles.pV0}
                                  divider={false}
                                  title="销售总价"
                                  titleTextStyle={styles.cellTitle}
                                  value={
                                    <Form.Item
                                      name={[field.name, 'xxxPrice']}
                                      rules={[
                                        {
                                          validator(_, value) {
                                            if (!value) {
                                              // eslint-disable-next-line prefer-promise-reject-errors
                                              return Promise.reject('请填写销售总价！');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <NumberInput
                                        inputWidth={110}
                                        onChange={(totalPrice) => {
                                          // 同理上面的输入框，为了联动效果
                                          // form.setFields([
                                          //   {
                                          //     name: [
                                          //       'defectiveItems',
                                          //       field.name,
                                          //       'salePrice',
                                          //     ],
                                          //     value: NP.round(
                                          //       NP.divide(
                                          //         totalPrice || 0,
                                          //         quantity || 0,
                                          //       ),
                                          //       2,
                                          //     ),
                                          //   },
                                          // ])
                                        }}
                                        min={0}
                                        bordered
                                        limitDecimals={2}
                                        placeholder="请填写"
                                        textAlign="center"
                                        addonAfter="元"
                                      />
                                    </Form.Item>
                                  }
                                />
                              </Space>
                              <View style={[styles.pH12, styles.fff, styles.pB12]}>
                                <FieldItem label="拍照记录（至少1张图片）" required vertical>
                                  <Form.Item
                                    name={[field.name, 'xxxphotos']}
                                    rules={[
                                      {
                                        required: true,
                                        message: '请至少上传1张图片！',
                                      },
                                    ]}
                                  >
                                    <Upload
                                      defaultList={photosList} // 默认展示的照片数组
                                      tipText="图片"
                                      mediaType="photo"
                                    />
                                  </Form.Item>
                                </FieldItem>
                              </View>
                              {index !== fields.length - 1 && (
                                <View style={styles.pH12}>
                                  <Divider />
                                </View>
                              )}
                            </View>
                          );
                        }}
                      </Form.Item>
                    );
                  })}
                </Space>
                <Blank bottom={12} left={0} right={0}>
                  <ButtonPlus
                    text="添加商品"
                    topBorder
                    onPress={() => {
                      navigation.navigate('xxxx_COMMODITY_SELECTION', {
                        defaultValues: form.getFieldValue('xxxxItems') || [],
                        callback: (commodities: Commodity[]) => {
                          form.setFields([{ name: 'xxxxItems', value: commodities }]);
                          navigation.goBack();
                        },
                      });
                    }}
                  />
                </Blank>
              </>
            );
          }}
        </Form.List>
      </Form>
    </KeyboardAwareScrollView>
  );
};

const styles = EStyleSheet.create({
  pV0: {
    paddingVertical: 0,
  },
  pH12: {
    paddingHorizontal: 12,
  },
  fff: {
    backgroundColor: '#fff',
  },
  pB12: {
    paddingBottom: 12,
  },
  cellTitle: {
    fontSize: 15,
    lineHeight: 21,
    color: '#5A6068',
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: 'bold',
    color: '#11151A',
  },
  textBox: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: '#5A6068',
  },
  textC: {
    fontSize: 16,
    lineHeight: 22,
    color: '#11151A',
    fontWeight: 'bold',
  },
});
export default Form;
```

</div>
