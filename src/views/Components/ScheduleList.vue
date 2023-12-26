<script setup lang="tsx">
import Table from '@/components/Table/src/Table.vue'
import { PropType, reactive, ref } from 'vue'
import { TableColumn } from '@/components/Table'
import { formatTime } from '@/utils'
import { putScheduleList } from '@/api/schedule'
import { useTable } from '@/hooks/web/useTable'

const props = defineProps({
  type: {
    type: String as PropType<'select' | 'manager'>,
    default: 'manager'
  }
})

type QueryParams = {
  StartAt: string | Date
  Name: string
  TypeName: string
}
const queryParams = ref<QueryParams>({ Name: '', TypeName: '足球', StartAt: new Date() })

const shortcuts = [
  {
    text: '今天',
    value: new Date()
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 1000 * 24 * 60 * 60)
      return date
    }
  },
  {
    text: '前天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 1000 * 24 * 2 * 60 * 60)
      return date
    }
  }
]

const onScheduleRowClick = (row, column, event) => {
  console.log(row, column, event)
  //currentSchedule.value = row
}

const scheduleTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = scheduleTable.tableState
    const res = await putScheduleList(
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

const scheduleTableState = scheduleTable.tableState
const scheduleTableMethods = scheduleTable.tableMethods
const scheduleColumns = reactive<TableColumn[]>([
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
    field: 'Hoster',
    label: '主队'
  },
  {
    field: 'Guester',
    label: '客队'
  },
  {
    field: 'StartAt',
    label: '开始时间',
    slots: {
      default: ({ row }) => {
        return <>{formatTime(row.StartAt)}</>
      }
    }
  },
  {
    field: 'EndAt',
    label: '结束时间',
    slots: {
      default: ({ row }) => {
        return <>{formatTime(row.EndAt)}</>
      }
    }
  },
  {
    field: 'Rl',
    label: 'RL'
  },
  {
    field: 'Rn',
    label: 'RN'
  },
  {
    field: 'action',
    label: '操作',
    showOverflowTooltip: false,
    align: 'center',
    width: 140,
    slots: {
      default: (data) => {
        if (props.type == 'manager') {
          return (
            <div>
              <el-button
                type="danger"
                size="small"
                onClick={() => {
                  onDeleteSchedule(data)
                }}
              >
                删除
              </el-button>
              <el-button
                type="primary"
                size="small"
                onClick={() => {
                  onEditSchedule(data)
                }}
              >
                编辑
              </el-button>
            </div>
          )
        }
        if (props.type == 'select') {
          return (
            <div>
              <el-button
                type="primary"
                size="small"
                onClick={() => {
                  onSelectSchedule(data)
                }}
              >
                选择
              </el-button>
            </div>
          )
        }
        return <></>
      }
    }
  }
])

const onTabChange = () => {
  scheduleTableMethods.refresh()
}
const onFilterSubmit = () => {
  scheduleTableMethods.refresh()
}
const onDeleteSchedule = ({ row }) => {
  emit('deleteRow', row)
}
const onEditSchedule = async ({ row }) => {
  emit('editRow', row)
}
const onSelectSchedule = async ({ row }) => {
  emit('select', row)
}
const refreshList = () => {
  scheduleTableMethods.refresh()
}
defineExpose({
  refreshList
})

const emit = defineEmits(['editRow', 'deleteRow', 'select'])
</script>

<template>
  <el-form :inline="true" :model="queryParams">
    <el-form-item label="日期">
      <el-date-picker
        v-model="queryParams.StartAt"
        type="Date"
        placeholder="选择日期"
        :shortcuts="shortcuts"
      />
    </el-form-item>
    <el-form-item label="名称">
      <el-input v-model="queryParams.Name" placeholder="请输入名称" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onFilterSubmit">确定</el-button>
    </el-form-item>
  </el-form>
  <el-tabs style="margin-top: 20px" v-model="queryParams.TypeName" @tab-change="onTabChange">
    <el-tab-pane label="足球" name="足球" />
    <el-tab-pane label="篮球" name="篮球" />
    <el-tab-pane label="网球" name="网球" />
    <el-tab-pane label="棒球" name="棒球" />
    <el-tab-pane label="冰球" name="冰球" />
    <el-tab-pane label="橄榄球" name="橄榄球" />
    <el-tab-pane label="斯诺克" name="斯诺克" />
  </el-tabs>
  <Table
    v-model:pageSize="scheduleTableState.pageSize.value"
    v-model:currentPage="scheduleTableState.currentPage.value"
    highlight-current-row
    showAction
    :flexible="true"
    :columns="scheduleColumns"
    @row-click="onScheduleRowClick"
    :data="scheduleTableState.dataList.value"
    :loading="scheduleTableState.loading.value"
    :pagination="{
      total: scheduleTableState.total.value,
      small: true
    }"
    @register="scheduleTable.tableRegister"
    @refresh="scheduleTableMethods.refresh"
  />
</template>

<style scoped lang="less"></style>
