<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'
import { Form, FormSchema } from '@/components/Form'
import { Dialog } from '@/components/Dialog'
import { useForm } from '@/hooks/web/useForm'
import { nextTick, reactive, ref } from 'vue'
import { Schedule } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'
import { deleteSchedule, postSchedule } from '@/api/schedule'
import dayjs from 'dayjs'
import ScheduleList from '@/views/Components/ScheduleList.vue'

const { required } = useValidator()

const scheduleList = ref<ComponentRef<typeof ScheduleList>>()

const scheduleDialogForm = useForm()
const currentSchedule = ref<Schedule>({
  TypeName: '',
  EndAt: '',
  Guester: '',
  Hoster: '',
  ID: 0,
  Name: '',
  Rl: '',
  Rn: '',
  StartAt: ''
})
const scheduleDialogVisible = ref<boolean>(false)

const onAddSchedule = async () => {
  scheduleDialogVisible.value = true

  await nextTick()

  let now = new Date()

  currentSchedule.value = {
    EndAt: '',
    Guester: '',
    Hoster: '',
    ID: 0,
    Name: '',
    Rl: '',
    Rn: '',
    StartAt: dayjs(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)).format(
      'YYYY-MM-DDTHH:mm:ss.SSSZ'
    ),
    TypeName: '足球'
  }
  await scheduleDialogForm.formMethods.setValues(currentSchedule.value)
}
const onScheduleDialogFormSubmit = async () => {
  const elFormExpose = await scheduleDialogForm.formMethods.getElFormExpose()
  elFormExpose?.validate(async (valid) => {
    if (valid) {
      let data = await scheduleDialogForm.formMethods.getFormData<Schedule>()
      if (new Date(data.StartAt).getTime() == 0) {
        ElMessage.error('请选择赛事开始时间')
        return
      }

      let result = await postSchedule(data)
      if (result.Code == 0) {
        scheduleDialogVisible.value = false
        ElMessage.success('添加成功')
        scheduleList.value?.refreshList()
      }
    } else {
      console.log('submit fail')
    }
  })
}
const scheduleDialogSchema = reactive<FormSchema[]>([
  {
    field: 'Name',
    label: '名称',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'TypeName',
    label: '类型',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      options: [
        { label: '足球', value: '足球' },
        { label: '篮球', value: '篮球' },
        { label: '网球', value: '网球' },
        { label: '棒球', value: '棒球' },
        { label: '冰球', value: '冰球' },
        { label: '橄榄球', value: '橄榄球' },
        { label: '斯诺克', value: '斯诺克' }
      ]
    }
  },
  {
    field: 'StartAt',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      type: 'datetime',
      valueFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'RData',
    label: '盘口',
    component: 'Input',
    formItemProps: {
      rules: []
    }
  },
  {
    field: 'Hoster',
    label: '主队',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Guester',
    label: '客队',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  }
])
const onDeleteSchedule = async (row) => {
  ElMessageBox.confirm(`确定删除赛事[${row.Name}]？`)
    .then(async () => {
      ElMessageBox.confirm(`删除赛事会把方案也一起删除了，确定要删除？`)
        .then(async () => {
          let result = await deleteSchedule(row.ID)
          if (result.Code == 0) {
            ElMessage.success('删除成功')
            scheduleList.value?.refreshList()
          }
        })
        .catch(() => {})
    })
    .catch(() => {})
}
const onEditSchedule = async (row) => {
  scheduleDialogVisible.value = true
  currentSchedule.value = row
  await nextTick()
  let data = Object.assign({}, row)
  data.StartAt = dayjs(new Date(data.StartAt)).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  data.EndAt = dayjs(new Date(data.EndAt)).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  await scheduleDialogForm.formMethods.setValues(data)
}
</script>

<template>
  <ContentWrap title="赛事管理">
    <template #header>
      <BaseButton type="primary" @click="onAddSchedule"> 添加赛事 </BaseButton>
    </template>
    <ScheduleList
      type="manager"
      @delete-row="onDeleteSchedule"
      @edit-row="onEditSchedule"
      ref="scheduleList"
    />
  </ContentWrap>
  <Dialog v-model="scheduleDialogVisible" :title="currentSchedule.ID > 0 ? '修改赛事' : '添加赛事'">
    <Form :schema="scheduleDialogSchema" @register="scheduleDialogForm.formRegister" />
    <template #footer>
      <BaseButton type="primary" @click="onScheduleDialogFormSubmit">提交</BaseButton>
      <BaseButton @click="scheduleDialogVisible = false">取消</BaseButton>
    </template>
  </Dialog>
</template>

<style scoped lang="less"></style>
