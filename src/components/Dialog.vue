<template>
  <div>
    <q-dialog
      v-model="localModelValue"
      :maximized="false"
      @hide="close"
      :no-backdrop-dismiss="noBackdropDismiss"
      :persistent="persistent"
    >
      <q-card :style="`width: ${width}; max-width: 90vw;`">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ title }}</div>
          <q-space />
          <q-btn icon="close" v-if="cancelShow" flat round dense @click="close" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <slot></slot>
        </q-card-section>

        <q-separator v-if="footerShow" />

        <q-card-actions v-if="footerShow" align="right">
          <q-btn flat label="取消" color="grey-8" v-if="cancelShow" @click="close" />
          <q-btn label="确定" color="primary" type="submit" :loading="dialogVisibleLoading" @click="confirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
  
<script>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '500px',
    },
    modelValue: Boolean,
    footerShow: {
      type: Boolean,
      default: true,
    },
    cancelShow: {
      type: Boolean,
      default: true,
    },
    transitionShow: {
      type: String,
      default: 'fade',
    },
    noBackdropDismiss: {
      type: Boolean,
      default: false,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'confirm', 'reset'],
  setup(props, { emit }) {
    const store = useStore()
    const dialogVisibleLoading = computed(() => store.state.btnLoading)
    const localModelValue = ref(props.modelValue)
    
    watch(() => props.modelValue, (newVal) => {
      localModelValue.value = newVal
    })
    
    watch(localModelValue, (newVal) => {
      emit('update:modelValue', newVal)
    })

    const close = () => {
      emit('update:modelValue', false)
      emit('reset')
    }
    
    const confirm = () => {
      emit('confirm')
    }
    
    return {
      localModelValue,
      close,
      confirm,
      dialogVisibleLoading,
    }
  },
}
</script>
  