<template>
	<div class="gr-btn-container-foreground shadow-box" :style="cssVariables">
		<div
			v-for="(button, index) in localOptions"
			:key="`grow-button-${index}`"
			:class="[
				'gr-btn-container',
				{ 'gr-btn-container-active': button.selected },
			]"
			@click="handleButtonClick(button, index)"
		>
			<div :class="['gr-btn-item', { 'gr-btn-item-active': button.selected }]">
				<div
					:class="['gr-btn-icon', { 'gr-btn-icon-active': button.selected }]"
				>
					<slot name="icon" :props="button">
						<!-- <i :class="`${button.icon}`" /> -->
						<v-icon>{{ button.icon }}</v-icon>
					</slot>
				</div>
				<div class="gr-btn-title">
					<span class="gr-hidden-title">
						<slot name="title" :props="button">
							{{ button.title }}
						</slot>
					</span>
					<span
						:class="[
							'gr-animated-title',
							{ 'gr-animated-title-active': button.selected },
						]"
					>
						<slot name="title" :props="button">
							{{ button.title }}
						</slot>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	model: {
		prop: "value",
		event: "update",
	},
	props: {
		value: {
			default: null,
		},
		options: {
			type: Array,
			default: () => [],
		},
		color: {
			type: String,
			default: "#108DDF",
		},
		replaceRoute: {
			type: Boolean,
			default: false,
		},
	},
	data: () => ({
		prevSelected: null,
		currSelected: null,
		localOptions: [],
	}),
	computed: {
		cssVariables() {
			const activeTitle = (this.localOptions[this.currSelected] || {}).title;
			let activeWidth = 95;
			if (activeTitle && activeTitle.length * 15 > 110) {
				activeWidth = 95 + (activeTitle.length * 15 - 110) / 2;
			}
			const mainColor =
				(this.localOptions[this.currSelected] || {}).color || this.color;
			const styles = {
				"--color": mainColor,
				"--color-background": mainColor + "30",
				"--active-width": `${activeWidth}px`,
			};
			return styles;
		},
	},
	created() {
		this.localOptions = this.options.slice();
		const index = this.localOptions.findIndex(
			(item) =>
				item.id == this.value ||
				(item.path || {}).name == (this.$route || {}).name
		);
		if (index > -1) {
			this.currSelected = index;
			this.prevSelected = index;
			this.$set(this.localOptions, index, {
				...this.localOptions[index],
				selected: true,
			});
		}
	},
	methods: {
		handleButtonClick(button, index) {
			this.currSelected = index;
			if (this.prevSelected !== null) {
				this.localOptions[this.prevSelected].selected = false;
			}
			this.$set(this.localOptions, index, {
				...this.localOptions[index],
				selected: true,
			});
			this.prevSelected = this.currSelected;
			this.updateValue(button);
		},
		updateValue(button) {
			this.$emit("update", button.id);
			if (button.path && Object.keys(button.path).length) {
				this.$router[!this.replaceRoute ? "push" : "replace"](
					button.path
				).catch(() => {});
			}
		},
	},
};
</script>

<style scoped>
.gr-btn-container-foreground {
	position: absolute;
	direction: ltr;
	display: flex;
	align-items: center;
	bottom: 0;
	width: 100%;
	z-index: 2147483647;
	height: 45px;
	background: #000;
	/* box-shadow: 0 0 5px 0 #eee; */
}
.gr-btn-container {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 45px;
	flex-grow: 1;
	transition: all 0.3s;
}
.gr-btn-container-active {
	background: linear-gradient(
		145deg,
		rgb(16 141 223 / 78%) 0%,
		rgb(8 115 191 / 58%) 41%,
		rgb(12 59 102 / 41%) 100%
	);
	/* border-radius: 100px; */
}
.gr-btn-item {
	display: flex;
	position: relative;
	overflow: hidden;
	width: 24px;
	transition: all 0.3s ease;
	color: #0000008a;
}
.gr-btn-item-active {
	width: 115px;
}
.gr-btn-icon {
	font-size: 20px;
	transition: all 0.3s ease;
	margin: 0px !important;
}
/* .gr-btn-icon-active {
	color: var(--color);
} */
.gr-btn-title {
	position: relative;
	/* color: var(--color); */
	padding: 0px 5px;
	margin-left: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
}
.gr-hidden-title {
	visibility: hidden;
}
.gr-animated-title {
	color: #d7d7d7;
	position: absolute;
	left: 5px;
	bottom: -15px;
	transition: bottom 0.4s ease 0.1s;
}
.gr-animated-title-active {
	bottom: 2px;
}
</style>