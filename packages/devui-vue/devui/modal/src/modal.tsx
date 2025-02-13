import { computed, defineComponent, ref, Teleport, toRefs, Transition } from 'vue';
import { modalProps, ModalProps, ModalType } from './modal-types';
import { Icon } from '../../icon';
import { FixedOverlay } from '../../overlay';
import { useModal, useModalRender } from './composables/use-modal';
import { useDraggable } from './composables/use-draggable';
import DModalHeader from './components/header';
import DModalBody from './components/body';
import { useNamespace } from '../../shared/hooks/use-namespace';
import './modal.scss';

interface TypeList {
  type: ModalType;
  text: string;
  icon: string;
}

export default defineComponent({
  name: 'DModal',
  inheritAttrs: false,
  props: modalProps,
  emits: ['update:modelValue'],
  setup(props: ModalProps, { slots, attrs, emit }) {
    const ns = useNamespace('modal');
    const { modelValue, title, showClose, showOverlay, appendToBody, closeOnClickOverlay } = toRefs(props);
    const { execClose } = useModal(props, emit);
    useModalRender(props);
    const dialogRef = ref<HTMLElement>();
    const headerRef = ref<HTMLElement>();
    const draggable = computed(() => props.draggable);
    useDraggable(dialogRef, headerRef, draggable);

    const renderType = () => {
      const typeList: TypeList[] = [
        {
          type: 'success',
          text: '成功',
          icon: 'right-o',
        },
        {
          type: 'failed',
          text: '错误',
          icon: 'error-o',
        },
        {
          type: 'warning',
          text: '警告',
          icon: 'warning-o',
        },
        {
          type: 'info',
          text: '信息',
          icon: 'info-o',
        },
      ];
      const item = typeList.find((i) => i.type === props.type);
      return (
        <DModalHeader>
          <div class="type-content">
            <div class="type-content-icon">
              <Icon name={item?.icon}></Icon>
            </div>
            <div class="type-content-text">{item?.text}</div>
          </div>
        </DModalHeader>
      );
    };

    return () => (
      <Teleport to="body" disabled={!appendToBody.value}>
        {showOverlay.value && (
          <FixedOverlay
            modelValue={modelValue.value}
            onUpdate:modelValue={execClose}
            class={ns.e('overlay')}
            lock-scroll={false}
            close-on-click-overlay={closeOnClickOverlay.value}
            style={{ zIndex: 'calc(var(--devui-z-index-modal, 1050) - 1)' }}
          />
        )}
        <Transition name={props.showAnimation ? ns.m('wipe') : ''}>
          {modelValue.value && (
            <div ref={dialogRef} class={ns.b()} {...attrs} onClick={(e: Event) => e.stopPropagation()}>
              {showClose.value && (
                <div onClick={execClose} class="btn-close">
                  <Icon name="close" size="20px"></Icon>
                </div>
              )}
              {props.type ? (
                renderType()
              ) : (
                <div style={{ cursor: props.draggable ? 'move' : 'default' }} ref={headerRef}>
                  {slots.header ? slots.header() : title.value && <DModalHeader>{title.value}</DModalHeader>}
                </div>
              )}
              <DModalBody>{slots.default?.()}</DModalBody>
              {slots.footer?.()}
            </div>
          )}
        </Transition>
      </Teleport>
    );
  },
});
