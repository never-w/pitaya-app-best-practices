---
title: 基础表单
order: 2
nav:
  title: 最佳实践
  order: 1
  path: /practices
group:
  title: 基础表单
  order: 1
  path: /practices/base-form
---

## 代码（参照其他入库）

<div style="display: flex;">

<image src="./images/base-form.png" style="width: 375px; height: 324px; margin-right: 50px;" />

```tsx
import type { FormInstance } from '@fruits-chain/react-native-xiaoshu';
import { Field, Form } from '@fruits-chain/react-native-xiaoshu';
import React, { forwardRef, useImperativeHandle } from 'react';
import type { FC } from 'react';

import { FieldCustomerTree, FieldWarehouse } from '@/components/fields';
import { CommodityType } from '@/const/enums/commodity';
import { StockInType } from '@/const/enums/store';
import { InStoreCommoditiesPickerOptions } from '@/const/variables/store';
import { AllBusinessType } from '@/graphql/generated/types';

import type { IFormValue } from '../../../typing';
import { inStoreTitleType } from '../../list';

interface IProps {
  ref: React.Ref<FormInstance>;
  type: number;
  initialValues?: IFormValue;
}

const StockInForm: FC<IProps> = forwardRef(
  ({ type, initialValues }, ref: React.Ref<FormInstance>) => {
    const isOther = type === StockInType.OTHER_IN_APPLY;

    const [form] = Form.useForm();
    useImperativeHandle(ref, () => ({
      ...form,
    }));

    return (
      <Form form={form} initialValues={initialValues}>
        <Field.Text title="入库类型" value={inStoreTitleType[type]} />
        <Form.Item
          name="commodityTypeId"
          rules={[
            {
              required: true,
              message: '请填写商品类型',
            },
          ]}
        >
          <Field.Selector
            required
            title="商品类型"
            placeholder="请选择"
            options={InStoreCommoditiesPickerOptions}
          />
        </Form.Item>
        <Form.Item
          name="warehouseId"
          rules={[
            {
              required: true,
              message: '请选择所属仓库',
            },
          ]}
        >
          <FieldWarehouse required title="所属仓库" placeholder="请选择" />
        </Form.Item>
        <Form.Item shouldUpdate>
          {({ getFieldValue }) => {
            const commodityTypeId = getFieldValue('commodityTypeId');
            return (
              <>
                <Form.Item name="customerTypeId" />
                <Form.Item
                  name="customerId"
                  rules={[
                    {
                      required: true,
                      message: '请填写所属客户',
                    },
                  ]}
                >
                  <FieldCustomerTree
                    required
                    // 是次品的时候就是通用货品不能改
                    editable={commodityTypeId !== CommodityType.DEFECTIVE}
                    title="所属客户"
                    placeholder="请选择"
                    type={getFieldValue('customerTypeId')}
                    params={{
                      commodityType: commodityTypeId,
                      businessType: AllBusinessType.OtherInApply,
                    }}
                    onChange={(_, val) => {
                      form.setFieldsValue({
                        customerId: val?.value,
                        customerTypeId: val?.type,
                      });
                    }}
                  />
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
        <Form.Item
          name="inOrderDescription"
          rules={[
            {
              required: !!isOther,
              message: '请填写备注',
            },
          ]}
        >
          <Field.TextInput
            required={isOther}
            vertical
            title="备注"
            maxLength={200}
            placeholder="请输入备注信息（200字内）"
            divider={false}
          />
        </Form.Item>
      </Form>
    );
  },
);

export default StockInForm;
```

</div>
