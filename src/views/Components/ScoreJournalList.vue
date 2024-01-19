<script setup lang="tsx">
import Table from '@/components/Table/src/Table.vue'
import { reactive, watch } from 'vue'
import { TableColumn } from '@/components/Table'
import { formatTime } from '@/utils'
import { useTable } from '@/hooks/web/useTable'
import { putUserScoreJournalList } from '@/api/user'

const props = defineProps({
  queryParams: {
    type: Object,
    default: () => ({})
  }
})

const onScheduleRowClick = (row, column, event) => {
  //currentSchedule.value = row
}

const scheduleTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = scheduleTable.tableState
    const res = await putUserScoreJournalList(
      props.queryParams,
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
    field: 'CreatedAt',
    label: '创建时间',
    slots: {
      default: ({ row }) => {
        return <>{formatTime(row.CreatedAt)}</>
      }
    }
  },
  {
    field: 'Name',
    label: '账目'
  },
  {
    field: 'Detail',
    label: '说明'
  },
  {
    field: 'User.Name',
    label: '用户名称'
  },
  {
    field: 'User.Phone',
    label: '用户手机'
  },
  {
    field: 'Score',
    label: '变动数量'
  },
  {
    field: 'Balance',
    label: '变动后的数量'
  },
  {
    field: 'Type',
    label: '类型',
    slots: {
      default: ({ row }) => {
        return <>{row.Type}</>
      }
    }
  }
])
const refreshList = () => {
  scheduleTableMethods.refresh()
}
defineExpose({
  refreshList
})

watch(
  () => props.queryParams,
  (val: Object) => {
    scheduleTableMethods.refresh()
  },
  {
    immediate: true
  }
)
//const emit = defineEmits(['editRow', 'deleteRow', 'select'])
</script>

<template>
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
