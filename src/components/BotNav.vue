<template>
  <div class="btn-container_foreground" :style="cssVariables">
    <div class="btn-container">
      <div
        v-for="(button, index) in localOptions"
        :key="`label-${index}`"
        :class="{
          [`btn-item-${index} labels`]: true,
          ['checked']: button.isActive,
          ['unchecked']: !button.isActive,
        }"
        @click="handleLabelClick(button)"
      >
        <div class="active-label">
          <div v-if="button.badge" class="btn-badge">
            {{ button.badge }}
          </div>
          <q-icon :name="button.icon" size="1.5rem"/>
          <!-- <slot name="icon" :props="button">
            <i :class="`${button.icon}`" />
          </slot> -->
        </div>

        <div class="btn-title">
          <slot name="title" :props="button">
            {{ button.title }}
          </slot>
        </div>

        <div
          v-if="hasChild(button)"
          :class="{
            ['btn-super-parent']: button.isActive,
            ['btn-class-showable']: showable,
          }"
        >
          <div class="btn-child-parent">
            <div
              v-for="(child, idx) in button.childs || []"
              :key="idx"
              class="btn-child"
              @click.stop="handleChildClick(child)"
            >
              <slot name="child-icon" :props="child">
                <i :class="`${child.icon}`" />
              </slot>

              <span class="btn-child-title">
                <slot name="child-title" :props="child">
                  {{ child.title }}
                </slot>
              </span>

              <div v-if="child.badge" class="btn-child-badge">
                {{ child.badge }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="hasActiveClass" id="sweep">
        <div id="sweep-right" />
        <div id="sweep-center" />
        <div id="sweep-left" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  props: {
    modelValue: {
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    foregroundColor: {
      type: String,
      default: "#42A5F5",
    },
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    iconColor: {
      type: String,
      default: "#0000008A",
    },
    badgeColor: {
      type: String,
      default: "#FBC02D",
    },
    replaceRoute: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();

    const localOptions = ref([]);
    const showable = ref(false);
    const enableWatch = ref(true);

    const cssVariables = computed(() => {
      const countChilds = (
        (localOptions.value.find((option) => option.isActive) || {}).childs ||
        []
      ).length;

      const styles = {
        "--color-foreground": props.foregroundColor,
        "--color-background": props.backgroundColor,
        "--color-icon": props.iconColor,
        "--color-badge": props.badgeColor,
        "--width-parent": `${countChilds * 45}px`,
      };

      return styles;
    });
    const hasActiveClass = computed(() => {
      return localOptions.value.find((option) => option.isActive);
    });

    watch(
      () => props.modelValue,
      (newVal, oldVal) => {
        if (newVal != oldVal && enableWatch.value) {
          const childs = [];
          localOptions.value.forEach((option) => {
            if (option.childs) {
              childs.push(...option.childs);
            }
          });
          const target = [...localOptions.value, ...childs].find(
            (option) => option.id == newVal
          );
          if (target) {
            updateValue(target, hasChild(target));
          }
        }
      }
    );

    watch(
      () => props.options,
      (newVal) => {
        if (newVal) {
          localOptions.value = newVal.map((option) => ({
            ...option,
            isActive: isActive(option),
          }));
          cssLoader();
        }
      },
      { deep: true }
    );

    function cssLoader() {
      let customStyle = "";
      const containerWidth =
        document.querySelector(".btn-container").offsetWidth ||
        window.innerWidth;

      props.options.forEach((item, index) => {
        if (index === 0 && hasChild(item)) {
          customStyle += `
          .btn-item-${index}.checked .btn-class-showable .btn-child-parent {
            transform: translateX(${(item.childs.length * 45) / 2 - 35}px);
            transition: transform 500ms ease 300ms;
          }
          `;
        }

        if (index === props.options.length - 1 && hasChild(item)) {
          customStyle += `
          .btn-item-${index}.checked .btn-class-showable .btn-child-parent {
            transform: translateX(-${(item.childs.length * 45) / 2 - 35}px);
            transition: transform 500ms ease 300ms;
          }
          `;
        }

        customStyle += `
        .btn-item-${index} {
          padding: 10px;
          transition: transform 100ms ease;
          width : ${containerWidth / props.options.length}px !important;
          display: flex;
          justify-content :center;
          align-items : center;
          position: relative;
          z-index: 10;
        }

        .btn-item-${index}.checked ~ #sweep {
          transform: translateX(${
            (index * containerWidth) / props.options.length +
            containerWidth / props.options.length / 4
          }px);
          transition: transform 500ms ease;
        }
        `;

        if (hasChild(item)) {
          item.childs.forEach((child, idx) => {
            customStyle += `
            .btn-item-${index}.checked .btn-class-showable .btn-child:nth-child(${
              idx + 1
            }) {
              transform: translateX(${
                (0.5 + idx) * 45 - (item.childs.length * 45) / 2
              }px);
              transition: transform 500ms ease 300ms;
            }
          `;
          });
        }
      });

      document.getElementById("sweep").style.left = `
      ${containerWidth / props.options.length / 4 - 135 / 2}px`;

      const head = document.getElementsByTagName("head")[0];
      const style = document.createElement("style");
      style.id = "bottom-navigation-style";

      if (style.styleSheet) {
        style.styleSheet.cssText = customStyle;
      } else {
        style.appendChild(document.createTextNode(customStyle));
      }

      head.appendChild(style);
    }
    function handleLabelClick(button) {
      if (!showable.value || button.isActive) {
        toggleClass();
      }

      updateValue(button, hasChild(button));
    }
    function handleChildClick(button) {
      updateValue(button);
      toggleClass();
    }
    function updateValue(button, prevent = false) {
      localOptions.value.forEach(
        (option) => (option.isActive = isActive(option, button.id))
      );

      if (!prevent) {
        emit("update:modelValue", button.id);
        enableWatch.value = false;
        setTimeout(() => {
          enableWatch.value = true;
        }, 0);

        if (button.path && Object.keys(button.path).length) {
          if (props.replaceRoute) {
            router.replace(button.path).catch(() => {});
          } else {
            router.push(button.path);
          }
        }
      }
    }
    function toggleClass() {
      showable.value = !showable.value;
    }
    function isActive(button, value = props.modelValue) {
      return (
        button.id == value ||
        (button.childs || []).find((child) => child.id == value)
      );
    }
    function onResize() {
      nextTick(() => {
        const styleElement = document.getElementById("bottom-navigation-style");
        styleElement && styleElement.remove();
      });

      cssLoader();
    }

    function hasChild(button) {
      return (button.childs || []).length;
    }

    onMounted(() => {
      cssLoader();
      window.addEventListener("resize", onResize);
    });

    onBeforeUnmount(() => window.removeEventListener("resize", onResize));

    localOptions.value = props.options.map((option) => ({
      ...option,
      isActive: isActive(option),
    }));

    return {
      cssVariables,
      handleChildClick,
      handleLabelClick,
      hasChild,
      localOptions,
      hasActiveClass,
      showable,
    };
  },
};
</script>

<style scoped>
.btn-super-parent {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 55px;
  width: var(--width-parent);
  height: 60px;
  z-index: -1;
}

input {
  display: none;
}

.btn-container_foreground {
  position: fixed;
  direction: ltr;
  display: flex;
  align-items: flex-end;
  bottom: 0;
  width: 100%;
  z-index: 2147483647;
  height: 60px;
  background: var(--color-foreground);
}

.btn-container {
  direction: ltr;
  display: flex;
  justify-content: space-around;
  background-color: var(--color-background);
  width: 100%;
  height: 55px;
}

.active-label {
  width: 35px;
  height: 35px;
  border-radius: 40%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 300ms ease;
  position: absolute;
  top: 10px;
  background: var(--color-background) !important;
  color: var(--color-icon);
}

.btn-title {
  position: absolute;
  color: var(--color-icon);
  font-size: 10px;
  line-height: 1.15 !important;
}

.btn-badge {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0px;
  left: 25px;
  border-radius: 50%;
  font-size: 12px;
  color: #fff;
  background: var(--color-badge);
}

.checked .active-label {
  transform: translateY(-10px);
}

.checked .btn-title {
  animation: fadein 200ms;
  position: absolute;
  top: 40px;
}

.unchecked .active-label {
  background: transparent;
}

.unchecked .btn-title {
  visibility: hidden;
}

#sweep {
  height: 100%;
  width: 135px;
  display: flex;
  position: absolute;
  left: 0;
  top: 5px;
}

#sweep-center {
  height: 38px;
  display: flex;
  flex: 1;
  background: var(--color-foreground);
  border-radius: 0 0 45% 45%;
}

#sweep-left {
  height: 33px;
  width: 45px;
  overflow: hidden;
  position: relative;
  right: 2px;
}

#sweep-left:before {
  content: "";
  display: block;
  width: 220%;
  height: 200%;
  position: absolute;
  border-radius: 50%;
  top: 0;
  left: 0;
  box-shadow: -40px -40px 0 0 var(--color-foreground);
}

#sweep-right {
  height: 33px;
  width: 45px;
  overflow: hidden;
  position: relative;
  left: 2px;
}

#sweep-right:before {
  content: "";
  display: block;
  width: 220%;
  height: 200%;
  position: absolute;
  border-radius: 50%;
  top: 0;
  right: 0;
  box-shadow: 40px -40px 0 0 var(--color-foreground);
}

@media screen and (min-width: 576px) {
  .labels {
    cursor: pointer;
  }
}

@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}

/* child */

.btn-child-badge {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -4px;
  left: 20px;
  border-radius: 50%;
  font-size: 12px;
  color: #fff;
  background: var(--color-badge);
  opacity: 0;
}

.btn-child-parent {
  position: absolute;
  bottom: -35px;
  width: 35px;
  height: 35px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-foreground);
}

.btn-child {
  position: absolute;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--color-icon);
}

.btn-child-title {
  font-size: 10px;
  opacity: 0;
  position: absolute;
  top: 37px;
  line-height: 1.15 !important;
}

.unchecked .btn-child-parent {
  background: transparent;
}

.checked .btn-class-showable .btn-child-parent {
  animation: child-background 500ms ease-in-out forwards;
}

.checked .btn-class-showable .btn-child-title {
  animation: child-title 500ms ease-in-out forwards;
}

.checked .btn-class-showable .btn-child-badge {
  animation: child-title 500ms ease-in-out forwards;
}

@keyframes child-title {
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes child-background {
  0% {
    bottom: -30px;
    background: transparent;
  }

  25% {
    bottom: 20px;
    width: 35px;
    height: 35px;
  }

  40% {
    bottom: 20px;
    width: 35px;
    height: 40px;
  }

  100% {
    bottom: 20px;
    width: 100%;
    height: 40px;
  }
}
</style>