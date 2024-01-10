<script setup lang="tsx">
import {
  ElButton,
  ElCard,
  ElCol,
  ElImage,
  ElMessage,
  ElMessageBox,
  ElRow,
  ElUpload,
  ElAvatar,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from 'element-plus'
import { GetRestfull } from '@/api'
import { useTable } from '@/hooks/web/useTable'
import { nextTick, reactive, ref, unref } from 'vue'
import { TableColumn } from '@/components/Table'
import Table from '@/components/Table/src/Table.vue'
import { OrderMethod, Prediction, Schedule, Seer } from '@/api/types'
import { formatTime } from '@/utils'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { Form, FormSchema } from '@/components/Form'
import { useValidator } from '@/hooks/web/useValidator'
import { ContentWrap } from '@/components/ContentWrap'
import { useForm } from '@/hooks/web/useForm'
import { deleteSeer, postSeer } from '@/api/seer'
import { PATH_URL } from '@/axios/service'
import ScheduleList from '@/views/Components/ScheduleList.vue'
import { deletePrediction, postPrediction, PutPredictionJoinScheduleList } from '@/api/prediction'
import { UploadFile, UploadFiles } from 'element-plus/es/components/upload/src/upload'

const { required } = useValidator()

const scheduleList = ref<ComponentRef<typeof ScheduleList>>()

const seerQuery = ref({})
const scheduleQuery = ref({})
const predictionQuery = ref({})

const predictionOrder = ref<OrderMethod>({ ColumnName: '', Method: '' })

const currentSeer = ref<Seer>({ Avatar: '', Grades: [], ID: 0, Name: '', Signature: '' })
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
const currentPrediction = ref<Prediction>({
  ID: 0,
  Recommend: '',
  Result: 0,
  Rl: '',
  Rn: '',
  ScheduleID: 0,
  Score: 0,
  SeerID: 0
})

const onSeerRowClick = (row, column, event) => {
  console.log(row, column, event)
  currentSeer.value = row
  predictionQuery.value = Object.assign(scheduleQuery.value, { SeerID: currentSeer.value.ID })
  predictionTableMethods.refresh()
}

const onPredictionRowClick = (row, column, event) => {
  console.log(row, column, event)
  //currentPrediction.value = row
}

const seerTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = seerTable.tableState
    const res = await GetRestfull(
      'Seer',
      Object.assign(seerQuery.value, {
        'page-no': unref(currentPage),
        'page-size': unref(pageSize),
        'order-field': 'CreatedAt',
        'order-method': 'desc'
      })
    )
    return {
      list: res.Data.List,
      total: res.Data.Total
    }
  }
})

const onDeleteSeer = ({ row }) => {
  ElMessageBox.confirm(`确定删除专家[${row.Name}]？`)
    .then(async () => {
      ElMessageBox.confirm(`删除专家会把方案也一起删除了，确定要删除？`)
        .then(async () => {
          let result = await deleteSeer(row.ID)
          if (result.Code == 0) {
            ElMessage.success('删除成功')
            seerTableMethods.refresh()
          }
        })
        .catch(() => {})
    })
    .catch(() => {})
}
const onEditSeer = async ({ row }) => {
  currentSeer.value = row
  await nextTick()
  seerDialogVisible.value = true
  await seerDialogForm.formMethods.setValues(currentSeer.value)
}

const seerTableState = seerTable.tableState
const seerTableMethods = seerTable.tableMethods
const seerColumns = reactive<TableColumn[]>([
  {
    field: 'ID',
    label: '#ID',
    width: 50,
    align: 'center'
  },
  {
    field: 'Avatar',
    label: '头像',
    width: 60,
    slots: {
      default: ({ row }) => {
        return (
          <ElImage
            fit="contain"
            src={PATH_URL + row.Avatar + '?t=' + new Date(row.UpdatedAt).getTime()}
          ></ElImage>
        )
      }
    }
  },
  {
    field: 'Name',
    label: '名字'
  },
  {
    field: 'Signature',
    label: '签名'
  },
  {
    field: 'action',
    label: '操作',
    align: 'center',
    width: 140,
    showOverflowTooltip: false,
    slots: {
      default: (data) => {
        return (
          <div>
            <ElButton
              type="danger"
              size="small"
              onClick={() => {
                onDeleteSeer(data)
              }}
            >
              删除
            </ElButton>
            <ElButton
              type="primary"
              size="small"
              onClick={() => {
                onEditSeer(data)
              }}
            >
              编辑
            </ElButton>
          </div>
        )
      }
    }
  }
])

const predictionTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = predictionTable.tableState
    const res = await PutPredictionJoinScheduleList(
      predictionQuery.value,
      predictionOrder.value,
      unref(currentPage),
      unref(pageSize)
    )
    return {
      list: res.Data.List,
      total: res.Data.Total
    }
  }
})
const predictionTableState = predictionTable.tableState
const predictionTableMethods = predictionTable.tableMethods
const predictionColumns = reactive<TableColumn[]>([
  {
    field: 'Prediction.ID',
    label: '#ID',
    width: 50,
    align: 'center'
  },
  {
    field: 'Seer.Name',
    label: '专家'
  },
  {
    field: 'Schedule.Name',
    label: '名称'
  },
  {
    field: 'Schedule.Hoster',
    label: '主队'
  },
  {
    field: 'Schedule.Guester',
    label: '客队'
  },
  {
    field: 'Schedule.StartAt',
    label: '开始时间',
    width: 170,
    align: 'center',
    slots: {
      default: ({ row }) => {
        return <span>{formatTime(row.Schedule.StartAt)}</span>
      }
    }
  },
  {
    field: 'Prediction.RData',
    label: '方案',
    slots: {
      default: ({ row }) => {
        return row.Prediction.RData
      }
    }
  },
  {
    field: 'Prediction.Result',
    label: '结果',
    slots: {
      default: ({ row }) => {
        switch (row.Prediction.Result) {
          case 0:
            return '-'
          case 1:
            return '赢'
          case 2:
            return '走'
          case 3:
            return '输'
          default:
            return `未知（` + row.Prediction.Result + `）`
        }
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    align: 'center',
    width: 140,
    showOverflowTooltip: false,
    slots: {
      default: (data) => {
        return (
          <div>
            <ElButton
              type="danger"
              size="small"
              onClick={() => {
                onDeletePrediction(data)
              }}
            >
              删除
            </ElButton>
            <ElButton
              type="primary"
              size="small"
              onClick={() => {
                onEditPrediction(data)
              }}
            >
              编辑
            </ElButton>
          </div>
        )
      }
    }
  }
])

const seerDialogForm = useForm()
const seerDialogVisible = ref<boolean>(false)
const seerDialogSchema = reactive<FormSchema[]>([
  {
    field: 'Name',
    label: '名称',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Signature',
    label: '签名',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Avatar',
    label: '头像',
    formItemProps: {
      rules: [required()],
      slots: {
        default: (data) => {
          if ((data.Avatar || '').indexOf('/oss/') == -1) {
            return <ElAvatar size="large" src={PATH_URL + '/api/file/load/' + data.Avatar} />
          } else {
            return <ElAvatar size="large" src={PATH_URL + data.Avatar} />
          }
        }
      }
    }
  },
  {
    field: 'Upload',
    label: ' ',
    component: 'Upload',
    formItemProps: {},
    componentProps: {
      action: PATH_URL + '/api/file/upload', // 'https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15',
      showFileList: false,
      multiple: false,
      withCredentials: true,
      onSuccess: async (responseBody: IResponse, _uploadFile) => {
        console.log(responseBody)
        await seerDialogForm.formMethods.setValues({ Avatar: responseBody.Data.TempFileName })
        let uploader = (await seerDialogForm.formMethods.getComponentExpose(
          'Upload'
        )) as typeof ElUpload
        uploader.clearFiles()
      },
      onExceed: (files, uploadFiles) => {
        ElMessage.warning(
          `The limit is 3, you selected ${files.length} files this time, add up to ${
            files.length + uploadFiles.length
          } totally`
        )
      },
      slots: {
        default: (data) => {
          console.log('adata', data)
          return <span class="avatar-uploader-icon">选择图片</span>
        }
      }
    }
  }
])

const onAddSeer = () => {
  currentSeer.value = { Avatar: '', Grades: [], ID: 0, Name: '', Signature: '' }
  seerDialogVisible.value = true
}
const seerDialogFormSubmit = async () => {
  const elFormExpose = await seerDialogForm.formMethods.getElFormExpose()
  elFormExpose?.validate(async (valid) => {
    if (valid) {
      let ss = await seerDialogForm.formMethods.getFormData<Seer>()
      console.log('submit success', ss)

      let result = await postSeer(ss)
      if (result.Code == 0) {
        seerDialogVisible.value = false
        ElMessage.success('添加成功')
        seerTableMethods.refresh()
      }
    } else {
      console.log('submit fail')
    }
  })
}

const scheduleDialogVisible = ref<boolean>(false)

const predictionDialogForm = useForm()
const predictionDialogVisible = ref<boolean>(false)
const predictionDialogSchema = reactive<FormSchema[]>([
  {
    field: 'ScheduleID',
    label: '赛事',
    component: 'Input',
    formItemProps: {
      rules: [required()],
      slots: {
        default() {
          if (currentSchedule.value.ID > 0) {
            return (
              <div>
                <el-button onclick={() => (scheduleDialogVisible.value = true)} type="primary">
                  {currentSchedule.value.Name}
                </el-button>
                <div>
                  对手:
                  <el-tag effect="dark" round>
                    {currentSchedule.value.Hoster}
                  </el-tag>
                  &nbsp;|&nbsp;
                  <el-tag effect="dark" type="danger" round>
                    {currentSchedule.value.Guester}
                  </el-tag>
                </div>
                <div>
                  开始时间:
                  <el-tag effect="dark" type="success" round>
                    {formatTime(currentSchedule.value.StartAt)}
                  </el-tag>
                </div>
              </div>
            )
          }

          return (
            <el-button onclick={() => (scheduleDialogVisible.value = true)} type="primary">
              选择一个赛事
            </el-button>
          )
        }
      }
    }
  },
  {
    field: 'Recommend',
    label: '推荐理由',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Score',
    label: '球币',
    component: 'InputNumber',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'RData',
    label: '盘口',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Result',
    label: '结果',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: '无',
          value: 0
        },
        {
          label: '赢',
          value: 1
        },
        {
          label: '平',
          value: 2
        },
        {
          label: '输',
          value: 3
        }
      ],
      on: {
        change: (value: string) => {
          console.log(value)
        }
      }
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'WrongRefundScore',
    label: '不中即退',
    component: 'Switch',
    formItemProps: {
      rules: []
    }
  }
])
const onPredictionDialogFormSubmit = async () => {
  if (currentSeer.value.ID == 0) {
    ElMessage.error('请选择一个专家')
    return
  }
  const elFormExpose = await predictionDialogForm.formMethods.getElFormExpose()
  elFormExpose?.validate(async (valid) => {
    if (valid) {
      let ss = await predictionDialogForm.formMethods.getFormData<Prediction>()
      ss.SeerID = currentSeer.value.ID
      ss.ScheduleID = currentSchedule.value.ID
      console.log('submit success', ss)
      let result = await postPrediction(ss)
      if (result.Code == 0) {
        predictionDialogVisible.value = false
        ElMessage.success(result.Message)
        predictionTableMethods.refresh()
      }
    } else {
      console.log('submit fail')
    }
  })
}
const onDeletePrediction = ({ row }) => {
  ElMessageBox.confirm(`确定删除方案[${row.Prediction.ID}]？`)
    .then(async () => {
      let result = await deletePrediction(row.Prediction.ID)
      if (result.Code == 0) {
        ElMessage.success('删除成功')
        predictionTableMethods.refresh()
      }
    })
    .catch(() => {})
}

const onAddPrediction = () => {
  currentSchedule.value = {
    EndAt: '',
    Guester: '',
    Hoster: '',
    ID: 0,
    Name: '',
    Rl: '',
    Rn: '',
    StartAt: '',
    TypeName: ''
  }
  currentPrediction.value = {
    ID: 0,
    Recommend: '',
    Result: 0,
    Rl: '',
    Rn: '',
    ScheduleID: 0,
    Score: 0,
    SeerID: 0
  }
  predictionDialogVisible.value = true
}
const onEditPrediction = async (data) => {
  currentSchedule.value = data.row.Schedule
  currentPrediction.value = data.row.Prediction
  currentSeer.value.ID = currentPrediction.value.SeerID
  console.log('currentPrediction.value', currentPrediction.value)
  predictionDialogVisible.value = true
  await nextTick()
  await predictionDialogForm.formMethods.setValues(currentPrediction.value)
}
const onSelectSchedule = (row) => {
  currentSchedule.value = row
  scheduleDialogVisible.value = false
  predictionDialogForm.formMethods.setValues({ ScheduleID: currentSchedule.value.ID })
}
const onUnSelectSeer = () => {
  currentSeer.value = { Avatar: '', Grades: [], ID: 0, Name: '', Signature: '' }
  predictionQuery.value = Object.assign(scheduleQuery.value, { SeerID: currentSeer.value.ID })
  predictionTableMethods.refresh()
}

const upload = ref<UploadInstance>()
const uploading = ref<boolean>(false)
const importErrors = ref<string[]>([])

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploading.value = true
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = new Date().getTime()
  upload.value!.handleStart(file)
}
const handleSuccess: UploadProps['onSuccess'] = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  upload.value!.clearFiles()
  uploading.value = false
  console.log(response, uploadFile, uploadFiles)
  if (response.Code != 0) {
    importErrors.value = response.Data.Errors
    ElMessage.error(response.Message)
    return
  } else {
    ElMessage.success(response.Message)
  }
}

const submitUpload = () => {
  upload.value!.submit()
}
const importExcelDataDialogVisible = ref<boolean>(false)
const onImportExcelData = () => {
  importExcelDataDialogVisible.value = true
}
</script>

<template>
  <ContentWrap title="专家管理">
    <template #header>
      <BaseButton type="primary" @click="onImportExcelData"> 电子表格导入数据</BaseButton>
    </template>
    <ElRow :gutter="10">
      <ElCol :xs="24" :sm="24" :md="24" :lg="8" :xl="9">
        <ElCard class="box-card">
          <template #header>
            <div class="card-header">
              <span>专家列表</span>
              <ElButton class="button" @click="onAddSeer">添加专家</ElButton>
            </div>
          </template>
          <Table
            v-model:pageSize="seerTableState.pageSize.value"
            v-model:currentPage="seerTableState.currentPage.value"
            highlight-current-row
            showAction
            :columns="seerColumns"
            :data="seerTableState.dataList.value"
            :loading="seerTableState.loading.value"
            @row-click="onSeerRowClick"
            :pagination="{
              total: seerTableState.total.value,
              small: true,
              layout: 'sizes, prev, pager, next, ->'
            }"
            @register="seerTable.tableRegister"
            @refresh="seerTableMethods.refresh"
          />
          <template #footer></template>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="24" :lg="16" :xl="15">
        <ElCard class="box-card">
          <template #header>
            <div class="card-header">
              <span>方案</span>
              <div v-if="currentSeer.ID > 0">
                <el-tag
                  style="margin-right: 10px"
                  size="large"
                  @close="onUnSelectSeer"
                  closable
                  type="success"
                >
                  {{ currentSeer.Name }}
                </el-tag>
                <ElButton @click="onAddPrediction" class="button">添加方案</ElButton>
              </div>
            </div>
          </template>
          <Table
            v-model:pageSize="predictionTableState.pageSize.value"
            v-model:currentPage="predictionTableState.currentPage.value"
            :highlight-current-row="true"
            :showAction="true"
            :columns="predictionColumns"
            @row-click="onPredictionRowClick"
            :data="predictionTableState.dataList.value"
            :loading="predictionTableState.loading.value"
            :pagination="{
              total: predictionTableState.total.value,
              small: true
            }"
            @register="predictionTable.tableRegister"
            @refresh="predictionTableMethods.refresh"
          />
          <template #footer></template>
        </ElCard>
      </ElCol>
    </ElRow>
  </ContentWrap>

  <Dialog v-model="seerDialogVisible" :title="currentSeer.ID > 0 ? '修改专家' : '添加专家'">
    <Form :schema="seerDialogSchema" :is-col="false" @register="seerDialogForm.formRegister" />
    <template #footer>
      <BaseButton type="primary" @click="seerDialogFormSubmit">提交</BaseButton>
      <BaseButton @click="seerDialogVisible = false">取消</BaseButton>
    </template>
  </Dialog>

  <Dialog
    v-model="predictionDialogVisible"
    :title="currentPrediction.ID > 0 ? '修改方案' : '添加方案'"
  >
    <Form :schema="predictionDialogSchema" @register="predictionDialogForm.formRegister" />
    <template #footer>
      <BaseButton type="primary" @click="onPredictionDialogFormSubmit">提交</BaseButton>
      <BaseButton @click="predictionDialogVisible = false">取消</BaseButton>
    </template>
  </Dialog>

  <Dialog v-model="scheduleDialogVisible" :fullscreen="true" title="选择赛事">
    <ScheduleList type="select" @select="onSelectSchedule" ref="scheduleList" />
    <template #footer>
      <BaseButton @click="scheduleDialogVisible = false">取消</BaseButton>
    </template>
  </Dialog>
  <Dialog v-model="importExcelDataDialogVisible" :fullscreen="true" title="电子表格导入数据">
    <el-upload
      ref="upload"
      :action="PATH_URL + '/api/seer/import-data'"
      :limit="1"
      :with-credentials="true"
      accept=".xlsx"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      :auto-upload="false"
    >
      <template #trigger>
        <el-button :loading="uploading" type="primary">选择Excel文件</el-button>
      </template>
      <el-button class="ml-3" :loading="uploading" type="success" @click="submitUpload">
        导入
      </el-button>
    </el-upload>
    <el-alert
      v-for="(m, index) in importErrors"
      style="margin: 10px 0"
      :key="index"
      :title="m"
      type="error"
      effect="dark"
      :closable="false"
    />
    <template #footer>
      <BaseButton @click="importExcelDataDialogVisible = false">取消</BaseButton>
    </template>
  </Dialog>
</template>

<style scoped>
.avatar-uploader {
  width: 120px;
  height: 100px;
  display: flex;
  justify-content: center;
}

.avatar-uploader .avatar {
  width: 100%;
  object-fit: contain;
}
</style>
