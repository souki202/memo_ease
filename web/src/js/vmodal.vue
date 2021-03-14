<template>
    <vue-final-modal
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
    >
        <div class="modal__title">
            <slot name="title"></slot>
        </div>
        <div class="modal__content">
            <slot></slot>
        </div>
        <button class="modal__close btn btn-danger" @click="close">
            <i class="fas fa-times"></i>
        </button>
    </vue-final-modal>
</template>

<script>
    export default {
        name: 'VModal',
        inheritAttrs: false,
        props: ['modalId'],
        methods: {
            close() {
                this.$emit('close', this.modalId);
            }
        }
    }
</script>

<style scoped>
    ::v-deep(.modal-container) {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    ::v-deep(.modal-content) {
        position: relative;
        display: flex;
        flex-direction: column;
        max-width: 1024px;
        max-height: 90%;
        margin: 0 1rem;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.25rem;
        background: #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    .modal__title {
        margin: 0 2.5rem 1rem 0;
        font-size: 1.5rem;
        font-weight: 700;
        border-bottom: 1px var(--modal-separator-color) solid;
    }

    .modal__content {
        flex-grow: 1;
        overflow-y: auto;
    }

    .modal__action {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        padding: 1rem 0 0;
    }

    .modal__close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }

    .dark-mode div ::v-deep(.modal-content) {
        border-color: #2d3748;
        background-color: #1a202c;
    }
</style>