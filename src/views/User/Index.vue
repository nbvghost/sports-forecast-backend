<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Table from '@/components/Table/src/Table.vue'
import { useTable } from '@/hooks/web/useTable'
import { h, nextTick, reactive, ref, unref } from 'vue'
import { TableColumn } from '@/components/Table'
import { formatTime } from '@/utils'
import {
  postSetSuperiorID,
  postUserAgent,
  postUserBrokerageLevel,
  postUserScoreRecharge,
  postUserState,
  putUserList
} from '@/api/user'
import { ElFormItem, ElInput, ElMessage, ElMessageBox, ElOption, ElSelect } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import Form from '@/components/Form/src/Form.vue'
import { BrokerageLevel, User, UserInfoStateType, UserWithSuperiorUser } from '@/api/user/types'
import Descriptions from '@/components/Descriptions/src/Descriptions.vue'
import { DescriptionsSchema } from '@/components/Descriptions'
import ScoreJournalList from '@/views/Components/ScoreJournalList.vue'
import { GetRestfull } from '@/api'

const { required } = useValidator()

type QueryParams = {
  ID?: number
  Phone?: string
  SuperiorID?: number
}
const queryParams = ref<QueryParams>({})

const userTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = userTable.tableState
    if (!queryParams.value.ID) {
      delete queryParams.value.ID
    }
    if (!queryParams.value.SuperiorID) {
      delete queryParams.value.SuperiorID
    }
    const res = await putUserList(
      queryParams.value,
      { ColumnName: '', Method: '' },
      currentPage.value,
      pageSize.value
    )
    return {
      list: res.Data.List,
      total: res.Data.Total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = userTable.tableState
const userTableMethods = userTable.tableMethods
const userColumns = reactive<TableColumn[]>([
  {
    field: 'ID',
    label: '#ID',
    width: 50,
    align: 'center'
  },
  {
    field: 'Name',
    label: '名称'
  },
  {
    field: 'Phone',
    label: '手机'
  },
  {
    field: 'Score',
    label: '球币'
  },
  {
    field: 'Portrait',
    label: '头像',
    slots: {
      default: ({ row }) => {
        return <el-image style="height:2rem" src={row.Portrait}></el-image>
      }
    }
  },
  {
    field: 'LastLoginAt',
    label: '最近登陆时间',
    slots: {
      default: ({ row }) => {
        return <>{formatTime(row.LastLoginAt)}</>
      }
    }
  },
  {
    field: 'SuperiorUser.Name',
    label: '上级',
    slots: {
      default: ({ row }) => {
        if (row.SuperiorUser.Name == '') {
          return <>平台</>
        } else {
          return (
            <>
              <el-button
                type="warning"
                size="small"
                class="me-2"
                onClick={() => {
                  setTopLevelUser(row)
                }}
              >
                挂靠平台
              </el-button>
              <span>{row.SuperiorUser.Name}</span>
            </>
          )
        }
      }
    }
  },
  {
    field: 'CreatedAt',
    label: '创建时间',
    slots: {
      default: ({ row }) => {
        return <>{formatTime(row.CreatedAt)}</>
      }
    }
  },
  {
    field: 'State',
    label: '状态',
    slots: {
      default: ({ row }) => {
        let userInfoKeys: string[] = row.UserInfoKeys || []
        let userInfoValues: string[] = row.UserInfoValues || []
        let keyIndex = userInfoKeys.findIndex(
          (value: string, _index: number, _obj: string[]) => value == 'State'
        )
        if (keyIndex > -1) {
          let value = userInfoValues[keyIndex]
          let valueLabel = `未知($value)`
          switch (value) {
            case '':
              valueLabel = '正常'
              break
            case 'closure':
              valueLabel = '封禁'
              break
          }
          return <span>{valueLabel}</span>
        } else {
          return <span>正常</span>
        }
      }
    }
  },
  {
    field: 'Agent',
    label: '代理',
    slots: {
      default: ({ row }) => {
        let userInfoKeys: string[] = row.UserInfoKeys || []
        let userInfoValues: string[] = row.UserInfoValues || []
        let keyIndex = userInfoKeys.findIndex(
          (value: string, _index: number, _obj: string[]) => value == 'Agent'
        )
        if (keyIndex > -1) {
          let value = userInfoValues[keyIndex] == 'true'
          return (
            <el-switch
              onChange={() => {
                onAgentUser(row)
              }}
              modelValue={value}
            />
          )
        } else {
          return (
            <el-switch
              onChange={() => {
                onAgentUser(row)
              }}
              modelValue={false}
            />
          )
        }
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    showOverflowTooltip: false,
    align: 'center',
    width: 350,
    slots: {
      default: (data) => {
        return (
          <div>
            <el-button
              type="warning"
              size="small"
              onClick={() => {
                setBrokerageLevel(data)
              }}
            >
              分成比例设置
            </el-button>
            <el-button
              type="info"
              size="small"
              onClick={() => {
                onSubLevelUser(data)
              }}
            >
              查看下级
            </el-button>
            <el-button
              type="danger"
              size="small"
              onClick={() => {
                onStateUser(data)
              }}
            >
              状态修改
            </el-button>
            <el-button
              type="primary"
              size="small"
              onClick={() => {
                onUserScoreRecharge(data)
              }}
            >
              充值
            </el-button>
          </div>
        )
      }
    }
  }
])
const setTopLevelUser = async (row) => {
  ElMessageBox({
    title: '选择状态',
    showCancelButton: true,
    message: `确定把用户【${row.Name}】挂靠到平台?`
  }).then(async (action) => {
    if (action == 'confirm') {
      let res = await postSetSuperiorID(row.ID, 0)
      if (res.Code == 0) {
        ElMessage.success(res.Message)
      }
      userTableMethods.refresh()
    }
  })
}
const onAgentUser = async (row) => {
  let userInfoKeys: string[] = row.UserInfoKeys || []
  let userInfoValues: string[] = row.UserInfoValues || []
  let keyIndex = userInfoKeys.findIndex(
    (value: string, _index: number, _obj: string[]) => value == 'Agent'
  )
  let value = false
  if (keyIndex > -1) {
    value = userInfoValues[keyIndex] == 'true'
  }
  let res = await postUserAgent(row.ID, !value)
  if (res.Code == 0) {
    ElMessage.success(res.Message)
  }
  userTableMethods.refresh()
}
const setBrokerageLevel = async (data) => {
  let userInfoKeys = data.row.UserInfoKeys || []
  let userInfoValues = data.row.UserInfoValues || []

  let bl1 = userInfoKeys.findIndex((value, _index, _obj) => {
    return value == 'BrokerageLeve1'
  })
  let bl2 = userInfoKeys.findIndex((value, _index, _obj) => {
    return value == 'BrokerageLeve2'
  })
  let bl3 = userInfoKeys.findIndex((value, _index, _obj) => {
    return value == 'BrokerageLeve3'
  })
  let bl4 = userInfoKeys.findIndex((value, _index, _obj) => {
    return value == 'BrokerageLeve4'
  })
  let bl5 = userInfoKeys.findIndex((value, _index, _obj) => {
    return value == 'BrokerageLeve5'
  })
  let bl6 = userInfoKeys.findIndex((value, _index, _obj) => {
    return value == 'BrokerageLeve6'
  })
  brokerageLevelDialogVisible.value = true
  await nextTick()
  await brokerageLevelDialogForm.formMethods.setValues({
    Leve1: parseFloat(userInfoValues[bl1]) || 0,
    Leve2: parseFloat(userInfoValues[bl2]) || 0,
    Leve3: parseFloat(userInfoValues[bl3]) || 0,
    Leve4: parseFloat(userInfoValues[bl4]) || 0,
    Leve5: parseFloat(userInfoValues[bl5]) || 0,
    Leve6: parseFloat(userInfoValues[bl6]) || 0
  })
  currentUser.value = data.row
}
const onSubLevelUser = (data) => {
  superiorList.value.push({ Name: data.row.Name, ID: data.row.ID })
  queryParams.value = { SuperiorID: data.row.ID }
  userTableMethods.refresh()
}
const onStateUser = (data) => {
  const selectValue = ref<UserInfoStateType>('')
  ElMessageBox({
    title: '选择状态',
    showCancelButton: true,
    message: () =>
      h(
        ElSelect,
        {
          modelValue: selectValue.value,
          'onUpdate:modelValue': (val: boolean | string | number) => {
            selectValue.value = val as UserInfoStateType
          }
        },
        [
          h(ElOption, { value: '', label: '正常' }),
          h(ElOption, { value: 'closure', label: '封禁' })
        ]
      )
  }).then(async (action) => {
    if (action == 'confirm') {
      let res = await postUserState(data.row.ID, selectValue.value)
      ElMessage.success(res.Message)
      userTableMethods.refresh()
    }
  })
}
const currentUser = ref<UserWithSuperiorUser>()
const scoreJournalList = ref<ComponentRef<typeof ScoreJournalList>>()
const onScoreRechargeSubmit = async () => {
  const userID = currentUser?.value?.ID || 0
  if (userID == 0) {
    ElMessage.error('用户信息错误，无法充值')
    return
  }
  const elFormExpose = await scoreRechargeDialogForm.formMethods.getElFormExpose()
  elFormExpose?.validate(async (valid) => {
    if (valid) {
      let formData = await scoreRechargeDialogForm.formMethods.getFormData(true)
      elFormExpose?.resetFields()

      let res = await postUserScoreRecharge(userID, parseInt(formData.Score), formData.Reason)
      if (res.Code == 0) {
        ElMessage.success(res.Message)
        scoreJournalList.value!.refreshList()
        userTableMethods.refresh()

        const resUser = await putUserList({ ID: userID }, { ColumnName: '', Method: '' }, 1, 1)
        if (resUser.Code == 0 && resUser.Data.List.length > 0) {
          currentUser.value = resUser.Data.List[0]
        }
      } else {
        ElMessage.error(res.Message)
      }
    }
  })
}
const onUserScoreRecharge = (data) => {
  currentUser.value = data.row
  scoreRechargeDialogVisible.value = true
}
const onQuerySubmit = () => {
  superiorList.value = []
  userTableMethods.refresh()
}
const scoreRechargeDialogVisible = ref(false)
const scoreRechargeDialogForm = useForm()
const scoreRechargeDialogSchema = reactive<FormSchema[]>([
  {
    field: 'Score',
    label: '球币',
    component: 'InputNumber',
    componentProps: {
      placeholder: '输入负数表示扣掉球币，正数表示增加球币'
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Reason',
    label: '理由',
    component: 'Input',
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'action',
    label: ' ',
    component: 'Input',
    formItemProps: {
      slots: {
        default: () => {
          return (
            <el-button onClick={onScoreRechargeSubmit} type="primary">
              充值
            </el-button>
          )
        }
      }
    }
  }
])

const descriptionUser = reactive<DescriptionsSchema[]>([
  {
    field: 'ID',
    label: '#ID'
  },
  {
    field: 'Phone',
    label: '手机号'
  },
  {
    field: 'Score',
    label: '原有球币'
  },
  {
    field: 'SuperiorUser.Name',
    label: '上级'
  }
])
type SuperiorItem = {
  Name: string
  ID: number
}
const superiorList = ref<SuperiorItem[]>([])
const onCloseSuperior = (index: number) => {
  let list = superiorList.value
  list.splice(index, 1)
  superiorList.value = list
  if (list.length == 0) {
    queryParams.value = {}
    userTableMethods.refresh()
  }
}
const onClickSuperior = (index: number) => {
  queryParams.value = { SuperiorID: superiorList.value[index].ID }
  userTableMethods.refresh()
}
const brokerageLevelDialogVisible = ref(false)
const brokerageLevelDialogForm = useForm()
const brokerageLevelDialogSchema = reactive<FormSchema[]>([
  {
    field: 'Leve1',
    label: '一级(%)',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 0.1,
      max: 100,
      min: 0
    },
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'Leve2',
    label: '二级(%)',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 0.1,
      max: 100,
      min: 0
    },
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'Leve3',
    label: '三级(%)',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 0.1,
      max: 100,
      min: 0
    },
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'Leve4',
    label: '四级(%)',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 0.1,
      max: 100,
      min: 0
    },
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'Leve5',
    label: '五级(%)',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 0.1,
      max: 100,
      min: 0
    },
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'Leve6',
    label: '六级(%)',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 0.1,
      max: 100,
      min: 0
    },
    formItemProps: {
      rules: []
    }
  }
])
const onSubmitBrokerageLevel = async () => {
  const elFormExpose = await brokerageLevelDialogForm.formMethods.getElFormExpose()
  elFormExpose?.validate(async (valid) => {
    if (valid && currentUser.value) {
      let formData = await brokerageLevelDialogForm.formMethods.getFormData<BrokerageLevel>()
      let res = await postUserBrokerageLevel(currentUser.value!.ID, formData)
      if (res.Code == 0) {
        brokerageLevelDialogVisible.value = false
        ElMessage.success(res.Message)
        userTableMethods.refresh()
      }
    }
  })
}
</script>

<template>
  <ContentWrap title="用户列表">
    <el-form :inline="true" :model="queryParams" class="demo-form-inline">
      <el-form-item label="用户ID">
        <el-input
          type="number"
          class="appearance-none"
          v-model.number="queryParams.ID"
          placeholder="用户ID"
          clearable
        />
      </el-form-item>
      <el-form-item label="手机尾号">
        <el-input type="tel" v-model="queryParams.Phone" placeholder="手机尾号" clearable />
      </el-form-item>
      <el-form-item label="上级ID">
        <el-input
          type="number"
          v-model.number="queryParams.SuperiorID"
          placeholder="上级ID"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onQuerySubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-tag
        v-for="(tag, index) in superiorList"
        @close="onCloseSuperior(index)"
        @click="onClickSuperior(index)"
        :data-index="index"
        :key="index"
        class="mx-1"
        closable
      >
        {{ tag.Name }}
      </el-tag>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :highlight-current-row="true"
      :show-action="true"
      :flexible="true"
      :columns="userColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total,
        small: true
      }"
      @register="userTable.tableRegister"
      @refresh="userTableMethods.refresh"
    />
  </ContentWrap>
  <Dialog :max-height="600" v-model="scoreRechargeDialogVisible" :fullscreen="true" title="充值">
    <Descriptions title="充值用户信息" :column="2" :data="currentUser" :schema="descriptionUser" />
    <Form
      style="
        background: lightcyan;
        padding: 20px;
        border: 1px solid lightseagreen;
        border-radius: 10px;
      "
      :schema="scoreRechargeDialogSchema"
      :is-col="false"
      @register="scoreRechargeDialogForm.formRegister"
    />
    <ContentWrap title="充值记录">
      <ScoreJournalList ref="scoreJournalList" :query-params="{ UserID: currentUser?.ID }" />
    </ContentWrap>
    <template #footer>
      <BaseButton @click="scoreRechargeDialogVisible = false">确定</BaseButton>
    </template>
  </Dialog>
  <Dialog v-model="brokerageLevelDialogVisible" :fullscreen="true" title="充值">
    <Form :schema="brokerageLevelDialogSchema" @register="brokerageLevelDialogForm.formRegister" />
    <template #footer>
      <BaseButton type="default" @click="brokerageLevelDialogVisible = false">取消</BaseButton>
      <BaseButton type="primary" @click="onSubmitBrokerageLevel">确定</BaseButton>
    </template>
  </Dialog>
</template>

<style scoped lang="less"></style>
