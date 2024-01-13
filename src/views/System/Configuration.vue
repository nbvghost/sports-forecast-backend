<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ref } from 'vue'
import { Editor } from '@/components/Editor'
import { ElMessage, FormInstance, UploadProps } from 'element-plus'
import { UploadFile, UploadFiles } from 'element-plus/es/components/upload/src/upload'
import { postConfiguration, putConfigurations } from '@/api/system'

const editorConfig: any = {
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

const groupBuyPremiumForm = ref<FormInstance>()
const leveBrokerageForm = ref<FormInstance>()
const receivableQrcodeForm = ref<FormInstance>()
const customerServiceForm = ref<FormInstance>()
const aboutForm = ref<FormInstance>()

type GroupBuyPremium = {
  GroupBuyPremiumUseKey?: string //GroupBuyPremiumByCount/GroupBuyPremiumByRatio
  GroupBuyPremiumByCount?: number
  GroupBuyPremiumByRatio?: number //GroupBuyPremiumByRatio/10000
}

type LeveBrokerage = {
  BrokerageLeve1?: number
  BrokerageLeve2?: number
  BrokerageLeve3?: number
  BrokerageLeve4?: number
  BrokerageLeve5?: number
  BrokerageLeve6?: number
}
type CustomerService = {
  CustomerServicePage?: string
}
type About = {
  AboutPage?: string
}
type ReceivableQrcode = {
  ReceivableQrcode?: string
}

const groupBuyPremium = ref<GroupBuyPremium>({})
const leveBrokerage = ref<LeveBrokerage>({})
const customerService = ref<CustomerService>({})
const about = ref<About>({})
const receivableQrcode = ref<ReceivableQrcode>({})

const onLoad = async () => {
  let res = await putConfigurations([
    'GroupBuyPremiumUseKey',
    'GroupBuyPremiumByCount',
    'GroupBuyPremiumByRatio',
    'BrokerageLeve1',
    'BrokerageLeve2',
    'BrokerageLeve3',
    'BrokerageLeve4',
    'BrokerageLeve5',
    'BrokerageLeve6',
    'CustomerServicePage',
    'AboutPage',
    'ReceivableQrcode'
  ])
  if (res.Code == 0) {
    let GroupBuyPremiumUseKey = res.Data['GroupBuyPremiumUseKey']
    let GroupBuyPremiumByCount = res.Data['GroupBuyPremiumByCount']
    let GroupBuyPremiumByRatio = res.Data['GroupBuyPremiumByRatio']
    let BrokerageLeve1 = res.Data['BrokerageLeve1']
    let BrokerageLeve2 = res.Data['BrokerageLeve2']
    let BrokerageLeve3 = res.Data['BrokerageLeve3']
    let BrokerageLeve4 = res.Data['BrokerageLeve4']
    let BrokerageLeve5 = res.Data['BrokerageLeve5']
    let BrokerageLeve6 = res.Data['BrokerageLeve6']
    let CustomerServicePage = res.Data['CustomerServicePage']
    let AboutPage = res.Data['AboutPage']
    let ReceivableQrcode = res.Data['ReceivableQrcode']
    groupBuyPremium.value = {
      GroupBuyPremiumUseKey,
      GroupBuyPremiumByCount,
      GroupBuyPremiumByRatio
    }
    leveBrokerage.value = {
      BrokerageLeve1: BrokerageLeve1,
      BrokerageLeve2: BrokerageLeve2,
      BrokerageLeve3: BrokerageLeve3,
      BrokerageLeve4: BrokerageLeve4,
      BrokerageLeve5: BrokerageLeve5,
      BrokerageLeve6: BrokerageLeve6
    }
    customerService.value = {
      CustomerServicePage
    }
    about.value = {
      AboutPage
    }
    receivableQrcode.value = {
      ReceivableQrcode
    }
  }
}
onLoad()

const handleReceivableQrcodeChange: UploadProps['onChange'] = (
  uploadFile: UploadFile,
  _uploadFiles: UploadFiles
) => {
  let fileReader = new FileReader()
  fileReader.onloadend = function (e) {
    receivableQrcode.value.ReceivableQrcode = e.target?.result as string
  }
  fileReader.readAsDataURL(uploadFile.raw!)
  //receivableQrcode.value.ReceivableQrcode = window.URL.createObjectURL(uploadFile.raw!)
}

const onSubmitForm = async (formEl: FormInstance | undefined, formData: any) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!', formEl, fields, formData)
      let res = await postConfiguration(formData)
      if (res.Code == 0) {
        ElMessage.success(res.Message)
      }
    } else {
      //console.log('error submit!', fields)
    }
  })
}
</script>

<template>
  <ContentWrap title="系统设置">
    <el-card style="display: none" class="box-card">
      <template #header>
        <div class="card-header">
          <span>拼单收益设置</span>
        </div>
      </template>
      <div>
        <el-form ref="groupBuyPremiumForm" :model="groupBuyPremium" label-width="250px">
          <el-form-item required prop="GroupBuyPremiumByCount" label="按拼单人数收取,每人/元">
            <el-input-number v-model="groupBuyPremium.GroupBuyPremiumByCount" />
          </el-form-item>
          <el-form-item required prop="GroupBuyPremiumByRatio" label="按方案金额比例收取,每人/%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="groupBuyPremium.GroupBuyPremiumByRatio"
            />
          </el-form-item>
          <el-form-item required prop="GroupBuyPremiumUseKey" label="使用方式">
            <el-select
              v-model="groupBuyPremium.GroupBuyPremiumUseKey"
              placeholder="请选择当前收益结算方式"
            >
              <el-option label="按拼单人数收取" value="GroupBuyPremiumByCount" />
              <el-option label="按方案金额比例收取" value="GroupBuyPremiumByRatio" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitForm(groupBuyPremiumForm, groupBuyPremium)"
              >保存
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="display: none" class="box-card">
      <template #header>
        <div class="card-header">
          <span>分成比例设置</span>
        </div>
      </template>
      <div>
        <el-form ref="leveBrokerageForm" :model="leveBrokerage" label-width="250px">
          <el-form-item required prop="BrokerageLeve1" label="一级,%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="leveBrokerage.BrokerageLeve1"
            />
          </el-form-item>
          <el-form-item required prop="BrokerageLeve2" label="二级,%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="leveBrokerage.BrokerageLeve2"
            />
          </el-form-item>
          <el-form-item required prop="BrokerageLeve3" label="三级,%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="leveBrokerage.BrokerageLeve3"
            />
          </el-form-item>
          <el-form-item required prop="BrokerageLeve4" label="四级,%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="leveBrokerage.BrokerageLeve4"
            />
          </el-form-item>
          <el-form-item required prop="BrokerageLeve5" label="五级,%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="leveBrokerage.BrokerageLeve5"
            />
          </el-form-item>
          <el-form-item required prop="BrokerageLeve6" label="六级,%">
            <el-input-number
              :precision="2"
              :step="0.1"
              :max="50"
              v-model="leveBrokerage.BrokerageLeve6"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitForm(leveBrokerageForm, leveBrokerage)"
              >保存
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>收款二维码</span>
        </div>
      </template>
      <div>
        <el-form ref="receivableQrcodeForm" :model="receivableQrcode" label-width="250px">
          <el-form-item prop="ReceivableQrcode" required label="图片">
            <el-upload
              class="avatar-uploader"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleReceivableQrcodeChange"
            >
              <img
                style="max-width: 256px; max-height: 256px"
                v-if="receivableQrcode.ReceivableQrcode"
                :src="receivableQrcode.ReceivableQrcode"
                class="avatar"
                alt=""
              />
              <el-icon v-else class="avatar-uploader-icon">+</el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitForm(receivableQrcodeForm, receivableQrcode)"
              >保存
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>联系客服</span>
        </div>
      </template>
      <div>
        <el-form ref="customerServiceForm" :model="customerService" label-width="250px">
          <el-form-item required prop="CustomerServicePage" label="内容">
            <Editor :editor-config="editorConfig" v-model="customerService.CustomerServicePage" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitForm(customerServiceForm, customerService)"
              >保存
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>关于我们</span>
        </div>
      </template>
      <div>
        <el-form ref="aboutForm" :model="about" label-width="250px">
          <el-form-item required prop="AboutPage" label="内容">
            <Editor :editor-config="editorConfig" v-model="about.AboutPage" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitForm(aboutForm, about)">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </ContentWrap>
</template>

<style scoped lang="less"></style>
