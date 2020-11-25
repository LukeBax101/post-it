<template>
    <b-modal
      :id="id"
      :ref="id"
      :title="title"
      v-on:show="setInitialValues"
      v-on:hidden="resetModal"
      v-on:ok="handleOk"
      :hide-footer="noSubmit"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          v-for="(field, idx) in fields"
          :state="validity[field.id]"
          :label="!field.type.startsWith('button') ? field.label : null"
          :label-for="field.id"
          :invalid-feedback="field.invalidFeedback"
          :key="field.id"
        >
          <div
            v-if="field.type === 'button-dropdown' && field.contents.length > 0"
            class="modal-button-dropdown"
          >
            <b-dropdown :text="field.label" >
              <b-dropdown-item
                href="#"
                v-on:click="field.onClick(item)"
                v-for="(item) in field.contents"
                :key="item.player_id"
              >
              {{ item.name }}
            </b-dropdown-item>
            </b-dropdown>
          </div>
          <div v-else-if="field.type === 'code'" class="modal-code">
            <b-form-input
              v-for="index in field.default.length"
              class="modal-code-text"
              :id="`${field.id}-code-${index}`"
              :key="`${field.id}-code-${index}`"
              :value="values[field.id] ? values[field.id][index - 1] : null"
              type="text"
              required
              maxlength=1
              :autofocus="index === 1"
              v-on:update="(val) => fieldUpdated(field.id, val, index)"
            >
            </b-form-input>
          </div>
          <div v-else-if="field.type === 'button'" class="modal-button">
            <b-button
              :variant="field.variant"
              v-on:click="field.onClick"
            >
              {{ field.label }}
            </b-button>
          </div>
          <div v-else-if="field.type === 'dropdown'">
            <b-form-select
              :id="field.id"
              :value="values[field.id]"
              :options="field.options"
              v-on:input="(val) => fieldUpdated(field.id, val)"
              :state="validity[field.id]"
            ></b-form-select>
          </div>
          <b-form-input
            v-else-if="field.type === 'text'"
            :id="field.id"
            :value="values[field.id]"
            :type="field.type"
            :state="validity[field.id]"
            required
            :autofocus="idx === 0"
            v-on:update="(val) => fieldUpdated(field.id, val)"
          >
          </b-form-input>
        </b-form-group>
      </form>
    </b-modal>
</template>

<script>
import Vue from 'vue';


export default {
  name: 'Modal',
  props: {
    id: String,
    title: String,
    fields: Array,
    noSubmit: Boolean,
  },
  data() {
    return {
      values: {},
      validity: {},
    };
  },
  mounted() {
    this.$root.$on('bv::modal::show', () => {
      this.validity = {};
    });
  },
  destoyed() {
    this.$root.$off('bv::modal::show');
  },
  methods: {
    setInitialValues() {
      const initialFields = this.fields.reduce((acc, field) => (field.default ? ({
        ...acc,
        [field.id]: Array.isArray(field.default) ? [...field.default] : field.default,
      }) : acc), {});
      Object.entries(initialFields).forEach(([key, val]) => {
        Vue.set(this.values, key, val);
      });
    },
    fieldUpdated(id, val, idx) {
      if (idx) {
        const newVal = this.values[id];
        newVal[idx - 1] = val;
        Vue.set(this.values, id, newVal);
        const nextBox = document.getElementById(`${id}-code-${idx + 1}`);
        if (nextBox) nextBox.focus();
      } else {
        Vue.set(this.values, id, val);
      }
      if (this.validity[id] === false) {
        this.validity[id] = this.fields.filter((field) => field.id === id)[0].isValid(val);
      }
    },
    checkFormValidity() {
      this.validity = this.fields.reduce((acc, field) => (
        {
          ...acc,
          [field.id]: !!field.isValid(this.values[field.id]),
        }), {});
      return this.$refs.form.checkValidity() && Object.values(this.validity).every((x) => x);
    },
    resetModal() {
      this.values = {};
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    handleSubmit() {
      if (!this.checkFormValidity()) {
        return;
      }
      this.$emit('submit', this.values);
      this.$nextTick(() => {
        this.$bvModal.hide(this.id);
      });
    },
  },
};
</script>

<style>

.modal-code {
  display: flex;
  justify-content: flex-flex-start;
}

.modal-code-text {
  flex-basis: 35px;
  padding: 11px !important;
  margin: 2px;
}

.modal-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-button>*:first-child {
  width: 60%;
}

.modal-button-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-button-dropdown>*:first-child {
  width: 60%;
}
</style>
