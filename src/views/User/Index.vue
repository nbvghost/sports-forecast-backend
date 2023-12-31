<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Table from '@/components/Table/src/Table.vue'
import { useTable } from '@/hooks/web/useTable'
import { h, reactive, ref } from 'vue'
import { TableColumn } from '@/components/Table'
import { formatTime } from '@/utils'
import { postUserAgent, postUserScoreRecharge, postUserState, putUserList } from '@/api/user'
import { ElFormItem, ElInput, ElMessage, ElMessageBox, ElOption, ElSelect } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import Form from '@/components/Form/src/Form.vue'
import { UserInfoStateType, UserWithSuperiorUser } from '@/api/user/types'
import Descriptions from '@/components/Descriptions/src/Descriptions.vue'
import { DescriptionsSchema } from '@/components/Descriptions'
import ScoreJournalList from '@/views/Components/ScoreJournalList.vue'

const { required } = useValidator()

type QueryParams = {
  ID?: number
  Phone?: string
}
const queryParams = ref<QueryParams>({})

const userTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = userTable.tableState
    if (!queryParams.value.ID) {
      delete queryParams.value.ID
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
    label: '上级'
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
    width: 160,
    slots: {
      default: (data) => {
        return (
          <div>
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
      <el-form-item label="手机号">
        <el-input type="tel" v-model="queryParams.Phone" placeholder="用户ID" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onQuerySubmit">查询</el-button>
      </el-form-item>
    </el-form>
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
</template>

<style scoped lang="less"></style>
