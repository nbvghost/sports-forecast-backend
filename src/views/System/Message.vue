<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Table from '@/components/Table/src/Table.vue'
import { useTable } from '@/hooks/web/useTable'
import { nextTick, reactive, ref } from 'vue'
import { TableColumn } from '@/components/Table'
import { formatTime } from '@/utils'
import { deleteSystemMessage, postSystemMessage, putSystemMessageList } from '@/api/system'
import { Dialog } from '@/components/Dialog'
import Form from '@/components/Form/src/Form.vue'
import { BaseButton } from '@/components/Button'
import { useForm } from '@/hooks/web/useForm'
import { FormSchema } from '@/components/Form'
import { useValidator } from '@/hooks/web/useValidator'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SystemMessage } from '@/api/system/types'

const { required } = useValidator()

type QueryParams = {}
const queryParams = ref<QueryParams>({})

const userTable = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = userTable.tableState

    const res = await putSystemMessageList(
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
const userTableState = userTable.tableState
const userTableMethods = userTable.tableMethods
const userColumns = reactive<TableColumn[]>([
  {
    field: 'ID',
    label: '#ID',
    width: 50,
    align: 'center'
  },
  {
    field: 'Title',
    label: '名称'
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
    field: 'action',
    label: '操作',
    showOverflowTooltip: false,
    align: 'center',
    width: 300,
    slots: {
      default: (data) => {
        return (
          <div>
            <el-button
              type="danger"
              size="small"
              onClick={() => {
                onDeleteSystemMessage(data)
              }}
            >
              删除
            </el-button>
            <el-button
              type="primary"
              size="small"
              onClick={() => {
                onEditSystemMessage(data)
              }}
            >
              编辑
            </el-button>
          </div>
        )
      }
    }
  }
])

const systemMessageDialogVisible = ref(false)
const systemMessageDialogForm = useForm()
const systemMessageDialogSchema = reactive<FormSchema[]>([
  {
    field: 'Title',
    label: '标题',
    component: 'Input',
    componentProps: {
      placeholder: '输入标题'
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'Content',
    label: '内容',
    component: 'Editor',
    componentProps: {
      editorConfig: {
        MENU_CONF: {
          uploadImage: {
            server: '/api/upload',
            // form-data fieldName ，默认值 'wangeditor-uploaded-image'
            fieldName: 'your-custom-name',

            base64LimitSize: 1024 * 1024, // 1M
            // 单个文件的最大体积限制，默认为 2M
            maxFileSize: 1024 * 1024, // 1M

            // 最多可上传几个文件，默认为 100
            maxNumberOfFiles: 10,

            // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
            allowedFileTypes: ['image/*'],

            // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
            meta: {
              token: 'xxx',
              otherKey: 'yyy'
            },

            // 将 meta 拼接到 url 参数中，默认 false
            metaWithUrl: false,

            // 自定义增加 http  header
            headers: {
              Accept: 'text/x-json',
              otherKey: 'xxx'
            },

            // 跨域是否传递 cookie ，默认为 false
            withCredentials: true,

            // 超时时间，默认为 10 秒
            timeout: 5 * 1000, // 5 秒
            // 上传之前触发
            onBeforeUpload(file: File) {
              console.log(file)
              // TS 语法
              // onBeforeUpload(file) {    // JS 语法
              // file 选中的文件，格式如 { key: file }
              return file

              // 可以 return
              // 1. return file 或者 new 一个 file ，接下来将上传
              // 2. return false ，不上传这个 file
            },
            // 上传进度的回调函数
            onProgress(progress: number) {
              // TS 语法
              // onProgress(progress) {       // JS 语法
              // progress 是 0-100 的数字
              console.log('progress', progress)
            },
            // 单个文件上传成功之后
            onSuccess(file: File, res: any) {
              // TS 语法
              // onSuccess(file, res) {          // JS 语法
              console.log(`${file.name} 上传成功`, res)
            },
            // 单个文件上传失败
            onFailed(file: File, res: any) {
              // TS 语法
              // onFailed(file, res) {           // JS 语法
              console.log(`${file.name} 上传失败`, res)
              ElMessage.error(`${file.name}上传失败`)
            },
            // 上传错误，或者触发 timeout 超时
            onError(file: File, err: any, res: any) {
              // TS 语法
              // onError(file, err, res) {               // JS 语法
              console.log(`${file.name} 上传出错`)
              console.log((err as Error).message)
              console.log(res)
              ElMessage.error(`${file.name}上传出错,` + (err as Error).message)
            }
          }
        }
      }
    },
    formItemProps: {
      rules: [required()]
    }
  }
])
const onAddSystemMessage = () => {
  currentSystemMessage.value = { Content: '', ID: 0, Title: '' }
  systemMessageDialogVisible.value = true
}

const currentSystemMessage = ref<SystemMessage>({ Content: '', ID: 0, Title: '' })
const onDeleteSystemMessage = async (data) => {
  ElMessageBox.confirm(`确定删除这个系统消息？`)
    .then(async () => {
      let res = await deleteSystemMessage(data.row.ID)
      if (res.Code == 0) {
        ElMessage.success(res.Message)
        userTableMethods.refresh()
      }
    })
    .catch(() => {})
}
const onEditSystemMessage = async (data) => {
  console.log(data)
  currentSystemMessage.value = data.row
  systemMessageDialogVisible.value = true
  await nextTick()
  await systemMessageDialogForm.formMethods.setValues(data.row)
}
const onSystemMessageDialogFormSubmit = async () => {
  const elFormExpose = await systemMessageDialogForm.formMethods.getElFormExpose()
  elFormExpose?.validate(async (valid) => {
    if (valid) {
      let ss = await systemMessageDialogForm.formMethods.getFormData<SystemMessage>()
      let result = await postSystemMessage(ss)
      if (result.Code == 0) {
        systemMessageDialogVisible.value = false
        ElMessage.success('添加成功')
        userTableMethods.refresh()
      }
    } else {
      console.log('submit fail')
    }
  })
}
</script>

<template>
  <ContentWrap title="系统消息">
    <template #header>
      <BaseButton type="primary" @click="onAddSystemMessage"> 添加系统消息</BaseButton>
    </template>
    <Table
      v-model:pageSize="userTableState.pageSize.value"
      v-model:currentPage="userTableState.currentPage.value"
      :highlight-current-row="true"
      :show-action="true"
      :flexible="true"
      :columns="userColumns"
      :data="userTableState.dataList.value"
      :loading="userTableState.loading.value"
      :pagination="{
        total: userTableState.total.value,
        small: true
      }"
      @register="userTable.tableRegister"
      @refresh="userTableMethods.refresh"
    />
  </ContentWrap>
  <Dialog
    :max-height="700"
    v-model="systemMessageDialogVisible"
    :fullscreen="true"
    :title="currentSystemMessage.ID > 0 ? '编辑消息' : '添加消息'"
  >
    <Form
      :schema="systemMessageDialogSchema"
      :is-col="false"
      @register="systemMessageDialogForm.formRegister"
    />
    <template #footer>
      <BaseButton type="primary" @click="onSystemMessageDialogFormSubmit">提交</BaseButton>
    </template>
  </Dialog>
</template>

<style scoped lang="less"></style>
